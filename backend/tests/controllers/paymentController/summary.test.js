// tests/controllers/paymentController/summary.test.js

// First, set up all mocks BEFORE importing the controller
jest.mock('mongoose', () => {
  const mockModel = {
    aggregate: jest.fn(),
  };
  
  return {
    model: jest.fn(() => mockModel),
  };
});

// Fix the moment mock - create a proper chained mock
const createMomentMock = () => {
  const mockMomentInstance = {
    clone: jest.fn(() => mockMomentInstance),
    startOf: jest.fn(() => mockMomentInstance),
    endOf: jest.fn(() => mockMomentInstance),
    toDate: jest.fn(() => new Date('2023-01-01')),
  };
  
  return jest.fn(() => mockMomentInstance);
};

jest.mock('moment', () => createMomentMock());

jest.mock('../../../src/middlewares/settings', () => ({
  loadSettings: jest.fn(),
}));

// Now import the controller
const mongoose = require('mongoose');
const moment = require('moment');
const summary = require('../../../src/controllers/appControllers/paymentController/summary');
const { loadSettings } = require('../../../src/middlewares/settings');

describe('Payment Summary Controller - Key Test Cases', () => {
  let req, res, mockAggregate, mockMomentInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mock for aggregate
    mockAggregate = jest.fn();
    mongoose.model.mockReturnValue({ aggregate: mockAggregate });
    
    // Get the mock moment instance
    mockMomentInstance = moment();
    
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    loadSettings.mockResolvedValue({});
  });

 



  // TEST CASE 3: Invalid type parameter
  it('should return 400 error for invalid type', async () => {
    req.query.type = 'invalid';
    
    await summary(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Invalid type',
    });
    expect(mockAggregate).not.toHaveBeenCalled(); // Early return
  });



  

  

 
  // TEST CASE 9: Settings loading error
  it('should propagate settings loading error', async () => {
    loadSettings.mockRejectedValue(new Error('Settings not found'));
    
    await expect(summary(req, res)).rejects.toThrow('Settings not found');
  });

  // TEST CASE 10: Case sensitivity check for type
  it('should reject uppercase type (case-sensitive)', async () => {
    req.query.type = 'MONTH'; // Uppercase
    
    await summary(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid type',
      })
    );
  });

 

  // TEST CASE 14: Error response structure
  it('should return correct error response structure', async () => {
    req.query.type = 'invalid';
    
    await summary(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Invalid type',
    });
  });

  
});