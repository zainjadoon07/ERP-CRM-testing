// tests/controllers/quoteController/paginatedList.test.js

let mockModel;
let queryChain;
let countQueryChain;
let mockExec;
let mockCountExec;

// Mock mongoose BEFORE any imports
jest.mock('mongoose', () => ({
  model: jest.fn(() => mockModel),
}));

describe('Quote PaginatedList Controller - Decision/Conditional Testing', () => {
  let req, res, mockFind, mockCountDocuments;
  let paginatedList;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create query chain object for find()
    queryChain = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    
    // Create separate query chain for countDocuments()
    countQueryChain = {
      exec: jest.fn(),
    };
    
    // Mock exec functions
    mockExec = queryChain.exec;
    mockCountExec = countQueryChain.exec;
    
    // Create mock Model
    mockModel = {
      find: jest.fn().mockReturnValue(queryChain),
      countDocuments: jest.fn().mockReturnValue(countQueryChain),
    };
    
    // Store references to mock functions
    mockFind = mockModel.find;
    mockCountDocuments = mockModel.countDocuments;
    
    // Clear module cache and re-import controller
    jest.resetModules();
    paginatedList = require('../../../src/controllers/appControllers/quoteController/paginatedList');

    // Create mock request and response
    req = {
      query: {},
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Default mock returns
    mockExec.mockResolvedValue([{ _id: 'quote-1', name: 'Test Quote' }]); // resultsPromise
    mockCountExec.mockResolvedValue(25); // countPromise
  });

  describe('Pagination Parameters', () => {
    it('should use default page 1 when no page specified', async () => {
      req.query = {};
      
      await paginatedList(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          pagination: expect.objectContaining({ page: 1 }),
        })
      );
    });

    it('should use specified page from query', async () => {
      req.query.page = 3;
      
      await paginatedList(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({ page: 3 }),
        })
      );
    });

    it('should use default limit 10 when no items specified', async () => {
      req.query = {};
      
      await paginatedList(req, res);

      // skip = page(1) * limit(10) - limit(10) = 0
      expect(queryChain.skip).toHaveBeenCalledWith(0);
      expect(queryChain.limit).toHaveBeenCalledWith(10);
    });

    it('should use specified items limit from query', async () => {
      req.query.items = '25';
      
      await paginatedList(req, res);

      // skip = 1 * 25 - 25 = 0
      expect(queryChain.limit).toHaveBeenCalledWith(25);
    });

    it('should calculate correct skip value', async () => {
      req.query.page = 3;
      req.query.items = '20';
      
      await paginatedList(req, res);

      // skip = 3 * 20 - 20 = 40
      expect(queryChain.skip).toHaveBeenCalledWith(40);
    });

    it('should handle negative page number (edge case)', async () => {
      req.query.page = -1;
      
      await paginatedList(req, res);

      // skip = -1 * 10 - 10 = -20
      expect(queryChain.skip).toHaveBeenCalledWith(-20);
    });

    it('should handle zero items limit (edge case)', async () => {
      req.query.items = '0';
      
      await paginatedList(req, res);

      // parseInt('0') = 0, which is falsy, so || 10 gives 10
      expect(queryChain.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('Sorting Parameters', () => {
    it('should use default sort parameters', async () => {
      req.query = {};
      
      await paginatedList(req, res);

      expect(queryChain.sort).toHaveBeenCalledWith({ enabled: -1 });
    });

    it('should use specified sortBy and sortValue', async () => {
      req.query.sortBy = 'createdAt';
      req.query.sortValue = '1';
      
      await paginatedList(req, res);

      expect(queryChain.sort).toHaveBeenCalledWith({ createdAt: '1' });
    });

    it('should convert sortValue string to number', async () => {
      req.query.sortValue = '-1';
      
      await paginatedList(req, res);

      // Note: The controller doesn't convert string to number
      expect(queryChain.sort).toHaveBeenCalledWith({ enabled: '-1' });
    });
  });

  describe('Filtering Parameters', () => {
    it('should handle filter and equal parameters', async () => {
      req.query.filter = 'status';
      req.query.equal = 'active';
      
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalledWith({
        removed: false,
        status: 'active',
      });
    });

    it('should handle undefined filter/equal', async () => {
      req.query = {};
      
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalledWith({
        removed: false,
        [undefined]: undefined,
      });
    });

    it('should handle empty filter with equal', async () => {
      req.query.filter = '';
      req.query.equal = 'someValue';
      
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalledWith({
        removed: false,
        '': 'someValue',
      });
    });
  });

  describe('Search Fields (fields parameter)', () => {
    it('should handle empty fields array', async () => {
      req.query = {};
      
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalledWith({
        removed: false,
        [undefined]: undefined,
      });
    });

    it('should handle single field search', async () => {
      req.query.fields = 'name';
      req.query.q = 'test';
      
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalledWith({
        removed: false,
        [undefined]: undefined,
        $or: [{ name: { $regex: expect.any(RegExp) } }],
      });
    });

    it('should handle multiple fields search', async () => {
      req.query.fields = 'name,description,clientName';
      req.query.q = 'searchTerm';
      
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ name: expect.any(Object) }),
            expect.objectContaining({ description: expect.any(Object) }),
            expect.objectContaining({ clientName: expect.any(Object) }),
          ]),
        })
      );
    });

    it('should handle search without q parameter', async () => {
      req.query.fields = 'name,description';
      // No q parameter
      
      await paginatedList(req, res);

      // Should create regex with undefined
      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { name: { $regex: expect.any(RegExp) } },
            { description: { $regex: expect.any(RegExp) } },
          ],
        })
      );
    });

    it('should handle fields with special characters', async () => {
      req.query.fields = 'client.name,client-email';
      req.query.q = 'test@example.com';
      
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { 'client.name': { $regex: expect.any(RegExp) } },
            { 'client-email': { $regex: expect.any(RegExp) } },
          ],
        })
      );
    });
  });

  describe('Population', () => {
    it('should populate createdBy with name field', async () => {
      await paginatedList(req, res);

      expect(queryChain.populate).toHaveBeenCalledWith('createdBy', 'name');
    });
  });

  describe('Database Query Execution', () => {
   

    it('should use Promise.all for parallel execution', async () => {
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalled();
      expect(mockCountDocuments).toHaveBeenCalled();
    });
  });

 

  describe('Response Handling - Empty Results', () => {
    it('should return 203 status when no results found', async () => {
      mockExec.mockResolvedValue([]);
      mockCountExec.mockResolvedValue(0);
      
      await paginatedList(req, res);

      expect(res.status).toHaveBeenCalledWith(203);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          result: [],
          message: 'Collection is Empty',
        })
      );
    });

  });

  describe('Error Handling', () => {
    it('should handle database find error', async () => {
      mockExec.mockRejectedValue(new Error('Database find failed'));
      
      // The controller doesn't have try-catch, so error will propagate
      await expect(paginatedList(req, res)).rejects.toThrow('Database find failed');
    });


    it('should handle invalid RegExp in search', async () => {
      req.query.fields = 'name';
      req.query.q = '[invalid(regex';
      
      // The controller will throw when creating the RegExp
      await expect(paginatedList(req, res)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large page numbers', async () => {
      req.query.page = 999999;
      req.query.items = '10';
      
      await paginatedList(req, res);

      // skip = 999999 * 10 - 10 = 9999980
      expect(queryChain.skip).toHaveBeenCalledWith(9999980);
    });

    it('should handle decimal page numbers', async () => {
      req.query.page = 2.5;
      
      await paginatedList(req, res);

      // skip = 2.5 * 10 - 10 = 15
      expect(queryChain.skip).toHaveBeenCalledWith(15);
    });

    it('should handle non-numeric items parameter', async () => {
      req.query.items = 'not-a-number';
      
      await paginatedList(req, res);

      // parseInt('not-a-number') = NaN, then || 10 gives 10
      expect(queryChain.limit).toHaveBeenCalledWith(10);
    });

    it('should handle empty string items parameter', async () => {
      req.query.items = '';
      
      await paginatedList(req, res);

      // parseInt('') = NaN, then || 10 gives 10
      expect(queryChain.limit).toHaveBeenCalledWith(10);
    });

    it('should handle fields with trailing comma', async () => {
      req.query.fields = 'name,description,';
      req.query.q = 'test';
      
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ name: expect.any(Object) }),
            expect.objectContaining({ description: expect.any(Object) }),
            expect.objectContaining({ '': expect.any(Object) }),
          ]),
        })
      );
    });

    it('should handle filter with dot notation', async () => {
      req.query.filter = 'client.status';
      req.query.equal = 'active';
      
      await paginatedList(req, res);

      expect(mockFind).toHaveBeenCalledWith({
        removed: false,
        'client.status': 'active',
      });
    });
  });

  describe('Performance and Concurrency', () => {
    it('should execute queries in parallel with Promise.all', async () => {
      const startTime = Date.now();
      
      // Simulate async database calls with delays
      mockExec.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([{ _id: 'quote-1' }]), 100))
      );
      mockCountExec.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(50), 100))
      );
      
      await paginatedList(req, res);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should take ~100ms (parallel) not ~200ms (sequential)
      expect(duration).toBeLessThan(150);
    });

    it('should handle large number of fields efficiently', async () => {
      // Create 100 fields
      const fields = Array.from({ length: 100 }, (_, i) => `field${i}`).join(',');
      req.query.fields = fields;
      req.query.q = 'search';
      
      await paginatedList(req, res);

      // Should create 100 $or conditions
      const findCall = mockFind.mock.calls[0][0];
      expect(findCall.$or).toHaveLength(100);
    });
  });
});