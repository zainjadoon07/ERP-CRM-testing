// tests/controllers/quoteController/read.test.js

// ====================================================
// STEP 1: Module-scoped mock variables (OUTSIDE describe)
// ====================================================
let mockModel;
let queryChain;
let mockExec;

// ====================================================
// STEP 2: Jest mock setup with factory function
// ====================================================
jest.mock('mongoose', () => ({
  model: jest.fn(() => mockModel),
}));

// ====================================================
// Test Suite
// ====================================================
describe('Quote Read Controller - STRICT MOCKING PATTERN', () => {
  let req, res;
  let read; // Will be imported in beforeEach

  beforeEach(() => {
    // ====================================================
    // STEP 3: Reset modules before each test
    // ====================================================
    jest.resetModules();
    
    // ====================================================
    // STEP 4: Create separate query chains
    // ====================================================
    // Query chain for findOne() method
    mockExec = jest.fn();
    queryChain = {
      populate: jest.fn(() => queryChain),
      exec: mockExec,
    };
    
    // ====================================================
    // STEP 5: Create mock Model with proper method returns
    // ====================================================
    mockModel = {
      findOne: jest.fn(() => queryChain),
    };
    
    // ====================================================
    // STEP 6: Import controller AFTER mocks are set up
    // ====================================================
    read = require('../../../src/controllers/appControllers/quoteController/read');
    
    // ====================================================
    // STEP 7: Create fresh request/response objects
    // ====================================================
    req = {
      params: {
        id: 'valid-quote-id-123',
      },
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
  // MINIMAL TEST CASES FOR 100% COVERAGE
  // ====================================================

  describe('Successful Document Retrieval', () => {
    it('should return 200 with document when found', async () => {
      // Arrange
      const mockDocument = {
        _id: 'valid-quote-id-123',
        name: 'Test Quote',
        total: 1000,
        createdBy: { name: 'Admin User' },
      };
      
      // STEP 5: Use mockResolvedValue, NOT mockResolvedValueOnce
      mockExec.mockResolvedValue(mockDocument);
      
      // Act
      await read(req, res);
      
      // Assert
      // 1. Verify Model.findOne was called with correct query
      expect(mockModel.findOne).toHaveBeenCalledWith({
        _id: 'valid-quote-id-123',
        removed: false,
      });
      
      // 2. Verify populate was called correctly
      expect(queryChain.populate).toHaveBeenCalledWith('createdBy', 'name');
      
      // 3. Verify exec was called
      expect(mockExec).toHaveBeenCalled();
      
      // 4. Verify response status
      expect(res.status).toHaveBeenCalledWith(200);
      
      // 5. Verify response structure
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: mockDocument,
        message: 'we found this document ',
      });
    });
  });

  describe('Document Not Found', () => {
    it('should return 404 when document does not exist', async () => {
      // Arrange
      // STEP 5: Use mockResolvedValue
      mockExec.mockResolvedValue(null);
      
      // Act
      await read(req, res);
      
      // Assert
      // 1. Verify Model.findOne was called
      expect(mockModel.findOne).toHaveBeenCalledWith({
        _id: 'valid-quote-id-123',
        removed: false,
      });
      
      // 2. Verify response status is 404
      expect(res.status).toHaveBeenCalledWith(404);
      
      // 3. Verify error response structure
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No document found ',
      });
    });

    it('should return 404 when document is removed (removed: true)', async () => {
      // Arrange
      // Even though query filters by removed: false, we mock null result
      mockExec.mockResolvedValue(null);
      
      // Act
      await read(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No document found ',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid ID format', async () => {
      // Arrange
      req.params.id = 'invalid-id-format';
      mockExec.mockResolvedValue(null);
      
      // Act
      await read(req, res);
      
      // Assert
      expect(mockModel.findOne).toHaveBeenCalledWith({
        _id: 'invalid-id-format',
        removed: false,
      });
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle missing ID parameter', async () => {
      // Arrange
      req.params.id = undefined;
      mockExec.mockResolvedValue(null);
      
      // Act
      await read(req, res);
      
      // Assert
      expect(mockModel.findOne).toHaveBeenCalledWith({
        _id: undefined,
        removed: false,
      });
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockExec.mockRejectedValue(dbError);
      
      // Act & Assert
      await expect(read(req, res)).rejects.toThrow('Database connection failed');
      
      // Verify query was attempted before error
      expect(mockModel.findOne).toHaveBeenCalled();
    });
  });

  describe('Response Validation', () => {
    it('should have correct response structure for success', async () => {
      // Arrange
      const mockDocument = { _id: 'test-id', name: 'Test' };
      mockExec.mockResolvedValue(mockDocument);
      
      // Act
      await read(req, res);
      
      // Assert
      const responseCall = res.json.mock.calls[0][0];
      
      // Verify all required properties exist
      expect(responseCall).toHaveProperty('success', true);
      expect(responseCall).toHaveProperty('result', mockDocument);
      expect(responseCall).toHaveProperty('message', 'we found this document ');
      
      // Verify no extra properties
      expect(Object.keys(responseCall)).toHaveLength(3);
    });

    it('should have correct response structure for error', async () => {
      // Arrange
      mockExec.mockResolvedValue(null);
      
      // Act
      await read(req, res);
      
      // Assert
      const responseCall = res.json.mock.calls[0][0];
      
      expect(responseCall).toHaveProperty('success', false);
      expect(responseCall).toHaveProperty('result', null);
      expect(responseCall).toHaveProperty('message', 'No document found ');
    });
  });

  describe('Minimal Coverage Suite (Only 5 Essential Tests)', () => {
    // These 5 tests cover 100% of the controller
    
    it('TEST 1: Document found → 200 success', async () => {
      // Arrange
      mockExec.mockResolvedValue({ _id: 'test', name: 'Quote' });
      
      // Act
      await read(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: { _id: 'test', name: 'Quote' },
        message: 'we found this document ',
      });
    });

    it('TEST 2: Document not found → 404 error', async () => {
      // Arrange
      mockExec.mockResolvedValue(null);
      
      // Act
      await read(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No document found ',
      });
    });

    it('TEST 3: Database error → propagate error', async () => {
      // Arrange
      mockExec.mockRejectedValue(new Error('DB Error'));
      
      // Act & Assert
      await expect(read(req, res)).rejects.toThrow('DB Error');
    });

    it('TEST 4: Query structure is correct', async () => {
      // Arrange
      mockExec.mockResolvedValue({ _id: 'test' });
      
      // Act
      await read(req, res);
      
      // Assert
      expect(mockModel.findOne).toHaveBeenCalledWith({
        _id: 'valid-quote-id-123',
        removed: false,
      });
      expect(queryChain.populate).toHaveBeenCalledWith('createdBy', 'name');
    });

    it('TEST 5: Edge case - empty result object', async () => {
      // Arrange
      mockExec.mockResolvedValue({}); // Empty object but truthy
      
      // Act
      await read(req, res);
      
      // Assert - Should still return success since result is truthy
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: {},
        message: 'we found this document ',
      });
    });
  });
});