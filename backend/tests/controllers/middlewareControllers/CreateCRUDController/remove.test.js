const remove = require("../../../../src/controllers/middlewaresControllers/createCRUDController/remove");

describe("remove controller", () => {
  let MockModel;
  let req, res;
  let mockExec, mockFindOneAndUpdate;

  beforeEach(() => {
    req = { params: { id: "123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockExec = jest.fn();
    mockFindOneAndUpdate = jest.fn(() => ({ exec: mockExec }));

    MockModel = {
      findOneAndUpdate: mockFindOneAndUpdate,
    };

    jest.clearAllMocks();
  });

  test("should return 200 when document is successfully removed", async () => {
    const mockDoc = { _id: "123", name: "Test Doc", removed: true };
    mockExec.mockResolvedValue(mockDoc);

    await remove(MockModel, req, res);

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: "123" },
      { $set: { removed: true } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockDoc,
      message: "Successfully Deleted the document ",
    });
  });

  test("should return 404 when document not found", async () => {
    mockExec.mockResolvedValue(null);

    await remove(MockModel, req, res);

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: "123" },
      { $set: { removed: true } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "No document found ",
    });
  });
});
