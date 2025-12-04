// tests/controllers/settingController/listBySettingKey.test.js

// ====================================================
// STEP 1: Module-scoped mock variables
// ====================================================
let mockModel;

// ====================================================
// STEP 2: Jest mock setup
// ====================================================
jest.mock('mongoose', () => ({
  model: jest.fn(() => mockModel),
}));

// ====================================================
// Test Suite
// ====================================================
describe('Setting ListBySettingKey Controller', () => {
  let req, res;
  let listBySettingKey;

  beforeEach(() => {
    // ====================================================
    // STEP 3: Reset modules
    // ====================================================
    jest.resetModules();
    
    // ====================================================
    // STEP 4: Create fresh mock Model
    // ====================================================
    mockModel = {
      find: jest.fn(),
    };
    
    // ====================================================
    // STEP 5: Import controller
    // ====================================================
    listBySettingKey = require('../../../src/controllers/coreControllers/settingController/listBySettingKey');
    
    // ====================================================
    // STEP 6: Create fresh request/response
    // ====================================================
    req = {
      query: {},
    };
    
    res = {
  status: jest.fn(() => res),
  json: jest.fn(() => res), // returns res for chaining
  end: jest.fn(),
};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ====================================================
  // TEST CASES
  // ====================================================

 
  describe('With Setting Key Array', () => {
    it('should return 200 with results when settings found', async () => {
      // Arrange
      req.query.settingKeyArray = 'currency,timezone,language';
      
      const mockResults = [
        { _id: '1', settingKey: 'currency', value: 'USD' },
        { _id: '2', settingKey: 'timezone', value: 'UTC' },
      ];
      
      // Mock find() to return query with where() that returns results
      const mockWhere = jest.fn().mockResolvedValue(mockResults);
      const mockFind = {
        where: mockWhere,
      };
      
      mockModel.find.mockReturnValue(mockFind);
      
      // Act
      await listBySettingKey(req, res);
      
      // Assert
      expect(mockModel.find).toHaveBeenCalledWith({
        $or: [
          { settingKey: 'currency' },
          { settingKey: 'timezone' },
          { settingKey: 'language' },
        ],
      });
      expect(mockWhere).toHaveBeenCalledWith('removed', false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: mockResults,
        message: 'Successfully found all documents',
      });
      expect(res.end).not.toHaveBeenCalled();
    });


    it('should handle single setting key', async () => {
      // Arrange
      req.query.settingKeyArray = 'currency';
      
      const mockResults = [{ _id: '1', settingKey: 'currency', value: 'USD' }];
      const mockWhere = jest.fn().mockResolvedValue(mockResults);
      const mockFind = {
        where: mockWhere,
      };
      
      mockModel.find.mockReturnValue(mockFind);
      
      // Act
      await listBySettingKey(req, res);
      
      // Assert
      expect(mockModel.find).toHaveBeenCalledWith({
        $or: [{ settingKey: 'currency' }],
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

   
  });



  describe('Error Handling', () => {
    it('should propagate database errors', async () => {
      // Arrange
      req.query.settingKeyArray = 'currency';
      
      const mockWhere = jest.fn().mockRejectedValue(new Error('Database error'));
      const mockFind = {
        where: mockWhere,
      };
      
      mockModel.find.mockReturnValue(mockFind);
      
      // Act & Assert
      await expect(listBySettingKey(req, res)).rejects.toThrow('Database error');
    });

    
  });

  // ====================================================
  // MINIMAL TEST SUITE (4 Tests for 100% Coverage)
  // ====================================================
  describe('Minimal Coverage Suite (4 Tests)', () => {
   
    it('Test 2: Results found → 200 success', async () => {
      req.query.settingKeyArray = 'currency';
      
      const mockWhere = jest.fn().mockResolvedValue([
        { _id: '1', settingKey: 'currency', value: 'USD' }
      ]);
      const mockFind = { where: mockWhere };
      mockModel.find.mockReturnValue(mockFind);
      
      await listBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: [{ _id: '1', settingKey: 'currency', value: 'USD' }],
        message: 'Successfully found all documents',
      });
    });

    it('Test 3: No results found → 202 empty', async () => {
      req.query.settingKeyArray = 'currency';
      
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFind = { where: mockWhere };
      mockModel.find.mockReturnValue(mockFind);
      
      await listBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: [],
        message: 'No document found by this request',
      });
    });

    it('Test 4: Database error → propagate', async () => {
      req.query.settingKeyArray = 'currency';
      
      const mockWhere = jest.fn().mockRejectedValue(new Error('DB Error'));
      const mockFind = { where: mockWhere };
      mockModel.find.mockReturnValue(mockFind);
      
      await expect(listBySettingKey(req, res)).rejects.toThrow('DB Error');
    });
  });

  // ====================================================
  // SUPER SIMPLE VERSION (Only 3 essential tests)
  // ====================================================
  describe('3 Essential Tests for 100% Coverage', () => {
    it('1. No setting keys provided', async () => {
      // Empty query
      await listBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
    });

    it('2. Settings found', async () => {
      req.query.settingKeyArray = 'test';
      
      const mockWhere = jest.fn().mockResolvedValue([
        { _id: '1', settingKey: 'test', value: 'value' }
      ]);
      mockModel.find.mockReturnValue({ where: mockWhere });
      
      await listBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('3. Database error', async () => {
      req.query.settingKeyArray = 'test';
      
      const mockWhere = jest.fn().mockRejectedValue(new Error('Error'));
      mockModel.find.mockReturnValue({ where: mockWhere });
      
      await expect(listBySettingKey(req, res)).rejects.toThrow('Error');
    });
  });
});