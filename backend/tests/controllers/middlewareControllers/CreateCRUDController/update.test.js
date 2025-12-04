const update = require("../../../../src/controllers/middlewaresControllers/createCRUDController/update");

describe("update controller", () => {
  let MockModel;
  let req, res;
  let mockExec;

  beforeEach(() => {
    mockExec = jest.fn();
    MockModel = {
      findOneAndUpdate: jest.fn(() => ({ exec: mockExec })),
    };

    req = {
      params: { id: "doc123" },
      body: { name: "Updated Name" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return 200 and updated document when document exists", async () => {
    const mockResult = { _id: "doc123", name: "Updated Name" };
    mockExec.mockResolvedValue(mockResult);

    await update(MockModel, req, res);

    expect(MockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "doc123", removed: false },
      { ...req.body, removed: false },
      { new: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      message: "we update this document ",
    });
  });

  test("should return 404 when document does not exist", async () => {
    mockExec.mockResolvedValue(null);

    await update(MockModel, req, res);

    expect(MockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "doc123", removed: false },
      { ...req.body, removed: false },
      { new: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "No document found ",
    });
  });
});
