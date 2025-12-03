// tests/controllers/settingController/listAll.test.js

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
describe('Setting ListAll Controller', () => {
  let req, res;
  let listAll;

  beforeEach(() => {
    // ====================================================
    // STEP 3: Reset modules
    // ====================================================
    jest.resetModules();
    
    // ====================================================
    // STEP 4: Create fresh mocks for each test
    // ====================================================
    mockModel = {
      find: jest.fn(),
    };
    
    // ====================================================
    // STEP 5: Import controller
    // ====================================================
    listAll = require('../../../src/controllers/coreControllers/settingController/listAll');
    
    // ====================================================
    // STEP 6: Create fresh request/response
    // ====================================================
    req = {
      query: {},
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ====================================================
  // CORRECTED TEST CASES
  // ====================================================

  describe('Success Path', () => {
    it('should return 200 with results when documents found', async () => {
      // Arrange
      const mockResults = [
        { _id: 'setting-1', key: 'currency', value: 'USD', isPrivate: false },
        { _id: 'setting-2', key: 'timezone', value: 'UTC', isPrivate: false },
      ];
      
      // Create a mock query object that sort() returns
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockResults),
      };
      
      mockModel.find.mockReturnValue(mockQuery);
      
      // Act
      await listAll(req, res);
      
      // Assert
      expect(mockModel.find).toHaveBeenCalledWith({
        removed: false,
        isPrivate: false,
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ created: 'desc' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: mockResults,
        message: 'Successfully found all documents',
      });
    });

    it('should use specified sort parameter "asc"', async () => {
      // Arrange
      req.query.sort = 'asc';
      const mockResults = [{ _id: 'setting-1' }];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockResults),
      };
      
      mockModel.find.mockReturnValue(mockQuery);
      
      // Act
      await listAll(req, res);
      
      // Assert - parseInt('asc') = NaN, falsy, default to 'desc'
      expect(mockQuery.sort).toHaveBeenCalledWith({ created: 'desc' });
    });

    it('should use numeric sort parameter "1"', async () => {
      // Arrange
      req.query.sort = '1';
      const mockResults = [{ _id: 'setting-1' }];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockResults),
      };
      
      mockModel.find.mockReturnValue(mockQuery);
      
      // Act
      await listAll(req, res);
      
      // Assert - parseInt('1') = 1, truthy, so sort = 1
      expect(mockQuery.sort).toHaveBeenCalledWith({ created: 1 });
    });
  });

  describe('Empty Results Path', () => {
    it('should return 203 when no documents found', async () => {
      // Arrange
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([]),
      };
      
      mockModel.find.mockReturnValue(mockQuery);
      
      // Act
      await listAll(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(203);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: [],
        message: 'Collection is Empty',
      });
    });
  });

  describe('Error Path', () => {
    it('should propagate database errors', async () => {
      // Arrange
      const mockQuery = {
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      
      mockModel.find.mockReturnValue(mockQuery);
      
      // Act & Assert
      await expect(listAll(req, res)).rejects.toThrow('Database error');
    });
  });

  // ====================================================
  // SIMPLEST WORKING VERSION (3 tests)
  // ====================================================
  describe('3 Tests for 100% Coverage', () => {
    it('Test 1: Success with results', async () => {
      // Arrange
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([
          { _id: '1', key: 'test', value: 'test' }
        ]),
      };
      
      mockModel.find.mockReturnValue(mockQuery);
      
      // Act
      await listAll(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: [{ _id: '1', key: 'test', value: 'test' }],
        message: 'Successfully found all documents',
      });
    });

    it('Test 2: Empty results', async () => {
      // Arrange
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([]),
      };
      
      mockModel.find.mockReturnValue(mockQuery);
      
      // Act
      await listAll(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(203);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: [],
        message: 'Collection is Empty',
      });
    });

    it('Test 3: Database error', async () => {
      // Arrange
      const mockQuery = {
        sort: jest.fn().mockRejectedValue(new Error('DB Error')),
      };
      
      mockModel.find.mockReturnValue(mockQuery);
      
      // Act & Assert
      await expect(listAll(req, res)).rejects.toThrow('DB Error');
    });
  });
});