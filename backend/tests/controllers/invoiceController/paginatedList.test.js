// backend/tests/controllers/invoiceController/paginatedList.test.js

const paginatedList = require('../../../src/controllers/appControllers/invoiceController/paginatedList');
const mongoose = require('mongoose');

// Mock mongoose
jest.mock('mongoose', () => {
  const mExec = jest.fn();
  const mPopulate = jest.fn(() => ({ exec: mExec }));
  const mFind = jest.fn(() => ({ skip: jest.fn(() => ({ limit: jest.fn(() => ({ sort: jest.fn(() => ({ populate: mPopulate })) })) })) }));
  const mCountDocuments = jest.fn();
  const mModel = jest.fn(() => ({ find: mFind, countDocuments: mCountDocuments }));
  return { model: jest.fn(() => mModel()), Schema: jest.fn(), Types: { ObjectId: jest.fn() } };
});

describe('Invoice Paginated List Controller', () => {
  let req;
  let res;
  let InvoiceMock;

  beforeEach(() => {
    InvoiceMock = mongoose.model('Invoice');
    req = { query: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('should return empty collection with 203 if no invoices found', async () => {
    InvoiceMock.find().skip().limit().sort().populate().exec.mockResolvedValue([]);
    InvoiceMock.countDocuments.mockResolvedValue(0);

    await paginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(203);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: [],
      pagination: { page: 1, pages: 0, count: 0 },
      message: 'Collection is Empty',
    });
  });

  test('should return paginated results with 200 if invoices exist', async () => {
    const mockInvoices = [
      { _id: '1', name: 'Invoice 1' },
      { _id: '2', name: 'Invoice 2' },
    ];
    InvoiceMock.find().skip().limit().sort().populate().exec.mockResolvedValue(mockInvoices);
    InvoiceMock.countDocuments.mockResolvedValue(2);

    await paginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockInvoices,
      pagination: { page: 1, pages: 1, count: 2 },
      message: 'Successfully found all documents',
    });
  });

  test('should handle query parameters for page and limit', async () => {
    req.query.page = '2';
    req.query.items = '5';
    const mockInvoices = [{ _id: '3', name: 'Invoice 3' }];
    InvoiceMock.find().skip().limit().sort().populate().exec.mockResolvedValue(mockInvoices);
    InvoiceMock.countDocuments.mockResolvedValue(6);

    await paginatedList(req, res);

    expect(InvoiceMock.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].pagination).toEqual({ page: '2', pages: 2, count: 6 });
  });

  test('should handle filtering and search fields', async () => {
    req.query.filter = 'status';
    req.query.equal = 'paid';
    req.query.q = 'Invoice';
    req.query.fields = 'name,description';

    const mockInvoices = [{ _id: '4', name: 'Invoice Paid', description: 'desc' }];
    InvoiceMock.find().skip().limit().sort().populate().exec.mockResolvedValue(mockInvoices);
    InvoiceMock.countDocuments.mockResolvedValue(1);

    await paginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.result).toEqual(mockInvoices);
    expect(response.pagination.count).toBe(1);
  });

  test('should apply sorting correctly', async () => {
    req.query.sortBy = 'createdAt';
    req.query.sortValue = '-1';

    const mockInvoices = [{ _id: '5', name: 'Sorted Invoice' }];
    InvoiceMock.find().skip().limit().sort().populate().exec.mockResolvedValue(mockInvoices);
    InvoiceMock.countDocuments.mockResolvedValue(1);

    await paginatedList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].result).toEqual(mockInvoices);
  });
});
