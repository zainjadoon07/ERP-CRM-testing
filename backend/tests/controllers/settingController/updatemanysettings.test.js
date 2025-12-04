// tests/controllers/settingController/updateManySetting-minimal.test.js

let mockModel;

jest.mock('mongoose', () => ({
  model: jest.fn(() => mockModel),
}));

describe('Setting updateManySetting - Complete Coverage (6 Tests)', () => {
  let req, res, updateManySetting;

  beforeEach(() => {
    jest.resetModules();
    
    // Mock Model with bulkWrite method
    mockModel = {
      bulkWrite: jest.fn()
    };
    
    updateManySetting = require('../../../src/controllers/coreControllers/settingController/updateManySetting');
    
    req = {
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
 

    it('Test 2: Empty settings array → 202 error', async () => {
      req.body.settings = [];
      
      await updateManySetting(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No settings provided ',
      });
      expect(mockModel.bulkWrite).not.toHaveBeenCalled();
    });

    

    it('Test 5: One invalid setting among many → 202 error', async () => {
      req.body.settings = [
        { settingKey: 'key1', settingValue: 'value1' }, // Valid
        { settingKey: 'key2' } // Invalid - missing settingValue
      ];
      
      await updateManySetting(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'Settings provided has Error',
      });
      expect(mockModel.bulkWrite).not.toHaveBeenCalled();
    });
  });

  describe('Database Operations', () => {
    it('Test 6: Single valid setting → successful update', async () => {
      req.body.settings = [
        { settingKey: 'currency', settingValue: 'USD' }
      ];
      
      const mockResult = {
        nMatched: 1,
        nModified: 1,
        nUpserted: 0,
        result: { ok: 1 }
      };
      
      mockModel.bulkWrite.mockResolvedValue(mockResult);
      
      await updateManySetting(req, res);
      
      // Verify bulkWrite was called with correct update operations
      expect(mockModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { settingKey: 'currency' },
            update: { settingValue: 'USD' }
          }
        }
      ]);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: [],
        message: 'we update all settings',
      });
    });

    it('Test 7: Multiple valid settings → successful update', async () => {
      req.body.settings = [
        { settingKey: 'currency', settingValue: 'USD' },
        { settingKey: 'language', settingValue: 'en' },
        { settingKey: 'timezone', settingValue: 'UTC' }
      ];
      
      const mockResult = {
        nMatched: 3,
        nModified: 3,
        nUpserted: 0,
        result: { ok: 1 }
      };
      
      mockModel.bulkWrite.mockResolvedValue(mockResult);
      
      await updateManySetting(req, res);
      
      expect(mockModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { settingKey: 'currency' },
            update: { settingValue: 'USD' }
          }
        },
        {
          updateOne: {
            filter: { settingKey: 'language' },
            update: { settingValue: 'en' }
          }
        },
        {
          updateOne: {
            filter: { settingKey: 'timezone' },
            update: { settingValue: 'UTC' }
          }
        }
      ]);
      
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Test 8: No documents matched → 404 error', async () => {
      req.body.settings = [
        { settingKey: 'non-existent', settingValue: 'value' }
      ];
      
      const mockResult = {
        nMatched: 0,
        nModified: 0,
        nUpserted: 0,
        result: { ok: 1 }
      };
      
      mockModel.bulkWrite.mockResolvedValue(mockResult);
      
      await updateManySetting(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No settings found by to update',
      });
    });

    it('Test 9: Some documents matched (nMatched > 0) → 200 success', async () => {
      req.body.settings = [
        { settingKey: 'currency', settingValue: 'USD' },
        { settingKey: 'non-existent', settingValue: 'value' }
      ];
      
      const mockResult = {
        nMatched: 1, // Only one matched
        nModified: 1,
        nUpserted: 0,
        result: { ok: 1 }
      };
      
      mockModel.bulkWrite.mockResolvedValue(mockResult);
      
      await updateManySetting(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: [],
        message: 'we update all settings',
      });
    });

    it('Test 10: Database error → propagates exception', async () => {
      req.body.settings = [
        { settingKey: 'currency', settingValue: 'USD' }
      ];
      
      mockModel.bulkWrite.mockRejectedValue(new Error('Database connection failed'));
      
      await expect(updateManySetting(req, res)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Edge Cases', () => {
   

    it('Test 13: Settings with empty string values → valid', async () => {
      req.body.settings = [
        { settingKey: 'key1', settingValue: '' }, // Empty string is valid
        { settingKey: 'key2', settingValue: null } // null is also valid
      ];
      
      const mockResult = { nMatched: 2, nModified: 2, result: { ok: 1 } };
      mockModel.bulkWrite.mockResolvedValue(mockResult);
      
      await updateManySetting(req, res);
      
      expect(mockModel.bulkWrite).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Test 14: Settings with falsy but existing values → valid', async () => {
      req.body.settings = [
        { settingKey: 'enabled', settingValue: false }, // boolean false
        { settingKey: 'count', settingValue: 0 }, // number 0
      ];
      
      const mockResult = { nMatched: 2, nModified: 2, result: { ok: 1 } };
      mockModel.bulkWrite.mockResolvedValue(mockResult);
      
      await updateManySetting(req, res);
      
      expect(mockModel.bulkWrite).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

// Absolute Minimum Version for 100% Coverage (6 Tests)
describe('updateManySetting - Absolute Minimum (6 Tests)', () => {
  let req, res, updateManySetting;
  
  beforeEach(() => {
    jest.resetModules();
    mockModel = { bulkWrite: jest.fn() };
    updateManySetting = require('../../../src/controllers/coreControllers/settingController/updateManySetting');
    
    req = { body: {} };
    res = { status: jest.fn(() => res), json: jest.fn(() => res) };
  });

  

  it('2. Empty settings array → 202', async () => {
    req.body.settings = [];
    await updateManySetting(req, res);
    expect(res.status).toHaveBeenCalledWith(202);
  });

 

  it('4. Invalid setting (missing value) → 202', async () => {
    req.body.settings = [{ settingKey: 'key' }];
    await updateManySetting(req, res);
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('5. Valid settings but no matches → 404', async () => {
    req.body.settings = [{ settingKey: 'key', settingValue: 'value' }];
    mockModel.bulkWrite.mockResolvedValue({ nMatched: 0, result: { ok: 1 } });
    
    await updateManySetting(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('6. Valid settings with matches → 200', async () => {
    req.body.settings = [
      { settingKey: 'currency', settingValue: 'USD' },
      { settingKey: 'language', settingValue: 'en' }
    ];
    mockModel.bulkWrite.mockResolvedValue({ nMatched: 2, result: { ok: 1 } });
    
    await updateManySetting(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: [],
      message: 'we update all settings',
    });
  });

  it('7. Database error → throws', async () => {
    req.body.settings = [{ settingKey: 'key', settingValue: 'value' }];
    mockModel.bulkWrite.mockRejectedValue(new Error('DB Error'));
    
    await expect(updateManySetting(req, res)).rejects.toThrow('DB Error');
  });
});