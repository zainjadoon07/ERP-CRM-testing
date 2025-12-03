const removePayment = require('../../../src/controllers/appControllers/paymentController/remove');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');

  const PaymentMock = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(() => ({ exec: jest.fn() })), // <- fix: return object with exec
  };
  const InvoiceMock = {
    findOneAndUpdate: jest.fn(() => ({ exec: jest.fn() })),
  };

  return {
    ...actualMongoose,
    model: jest.fn((name) => {
      if (name === 'Payment') return PaymentMock;
      if (name === 'Invoice') return InvoiceMock;
    }),
  };
});

describe('Payment Remove Controller', () => {
  let req;
  let res;
  let PaymentMock;
  let InvoiceMock;

  beforeEach(() => {
    PaymentMock = mongoose.model('Payment');
    InvoiceMock = mongoose.model('Invoice');

    req = {
      params: { id: 'payment123' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should return 404 if payment not found', async () => {
    PaymentMock.findOne.mockResolvedValue(null);

    await removePayment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No document found ',
    });
  });

  it('should remove payment and update invoice correctly', async () => {
    const mockPayment = {
      _id: 'payment123',
      amount: 100,
      invoice: {
        id: 'invoice123',
        total: 500,
        discount: 50,
        credit: 200,
      },
    };

    PaymentMock.findOne.mockResolvedValue(mockPayment);
    // Mock exec to return the updated payment
    const paymentExecMock = jest.fn().mockResolvedValue({ ...mockPayment, removed: true });
    PaymentMock.findOneAndUpdate.mockReturnValue({ exec: paymentExecMock });

    const invoiceExecMock = jest.fn().mockResolvedValue({ _id: 'invoice123', paymentStatus: 'partially', credit: 100 });
    InvoiceMock.findOneAndUpdate.mockReturnValue({ exec: invoiceExecMock });

    await removePayment(req, res);

    expect(PaymentMock.findOne).toHaveBeenCalledWith({ _id: 'payment123', removed: false });
    expect(PaymentMock.findOneAndUpdate).toHaveBeenCalled();
    expect(InvoiceMock.findOneAndUpdate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: { ...mockPayment, removed: true },
      message: 'Successfully Deleted the document ',
    });
  });
});
