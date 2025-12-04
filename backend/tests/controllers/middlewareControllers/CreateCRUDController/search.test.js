const search = require("../../../../src/controllers/middlewaresControllers/createCRUDController/search");

describe("search controller", () => {
  let MockModel;
  let req, res;
  let mockExec, mockFind;

  beforeEach(() => {
    req = { query: { q: "test", fields: "name,email" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };

    mockExec = jest.fn();
    mockFind = jest.fn(() => ({ where: jest.fn(() => ({ limit: jest.fn(() => ({ exec: mockExec })) })) }));

    MockModel = {
      find: mockFind,
    };

    jest.clearAllMocks();
  });

  test("should return 200 when documents are found", async () => {
    const mockResults = [{ _id: "1", name: "Test" }];
    mockExec.mockResolvedValue(mockResults);

    await search(MockModel, req, res);

    expect(mockFind).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: /test/i } },
        { email: { $regex: /test/i } },
      ],
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResults,
      message: "Successfully found all documents",
    });
  });

  test("should return 202 when no documents found", async () => {
    const mockResults = [];
    mockExec.mockResolvedValue(mockResults);

    await search(MockModel, req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: [],
      message: "No document found by this request",
    });
    expect(res.end).toHaveBeenCalled();
  });

  test("should default to 'name' field when no fields provided", async () => {
    req.query.fields = undefined;
    const mockResults = [{ _id: "1", name: "Test" }];
    mockExec.mockResolvedValue(mockResults);

    await search(MockModel, req, res);

    expect(mockFind).toHaveBeenCalledWith({
      $or: [{ name: { $regex: /test/i } }],
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
