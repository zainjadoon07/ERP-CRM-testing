// backend/tests/controllers/invoiceController/remove.test.js
const removeInvoice = require('../../../src/controllers/appControllers/invoiceController/remove');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const mExec = jest.fn();
  const mInvoiceModel = {
    findOneAndUpdate: jest.fn(() => ({ exec: mExec })),
  };
  const mPaymentModel = {
    updateMany: jest.fn(),
  };
  return {
    model: jest.fn((name) => {
      if (name === 'Invoice') return mInvoiceModel;
      if (name === 'Payment') return mPaymentModel;
    }),
    Schema: jest.fn(),
    Types: { ObjectId: jest.fn() },
  };
});

describe('Invoice Remove Controller', () => {
  let req;
  let res;
  let InvoiceMock;
  let PaymentMock;

  beforeEach(() => {
    // get the mocks directly from mongoose.model()
    InvoiceMock = mongoose.model('Invoice');
    PaymentMock = mongoose.model('Payment');

    req = { params: { id: 'invoice123' } };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Clear previous mock calls
    jest.clearAllMocks();
  });

  test('should return 404 if invoice not found', async () => {
    // Set the mock to return null
    InvoiceMock.findOneAndUpdate().exec.mockResolvedValueOnce(null);

    await removeInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Invoice not found',
    });
  });

  test('should delete invoice and update payments', async () => {
    const mockInvoice = { _id: 'invoice123', name: 'Test Invoice' };
    // Mock invoice findOneAndUpdate to return a document
    InvoiceMock.findOneAndUpdate().exec.mockResolvedValueOnce(mockInvoice);
    // Mock Payment.updateMany
    PaymentMock.updateMany.mockResolvedValueOnce({ modifiedCount: 2 });

    await removeInvoice(req, res);

    expect(InvoiceMock.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'invoice123', removed: false },
      { $set: { removed: true } }
    );
    expect(PaymentMock.updateMany).toHaveBeenCalledWith(
      { invoice: mockInvoice._id },
      { $set: { removed: true } }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockInvoice,
      message: 'Invoice deleted successfully',
    });
  });
});
