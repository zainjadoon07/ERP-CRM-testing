const listAll = require("../../../../src/controllers/middlewaresControllers/createCRUDController/listAll");

describe("listAll controller", () => {
  let MockModel;
  let req, res;
  let mockExec, mockPopulate, mockSort;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockExec = jest.fn();
    mockPopulate = jest.fn(() => ({ exec: mockExec }));
    mockSort = jest.fn(() => ({ populate: mockPopulate }));
    MockModel = {
      find: jest.fn(() => ({ sort: mockSort })),
    };

    jest.clearAllMocks();
  });

  test("should return 200 when results found with default sort", async () => {
    const mockResult = [{ _id: "1", name: "Test" }];
    mockExec.mockResolvedValue(mockResult);

    await listAll(MockModel, req, res);

    expect(MockModel.find).toHaveBeenCalledWith({ removed: false });
    expect(mockSort).toHaveBeenCalledWith({ created: "desc" });
    expect(mockPopulate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      message: "Successfully found all documents",
    });
  });

  test("should return 200 when results found with enabled query", async () => {
    req.query.enabled = true;
    const mockResult = [{ _id: "2", name: "Test 2" }];
    mockExec.mockResolvedValue(mockResult);

    await listAll(MockModel, req, res);

    expect(MockModel.find).toHaveBeenCalledWith({ removed: false, enabled: true });
    expect(mockSort).toHaveBeenCalledWith({ created: "desc" });
    expect(mockPopulate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      message: "Successfully found all documents",
    });
  });

  test("should return 203 when collection is empty", async () => {
    mockExec.mockResolvedValue([]); // empty array
    await listAll(MockModel, req, res);

    expect(res.status).toHaveBeenCalledWith(203);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: [],
      message: "Collection is Empty",
    });
  });

  test("should use custom sort if provided", async () => {
    req.query.sort = "asc";
    const mockResult = [{ _id: "3", name: "Sorted Test" }];
    mockExec.mockResolvedValue(mockResult);

    await listAll(MockModel, req, res);

    expect(mockSort).toHaveBeenCalledWith({ created: "asc" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      message: "Successfully found all documents",
    });
  });
});
