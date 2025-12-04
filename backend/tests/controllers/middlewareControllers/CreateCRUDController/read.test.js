const read = require("../../../../src/controllers/middlewaresControllers/createCRUDController/read");

describe("read controller", () => {
  let MockModel;
  let req, res;
  let mockExec, mockFindOne;

  beforeEach(() => {
    req = { params: { id: "123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockExec = jest.fn();
    mockFindOne = jest.fn(() => ({ exec: mockExec }));

    MockModel = {
      findOne: mockFindOne,
    };

    jest.clearAllMocks();
  });

  test("should return 200 when document is found", async () => {
    const mockDoc = { _id: "123", name: "Test Doc" };
    mockExec.mockResolvedValue(mockDoc);

    await read(MockModel, req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: "123", removed: false });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockDoc,
      message: "we found this document ",
    });
  });

  test("should return 404 when document not found", async () => {
    mockExec.mockResolvedValue(null);

    await read(MockModel, req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: "123", removed: false });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "No document found ",
    });
  });
});
