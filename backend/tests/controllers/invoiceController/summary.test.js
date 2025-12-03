// backend/tests/controllers/invoiceController/summary.test.js

const summary = require('../../../src/controllers/appControllers/invoiceController/summary');
const mongoose = require('mongoose');
const moment = require('moment');
const { loadSettings } = require('../../../src/middlewares/settings');

jest.mock('../../../src/middlewares/settings', () => ({
  loadSettings: jest.fn(),
}));

jest.mock('mongoose', () => {
  const mAggregate = jest.fn();
  const mModel = jest.fn(() => ({
    aggregate: mAggregate,
  }));
  return {
    model: jest.fn(() => ({
      aggregate: mAggregate,
    })),
    Schema: jest.fn(),
    Types: { ObjectId: jest.fn() },
  };
});

describe('Invoice Summary Controller', () => {
  let req;
  let res;
  let InvoiceMock;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    InvoiceMock = mongoose.model('Invoice');
  });

  test('should return 400 if type is invalid', async () => {
    req.query.type = 'invalidType';

    await summary(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Invalid type',
    });
  });

  test('should return summary for default month', async () => {
    req.query = {}; // no type passed

    loadSettings.mockResolvedValue({});

    const mockAggregateResponse = [
      {
        totalInvoice: [{ total: 1000, count: 10 }],
        statusCounts: [{ status: 'draft', count: 2 }],
        paymentStatusCounts: [{ status: 'unpaid', count: 3 }],
        overdueCounts: [],
      },
    ];

    InvoiceMock.aggregate.mockResolvedValueOnce(mockAggregateResponse);
    InvoiceMock.aggregate.mockResolvedValueOnce([{ total_amount: 200 }]); // unpaid

    await summary(req, res);

    expect(InvoiceMock.aggregate).toHaveBeenCalledTimes(2);

    const response = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(response.success).toBe(true);
    expect(response.result.total).toBe(1000);
    expect(response.result.total_undue).toBe(200);
    expect(response.result.performance.length).toBeGreaterThan(0);
  });

  test('should return summary for type "year"', async () => {
    req.query.type = 'year';
    loadSettings.mockResolvedValue({});

    const mockAggregateResponse = [
      {
        totalInvoice: [{ total: 5000, count: 50 }],
        statusCounts: [{ status: 'paid', count: 30 }],
        paymentStatusCounts: [{ status: 'unpaid', count: 10 }],
        overdueCounts: [],
      },
    ];

    InvoiceMock.aggregate.mockResolvedValueOnce(mockAggregateResponse);
    InvoiceMock.aggregate.mockResolvedValueOnce([{ total_amount: 1000 }]); // unpaid

    await summary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.result.total).toBe(5000);
    expect(response.result.total_undue).toBe(1000);
  });
});
