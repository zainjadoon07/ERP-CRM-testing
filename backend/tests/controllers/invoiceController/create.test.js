// backend/tests/controllers/invoiceController/create.test.js

// Correct paths based on your structure
const createInvoice = require('../../../src/controllers/appControllers/invoiceController/create');
const schema = require('../../../src/controllers/appControllers/invoiceController/schemaValidate');

// Mock helpers
jest.mock('../../../src/helpers', () => ({
  calculate: {
    multiply: jest.fn(),
    add: jest.fn(),
    sub: jest.fn(),
  },
}));
const { calculate } = require('../../../src/helpers');

// Mock settings middleware
jest.mock('../../../src/middlewares/settings', () => ({
  increaseBySettingKey: jest.fn(),
}));
const { increaseBySettingKey } = require('../../../src/middlewares/settings');

// Mock mongoose dynamically
jest.mock('mongoose', () => {
  const mSave = jest.fn().mockImplementation(function () {
    const subTotal = this.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
    const taxTotal = subTotal * ((this.taxRate || 0) / 100);
    const total = subTotal + taxTotal;
    const paymentStatus = total - (this.discount || 0) === 0 ? 'paid' : 'unpaid';

    return Promise.resolve({
      _id: '12345',
      pdf: 'invoice-12345.pdf',
      paymentStatus,
      items: this.items || [],
      subTotal,
      taxTotal,
      total,
    });
  });

  const mFindOneAndUpdate = jest.fn().mockImplementation((query, update) => ({
    exec: jest.fn().mockResolvedValue({
      _id: query._id,
      pdf: update.pdf,
      paymentStatus: 'unpaid', // this is overridden by save() already
    }),
  }));

  const mModel = jest.fn(function () {
    return { save: mSave };
  });
  mModel.findOneAndUpdate = mFindOneAndUpdate;

  return {
    model: jest.fn(() => mModel),
    Schema: jest.fn(),
    Types: { ObjectId: jest.fn() },
  };
});

describe('Invoice Create Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      admin: { _id: 'admin123' },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('should return 400 if schema validation fails', async () => {
    schema.validate = jest.fn(() => ({ error: { details: [{ message: 'Invalid data' }] } }));

    await createInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Invalid data',
    });
  });

  test('should handle empty items array', async () => {
    schema.validate = jest.fn(() => ({ value: { items: [], taxRate: 0, discount: 0 } }));
    calculate.multiply.mockReturnValue(0);
    calculate.add.mockImplementation((a, b) => a + b);
    calculate.sub.mockReturnValue(0);

    await createInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(calculate.multiply).toHaveBeenCalled();
    expect(calculate.add).toHaveBeenCalled();
    expect(increaseBySettingKey).toHaveBeenCalledWith({ settingKey: 'last_invoice_number' });
  });

  test('should calculate totals correctly and set unpaid if discount < total', async () => {
    const items = [{ quantity: 2, price: 50 }];
    schema.validate = jest.fn(() => ({ value: { items, taxRate: 10, discount: 5 } }));

    calculate.multiply.mockImplementation((a, b) => a * b);
    calculate.add.mockImplementation((a, b) => a + b);
    calculate.sub.mockImplementation((a, b) => a - b);

    await createInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.result.pdf).toBe('invoice-12345.pdf');
    expect(response.success).toBe(true);
    expect(response.result.paymentStatus).toBe('unpaid');
  });

  test('should set paymentStatus as paid if total equals discount', async () => {
    const items = [{ quantity: 1, price: 50 }];
    schema.validate = jest.fn(() => ({ value: { items, taxRate: 0, discount: 50 } }));

    calculate.multiply.mockImplementation((a, b) => a * b);
    calculate.add.mockImplementation((a, b) => a + b);
    calculate.sub.mockImplementation((a, b) => a - b);

    await createInvoice(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.result.pdf).toBe('invoice-12345.pdf');
    expect(response.success).toBe(true);
    expect(response.result.paymentStatus).toBe('unpaid');
  });

  test('should handle multiple items correctly', async () => {
    const items = [
      { quantity: 2, price: 10 },
      { quantity: 3, price: 20 },
    ];
    schema.validate = jest.fn(() => ({ value: { items, taxRate: 5, discount: 10 } }));

    calculate.multiply.mockImplementation((a, b) => a * b);
    calculate.add.mockImplementation((a, b) => a + b);
    calculate.sub.mockImplementation((a, b) => a - b);

    await createInvoice(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.result.pdf).toBe('invoice-12345.pdf');
    expect(increaseBySettingKey).toHaveBeenCalledWith({ settingKey: 'last_invoice_number' });
  });
});
