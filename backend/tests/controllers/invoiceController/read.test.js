// backend/tests/controllers/invoiceController/read.test.js

const readInvoice = require('../../../src/controllers/appControllers/invoiceController/read');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const mExec = jest.fn();
  const mPopulate = jest.fn(() => ({ exec: mExec }));
  const mFindOne = jest.fn(() => ({ populate: mPopulate }));
  const mModel = jest.fn(() => ({ findOne: mFindOne }));
  return { model: jest.fn(() => mModel()), Schema: jest.fn(), Types: { ObjectId: jest.fn() } };
});

describe('Invoice Read Controller', () => {
  let req;
  let res;
  let InvoiceMock;

  beforeEach(() => {
    InvoiceMock = mongoose.model('Invoice');
    req = { params: { id: 'invoice123' } };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('should return 404 if invoice not found', async () => {
    InvoiceMock.findOne().populate().exec.mockResolvedValue(null);

    await readInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No document found ',
    });
  });

  test('should return 200 if invoice found', async () => {
    const mockInvoice = { _id: 'invoice123', name: 'Test Invoice' };
    InvoiceMock.findOne().populate().exec.mockResolvedValue(mockInvoice);

    await readInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockInvoice,
      message: 'we found this document ',
    });
  });

  test('should call findOne with correct query', async () => {
    const spyFindOne = InvoiceMock.findOne;
    await readInvoice(req, res);
    expect(spyFindOne).toHaveBeenCalledWith({ _id: 'invoice123', removed: false });
  });
});
