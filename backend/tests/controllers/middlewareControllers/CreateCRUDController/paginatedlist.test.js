const paginatedList = require("../../../../src/controllers/middlewaresControllers/createCRUDController/paginatedList");

describe("paginatedList controller", () => {
  let MockModel;
  let req, res;
  let mockExec, mockPopulate, mockSkip, mockLimit, mockSort, mockFind, mockCount;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // chainable mocks
    mockExec = jest.fn();
    mockPopulate = jest.fn(() => ({ exec: mockExec }));
    mockSort = jest.fn(() => ({ populate: mockPopulate }));
    mockLimit = jest.fn(() => ({ sort: mockSort }));
    mockSkip = jest.fn(() => ({ limit: mockLimit }));
    mockFind = jest.fn(() => ({ skip: mockSkip }));

    mockCount = jest.fn();

    MockModel = {
      find: mockFind,
      countDocuments: mockCount,
    };

    jest.clearAllMocks();
  });

  test("should return 200 with results when collection is non-empty, default pagination", async () => {
    const mockResult = [{ _id: "1", name: "Test" }];
    mockExec.mockResolvedValue(mockResult);
    mockCount.mockResolvedValue(1);

    await paginatedList(MockModel, req, res);

    expect(mockFind).toHaveBeenCalledWith({ removed: false });
    expect(mockSkip).toHaveBeenCalledWith(0); // default page=1, limit=10 → skip=0
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockSort).toHaveBeenCalledWith({ enabled: -1 });
    expect(mockPopulate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      pagination: { page: 1, pages: 1, count: 1 },
      message: "Successfully found all documents",
    });
  });

  test("should return 203 when collection is empty", async () => {
    mockExec.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await paginatedList(MockModel, req, res);

    expect(res.status).toHaveBeenCalledWith(203);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: [],
      pagination: { page: 1, pages: 0, count: 0 },
      message: "Collection is Empty",
    });
  });

  test("should use provided page, items, sortBy, sortValue, filter, equal", async () => {
    req.query = {
      page: 2,
      items: "5",
      sortBy: "name",
      sortValue: 1,
      filter: "role",
      equal: "admin",
    };
    const mockResult = [{ _id: "2", role: "admin" }];
    mockExec.mockResolvedValue(mockResult);
    mockCount.mockResolvedValue(6);

    await paginatedList(MockModel, req, res);

    expect(mockFind).toHaveBeenCalledWith({
      removed: false,
      role: "admin",
    });
    expect(mockSkip).toHaveBeenCalledWith(5); // (2*5)-5 = 5
    expect(mockLimit).toHaveBeenCalledWith(5);
    expect(mockSort).toHaveBeenCalledWith({ name: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      pagination: { page: 2, pages: 2, count: 6 },
      message: "Successfully found all documents",
    });
  });

  test("should apply search fields if fields and q provided", async () => {
    req.query = {
      fields: "name,email",
      q: "test",
    };
    const mockResult = [{ _id: "3", name: "Test User" }];
    mockExec.mockResolvedValue(mockResult);
    mockCount.mockResolvedValue(1);

    await paginatedList(MockModel, req, res);

    const expectedFields = {
      $or: [
        { name: { $regex: new RegExp("test", "i") } },
        { email: { $regex: new RegExp("test", "i") } },
      ],
    };

    expect(mockFind).toHaveBeenCalledWith({
      removed: false,
      ...expectedFields,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      pagination: { page: 1, pages: 1, count: 1 },
      message: "Successfully found all documents",
    });
  });
});
