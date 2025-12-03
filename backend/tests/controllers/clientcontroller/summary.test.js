const summary = require('../../../src/controllers/appControllers/clientController/summary');

describe('Client Summary Controller - Conditional Decision Coverage', () => {
  let mockModel;
  let req;
  let res;

  beforeEach(() => {
    mockModel = {
      aggregate: jest.fn()
    };

    // Create request object
    req = {
      query: {}
    };

    // Create response object
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Type parameter validation decision', () => {

    test('should default to "month" when type is not provided', async () => {
      req.query = {}; // No type

      // Mock successful response
      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 100 }],
        newClients: [{ count: 20 }],
        activeClients: [{ count: 60 }]
      }]);

      await summary(mockModel, req, res);

      // Should succeed with 200
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });

    // Condition 2: Valid type 'week'
    test('should accept "week" as valid type', async () => {
      req.query = { type: 'week' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 100 }],
        newClients: [{ count: 20 }],
        activeClients: [{ count: 60 }]
      }]);

      await summary(mockModel, req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].success).toBe(true);
    });

    // Condition 3: Valid type 'month'
    test('should accept "month" as valid type', async () => {
      req.query = { type: 'month' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 100 }],
        newClients: [{ count: 20 }],
        activeClients: [{ count: 60 }]
      }]);

      await summary(mockModel, req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    // Condition 4: Valid type 'year'
    test('should accept "year" as valid type', async () => {
      req.query = { type: 'year' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 100 }],
        newClients: [{ count: 20 }],
        activeClients: [{ count: 60 }]
      }]);

      await summary(mockModel, req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    // Condition 5: Invalid type → return 400 error
    test('should return 400 error for invalid type', async () => {
      req.query = { type: 'invalid-type' };

      await summary(mockModel, req, res);

      // Should fail with 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: 'Invalid type'
      });
    });
  });

  describe('Aggregation result handling decisions', () => {

    test('should handle when all arrays have data', async () => {
      req.query = { type: 'month' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 100 }],
        newClients: [{ count: 25 }],
        activeClients: [{ count: 75 }]
      }]);

      await summary(mockModel, req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.result.new).toBe(25); // (25/100)*100 = 25%
      expect(response.result.active).toBe(75); // (75/100)*100 = 75%
    });

    // Condition 2: totalClients array is empty
    test('should handle empty totalClients array', async () => {
      req.query = { type: 'month' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [],
        newClients: [{ count: 10 }],
        activeClients: [{ count: 50 }]
      }]);

      await summary(mockModel, req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.result.new).toBe(0); // totalClients = 0
      expect(response.result.active).toBe(0); // totalClients = 0
    });

    // Condition 3: newClients array is empty
    test('should handle empty newClients array', async () => {
      req.query = { type: 'month' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 100 }],
        newClients: [],
        activeClients: [{ count: 50 }]
      }]);

      await summary(mockModel, req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.result.new).toBe(0); // newClients = 0
      expect(response.result.active).toBe(50); // (50/100)*100 = 50%
    });

    // Condition 4: activeClients array is empty
    test('should handle empty activeClients array', async () => {
      req.query = { type: 'month' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 100 }],
        newClients: [{ count: 30 }],
        activeClients: []
      }]);

      await summary(mockModel, req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.result.new).toBe(30); // (30/100)*100 = 30%
      expect(response.result.active).toBe(0); // activeClients = 0
    });
  });

  // ============ DECISION 3: Percentage Calculation Logic ============
  describe('Percentage calculation decisions', () => {

    // Condition 1: totalClients > 0 → calculate percentages
    test('should calculate percentages when totalClients > 0', async () => {
      req.query = { type: 'month' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 80 }],
        newClients: [{ count: 20 }],
        activeClients: [{ count: 60 }]
      }]);

      await summary(mockModel, req, res);

      const response = res.json.mock.calls[0][0];
      // (20/80)*100 = 25%
      // (60/80)*100 = 75%
      expect(response.result.new).toBe(25);
      expect(response.result.active).toBe(75);
    });

    // Condition 2: totalClients = 0 → percentages = 0
    test('should return 0% when totalClients = 0', async () => {
      req.query = { type: 'month' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 0 }],
        newClients: [{ count: 0 }],
        activeClients: [{ count: 0 }]
      }]);

      await summary(mockModel, req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.result.new).toBe(0);
      expect(response.result.active).toBe(0);
    });

    // Condition 3: Rounding of percentages
    test('should round percentages correctly', async () => {
      req.query = { type: 'month' };

      mockModel.aggregate.mockResolvedValue([{
        totalClients: [{ count: 7 }],
        newClients: [{ count: 2 }],
        activeClients: [{ count: 3 }]
      }]);

      await summary(mockModel, req, res);

      const response = res.json.mock.calls[0][0];
      // (2/7)*100 = 28.57... => Math.round = 29
      // (3/7)*100 = 42.85... => Math.round = 43
      expect(response.result.new).toBe(29);
      expect(response.result.active).toBe(43);
    });
  });

  // ============ ERROR HANDLING ============
  describe('Error handling', () => {

    test('should handle database aggregation errors', async () => {
      req.query = { type: 'month' };

      // Mock database error
      mockModel.aggregate.mockRejectedValue(new Error('Database connection failed'));

      // Test should throw error (not catch it)
      await expect(summary(mockModel, req, res)).rejects.toThrow('Database connection failed');
    });
  });
});