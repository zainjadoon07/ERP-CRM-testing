// tests/controllers/quoteController/create.test.js

// Mock all external dependencies BEFORE importing the controller
jest.mock('mongoose', () => ({
  model: jest.fn(),
}));

jest.mock('../../../src/middlewares/settings', () => ({
  increaseBySettingKey: jest.fn(),
}));

jest.mock('../../../src/helpers', () => ({
  calculate: {
    multiply: jest.fn(),
    add: jest.fn(),
  },
}));

let create;

// Now import the controller and mocked dependencies
const mongoose = require('mongoose');
const { increaseBySettingKey } = require('../../../src/middlewares/settings');
const { calculate } = require('../../../src/helpers');

describe('Quote Create Controller - Decision/Conditional Testing', () => {
  let req, res, mockSave, mockFindOneAndUpdate, mockExec;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock save function
    mockSave = jest.fn();
    mockExec = jest.fn();
    mockFindOneAndUpdate = jest.fn();
    
    // Create a proper constructor mock
    const MockModel = jest.fn(function(body) {
      this.save = mockSave;
      this._id = 'mock-quote-id-123';
      return this;
    });
    
    // Add static methods to the constructor
    // Note: findOneAndUpdate returns a query object that has .exec()
    mockFindOneAndUpdate.mockReturnValue({
      exec: mockExec
    });
    MockModel.findOneAndUpdate = mockFindOneAndUpdate;
    
    // Mock mongoose.model to return our constructor
    mongoose.model.mockImplementation(() => MockModel);
    
    // Import controller AFTER mocks are set up
    create = require('../../../src/controllers/appControllers/quoteController/create');

    // Create mock request and response
    req = {
      body: {
        items: [],
        taxRate: 0,
        discount: 0,
      },
      admin: {
        _id: 'admin-id-123',
      },
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Default mock implementations
    calculate.multiply.mockImplementation((a, b) => a * b);
    calculate.add.mockImplementation((a, b) => a + b);
    
    // Note: increaseBySettingKey doesn't use await in the controller
    increaseBySettingKey.mockReturnValue();
    
    // Default mock returns
    mockSave.mockResolvedValue({
      _id: 'mock-quote-id-123',
      ...req.body
    });
    
    mockExec.mockResolvedValue({
      _id: 'mock-quote-id-123',
      pdf: 'quote-mock-quote-id-123.pdf',
      subTotal: 0,
      taxTotal: 0,
      total: 0,
      items: [],
      createdBy: 'admin-id-123',
      ...req.body
    });
  });

  describe('Input Validation and Edge Cases', () => {
    it('should handle empty items array', async () => {
      req.body.items = [];
      req.body.taxRate = 10;
      
      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Quote created successfully',
        })
      );
    });

    it('should handle items with quantity and price', async () => {
      req.body.items = [
        { quantity: 2, price: 50, name: 'Item 1' },
        { quantity: 3, price: 30, name: 'Item 2' },
      ];
      req.body.taxRate = 15;

      await create(req, res);

      // Verify calculations were called
      expect(calculate.multiply).toHaveBeenCalledWith(2, 50);
      expect(calculate.multiply).toHaveBeenCalledWith(3, 30);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should handle zero tax rate', async () => {
      req.body.items = [{ quantity: 1, price: 100 }];
      req.body.taxRate = 0;

      await create(req, res);

      // taxTotal should be 0 when taxRate is 0
      expect(calculate.multiply).toHaveBeenCalledWith(100, 0);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle negative tax rate (edge case)', async () => {
      req.body.items = [{ quantity: 1, price: 100 }];
      req.body.taxRate = -10;

      await create(req, res);

      // Should still calculate with negative tax rate
      expect(calculate.multiply).toHaveBeenCalledWith(100, -0.1);
      expect(calculate.add).toHaveBeenCalledWith(100, -10);
    });

    it('should handle decimal quantities and prices', async () => {
      req.body.items = [
        { quantity: 1.5, price: 49.99 },
        { quantity: 2.25, price: 19.95 },
      ];

      await create(req, res);

      expect(calculate.multiply).toHaveBeenCalledWith(1.5, 49.99);
      expect(calculate.multiply).toHaveBeenCalledWith(2.25, 19.95);
    });
  });

  describe('Calculation Logic Tests', () => {
    it('should calculate correct totals for single item', async () => {
      req.body.items = [{ quantity: 5, price: 20 }];
      req.body.taxRate = 10;

      await create(req, res);

      expect(calculate.multiply).toHaveBeenCalledWith(5, 20);
      expect(calculate.multiply).toHaveBeenCalledWith(100, 0.1);
      expect(calculate.add).toHaveBeenCalledWith(100, 10);
    });

    it('should calculate correct totals for multiple items', async () => {
      req.body.items = [
        { quantity: 2, price: 25 },
        { quantity: 4, price: 12.5 },
      ];
      req.body.taxRate = 20;

      await create(req, res);

      expect(calculate.multiply).toHaveBeenCalledWith(2, 25);
      expect(calculate.multiply).toHaveBeenCalledWith(4, 12.5);
      expect(calculate.multiply).toHaveBeenCalledWith(100, 0.2);
    });

    it('should add total property to each item', async () => {
      req.body.items = [
        { quantity: 3, price: 10, name: 'Item A' },
        { quantity: 1, price: 25, name: 'Item B' },
      ];

      await create(req, res);

      // The items array should have total property added
      expect(req.body.items[0].total).toBeDefined();
      expect(req.body.items[1].total).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should propagate database save error', async () => {
      mockSave.mockRejectedValue(new Error('Database save failed'));
      
      await expect(create(req, res)).rejects.toThrow('Database save failed');
    });

    it('should propagate settings update error', async () => {
      increaseBySettingKey.mockImplementation(() => {
        throw new Error('Settings update failed');
      });
      
      await expect(create(req, res)).rejects.toThrow('Settings update failed');
    });

    it('should handle missing admin (createdBy)', async () => {
      req.admin = undefined;
      
      await expect(create(req, res)).rejects.toThrow();
    });

    it('should handle calculation errors', async () => {
      calculate.multiply.mockImplementation(() => {
        throw new Error('Calculation error');
      });
      
      await expect(create(req, res)).rejects.toThrow('Calculation error');
    });
  });

  describe('Settings Integration', () => {
    it('should increase last_quote_number setting', async () => {
      await create(req, res);

      expect(increaseBySettingKey).toHaveBeenCalledWith({
        settingKey: 'last_quote_number',
      });
    });

   
  });

  describe('Response Validation', () => {
    it('should return 200 status on success', async () => {
      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return success: true in response', async () => {
      await create(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });


    it('should return correct success message', async () => {
      await create(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Quote created successfully',
        })
      );
    });
  });

  describe('Additional Edge Cases', () => {
    it('should handle missing taxRate field', async () => {
      delete req.body.taxRate;
      req.body.items = [{ quantity: 1, price: 100 }];
      
      await create(req, res);

      // taxRate should default to 0 from destructuring
      expect(calculate.multiply).toHaveBeenCalledWith(100, 0);
    });

    it('should handle missing discount field', async () => {
      delete req.body.discount;
      req.body.items = [{ quantity: 1, price: 100 }];
      
      await create(req, res);

      // Should still work without discount
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('should handle items without name property', async () => {
      req.body.items = [
        { quantity: 2, price: 50 },
        { quantity: 1, price: 100 },
      ];
      
      await create(req, res);

      // Should still calculate totals
      expect(calculate.multiply).toHaveBeenCalledWith(2, 50);
      expect(calculate.multiply).toHaveBeenCalledWith(1, 100);
    });

    it('should handle very large numbers', async () => {
      req.body.items = [
        { quantity: 10000, price: 9999.99 },
      ];
      req.body.taxRate = 20;
      
      await create(req, res);

      // Should handle large calculations
      expect(calculate.multiply).toHaveBeenCalledWith(10000, 9999.99);
      expect(calculate.multiply).toHaveBeenCalledWith(99999900, 0.2);
    });
  });
});