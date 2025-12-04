// tests/controllers/settingController/updateBySettingKey-minimal.test.js

let mockModel;

jest.mock('mongoose', () => ({
  model: jest.fn(() => mockModel),
}));

describe('Setting updateBySettingKey - Complete Coverage (7 Tests)', () => {
  let req, res, updateBySettingKey;

  beforeEach(() => {
    jest.resetModules();
    
    // Mock findOneAndUpdate to return a promise-like object with exec()
    mockModel = {
      findOneAndUpdate: jest.fn(() => ({
        exec: jest.fn()
      }))
    };
    
    updateBySettingKey = require('../../../src/controllers/coreControllers/settingController/updateBySettingKey');
    
    req = {
      params: {},
      body: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Errors', () => {
    it('Test 1: No settingKey in params → 202 error', async () => {
      req.params = {};
      req.body.settingValue = 'USD';
      
      await updateBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No settingKey provided ',
      });
      expect(mockModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('Test 2: Empty settingKey string → 202 error', async () => {
      req.params.settingKey = '';
      req.body.settingValue = 'USD';
      
      await updateBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No settingKey provided ',
      });
    });

    it('Test 3: No settingValue in body → 202 error', async () => {
      req.params.settingKey = 'currency';
      req.body = {}; // No settingValue
      
      await updateBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No settingValue provided ',
      });
      expect(mockModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('Test 4: Empty settingValue string → 202 error', async () => {
      req.params.settingKey = 'currency';
      req.body.settingValue = '';
      
      await updateBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No settingValue provided ',
      });
    });

    it('Test 5: settingValue is null → 202 error', async () => {
      req.params.settingKey = 'currency';
      req.body.settingValue = null;
      
      await updateBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No settingValue provided ',
      });
    });
  });

  describe('Database Operations', () => {
    it('Test 6: Document found and updated → 200 success', async () => {
      req.params.settingKey = 'currency';
      req.body.settingValue = 'USD';
      
      const mockResult = {
        _id: '1',
        settingKey: 'currency',
        settingValue: 'USD',
        updatedAt: new Date()
      };
      
      // Mock exec to resolve with result
      const mockExec = jest.fn().mockResolvedValue(mockResult);
      mockModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
      
      await updateBySettingKey(req, res);
      
      // Verify findOneAndUpdate was called with correct arguments
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { settingKey: 'currency' },
        { settingValue: 'USD' },
        {
          new: true,
          runValidators: true,
        }
      );
      
      // Verify exec was called
      expect(mockExec).toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: mockResult,
        message: 'we update this document by this settingKey: currency',
      });
    });

    it('Test 7: Document not found → 404 error', async () => {
      req.params.settingKey = 'invalid-key';
      req.body.settingValue = 'someValue';
      
      // Mock exec to resolve with null (not found)
      const mockExec = jest.fn().mockResolvedValue(null);
      mockModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
      
      await updateBySettingKey(req, res);
      
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { settingKey: 'invalid-key' },
        { settingValue: 'someValue' },
        {
          new: true,
          runValidators: true,
        }
      );
      expect(mockExec).toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No document found by this settingKey: invalid-key',
      });
    });

    it('Test 8: Database error → propagates exception', async () => {
      req.params.settingKey = 'currency';
      req.body.settingValue = 'USD';
      
      // Mock exec to reject with error
      const mockExec = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      mockModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
      
      // Expect the promise to reject
      await expect(updateBySettingKey(req, res)).rejects.toThrow('Database connection failed');
      
      expect(mockExec).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('Test 9: settingKey is undefined explicitly → 202 error', async () => {
      req.params.settingKey = undefined;
      req.body.settingValue = 'test';
      
      await updateBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
    });

    it('Test 10: settingValue is undefined → 202 error', async () => {
      req.params.settingKey = 'test';
      req.body.settingValue = undefined;
      
      await updateBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
    });

    it('Test 11: settingKey is 0 (falsy number) → 202 error', async () => {
      req.params.settingKey = 0;
      req.body.settingValue = 'test';
      
      await updateBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
    });

  
  });
});

// Alternative: Minimal version with just essential tests for 100% coverage
describe('UpdateBySettingKey - Absolute Minimum (5 Tests)', () => {
  let req, res, updateBySettingKey;
  
  beforeEach(() => {
    jest.resetModules();
    mockModel = {
      findOneAndUpdate: jest.fn(() => ({
        exec: jest.fn()
      }))
    };
    
    updateBySettingKey = require('../../../src/controllers/coreControllers/settingController/updateBySettingKey');
    
    req = { params: {}, body: {} };
    res = { status: jest.fn(() => res), json: jest.fn(() => res) };
  });

  it('1. No settingKey → 202', async () => {
    await updateBySettingKey(req, res);
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('2. No settingValue → 202', async () => {
    req.params.settingKey = 'test';
    await updateBySettingKey(req, res);
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('3. Update successful → 200', async () => {
    req.params.settingKey = 'test';
    req.body.settingValue = 'value';
    
    const mockResult = { _id: '1', settingKey: 'test', settingValue: 'value' };
    const mockExec = jest.fn().mockResolvedValue(mockResult);
    mockModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await updateBySettingKey(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('4. Document not found → 404', async () => {
    req.params.settingKey = 'test';
    req.body.settingValue = 'value';
    
    const mockExec = jest.fn().mockResolvedValue(null);
    mockModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await updateBySettingKey(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('5. Database error → throws', async () => {
    req.params.settingKey = 'test';
    req.body.settingValue = 'value';
    
    const mockExec = jest.fn().mockRejectedValue(new Error('DB Error'));
    mockModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await expect(updateBySettingKey(req, res)).rejects.toThrow('DB Error');
  });
});