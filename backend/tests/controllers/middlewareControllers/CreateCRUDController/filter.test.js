const filter = require("../../../../src/controllers/middlewaresControllers/createCRUDController/filter");

describe("filter controller", () => {
  let MockModel;
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockExec = jest.fn();
    const mockEquals = jest.fn(() => ({ exec: mockExec }));
    const mockWhere = jest.fn(() => ({ equals: mockEquals }));

    MockModel = {
      find: jest.fn(() => ({ where: mockWhere })),
    };

    // attach helpers to req
    req.query = {};
    res.status.mockClear();
    res.json.mockClear();
    MockModel.find.mockClear();
    mockWhere.mockClear();
    mockEquals.mockClear();
    mockExec.mockClear();
  });

  test("should return 403 when filter or equal query is missing", async () => {
    req.query = {}; // both missing
    await filter(MockModel, req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "filter not provided correctly",
    });
  });

  test("should return 404 when no document found", async () => {
    req.query = { filter: "name", equal: "test" };
    const mockExec = jest.fn().mockResolvedValue(null);
    MockModel.find = jest.fn(() => ({
      where: jest.fn(() => ({ equals: jest.fn(() => ({ exec: mockExec })) })),
    }));

    await filter(MockModel, req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "No document found ",
    });
  });

  test("should return 200 with result when document found", async () => {
    const mockResult = [{ _id: "1", name: "test" }];
    req.query = { filter: "name", equal: "test" };

    const mockExec = jest.fn().mockResolvedValue(mockResult);
    const mockEquals = jest.fn(() => ({ exec: mockExec }));
    const mockWhere = jest.fn(() => ({ equals: mockEquals }));
    MockModel.find = jest.fn(() => ({ where: mockWhere }));

    await filter(MockModel, req, res);

    expect(MockModel.find).toHaveBeenCalledWith({ removed: false });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      message: "Successfully found all documents  ",
    });
  });
});
