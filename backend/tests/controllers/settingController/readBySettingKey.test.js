// tests/controllers/settingController/readBySettingKey.test.js

let mockModel;

jest.mock('mongoose', () => ({
  model: jest.fn(() => mockModel),
}));

describe('Setting ReadBySettingKey Controller', () => {
  let req, res;
  let readBySettingKey;

  beforeEach(() => {
    jest.resetModules();
    
    // Mock Model with findOne method
    mockModel = {
      findOne: jest.fn(),
    };
    
    // Import controller
    readBySettingKey = require('../../../src/controllers/coreControllers/settingController/readBySettingKey');
    
    // Request/response objects
    req = {
      params: {},
    };
    
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ====================================================
  // MINIMAL TEST SUITE (3 Tests for 100% Coverage)
  // ====================================================

  describe('Missing settingKey', () => {
    it('should return 202 when no settingKey provided', async () => {
      // Arrange - No settingKey in params
      req.params = {};
      
      // Act
      await readBySettingKey(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No settingKey provided ',
      });
      expect(mockModel.findOne).not.toHaveBeenCalled();
    });

    it('should return 202 when settingKey is undefined', async () => {
      // Arrange
      req.params.settingKey = undefined;
      
      // Act
      await readBySettingKey(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(202);
    });
  });

  describe('Document Found', () => {
    it('should return 200 when document found', async () => {
      // Arrange
      req.params.settingKey = 'currency';
      const mockResult = {
        _id: '123',
        settingKey: 'currency',
        value: 'USD',
      };
      
      mockModel.findOne.mockResolvedValue(mockResult);
      
      // Act
      await readBySettingKey(req, res);
      
      // Assert
      expect(mockModel.findOne).toHaveBeenCalledWith({
        settingKey: 'currency',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: mockResult,
        message: 'we found this document by this settingKey: currency',
      });
    });
  });

  describe('Document Not Found', () => {
    it('should return 404 when document not found', async () => {
      // Arrange
      req.params.settingKey = 'non-existent-key';
      
      mockModel.findOne.mockResolvedValue(null);
      
      // Act
      await readBySettingKey(req, res);
      
      // Assert
      expect(mockModel.findOne).toHaveBeenCalledWith({
        settingKey: 'non-existent-key',
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No document found by this settingKey: non-existent-key',
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate database errors', async () => {
      // Arrange
      req.params.settingKey = 'currency';
      
      mockModel.findOne.mockRejectedValue(new Error('Database error'));
      
      // Act & Assert
      await expect(readBySettingKey(req, res)).rejects.toThrow('Database error');
    });
  });

  // ====================================================
  // ABSOLUTE MINIMUM (3 Tests for 100% Coverage)
  // ====================================================
  describe('3 Essential Tests for 100% Coverage', () => {
    it('Test 1: No settingKey → 202 error', async () => {
      // Empty params
      await readBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No settingKey provided ',
      });
    });

    it('Test 2: Document found → 200 success', async () => {
      req.params.settingKey = 'test';
      
      mockModel.findOne.mockResolvedValue({
        _id: '1',
        settingKey: 'test',
        value: 'value',
      });
      
      await readBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        result: { _id: '1', settingKey: 'test', value: 'value' },
        message: 'we found this document by this settingKey: test',
      });
    });

    it('Test 3: Document not found → 404 error', async () => {
      req.params.settingKey = 'test';
      
      mockModel.findOne.mockResolvedValue(null);
      
      await readBySettingKey(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'No document found by this settingKey: test',
      });
    });
  });

  // ====================================================
  // EVEN SIMPLER (Just 3 tests in one describe block)
  // ====================================================
  describe('3 Tests for 100% Coverage (Simplified)', () => {
    it('1. Missing param → 202', async () => {
      await readBySettingKey(req, res);
      expect(res.status).toHaveBeenCalledWith(202);
    });

    it('2. Document exists → 200', async () => {
      req.params.settingKey = 'currency';
      mockModel.findOne.mockResolvedValue({ data: 'test' });
      
      await readBySettingKey(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('3. Document missing → 404', async () => {
      req.params.settingKey = 'currency';
      mockModel.findOne.mockResolvedValue(null);
      
      await readBySettingKey(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});