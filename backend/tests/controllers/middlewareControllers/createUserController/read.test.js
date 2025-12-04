const mongoose = require("mongoose");
const read = require("../../../../src/controllers/middlewaresControllers/createUserController/read");

jest.mock("mongoose", () => ({
  model: jest.fn(),
}));

describe("read controller", () => {
  let req, res;
  let MockUser, mockExec;

  beforeEach(() => {
    mockExec = jest.fn();
    MockUser = {
      findOne: jest.fn(() => ({ exec: mockExec })),
    };

    mongoose.model.mockReturnValue(MockUser);

    req = {
      params: { id: "user123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return 200 with formatted result when document exists", async () => {
    const tmpResult = {
      _id: "user123",
      enabled: true,
      email: "test@example.com",
      name: "John",
      surname: "Doe",
      photo: "photo.png",
      role: "admin",
    };
    mockExec.mockResolvedValue(tmpResult);

    await read("User", req, res);

    expect(MockUser.findOne).toHaveBeenCalledWith({
      _id: "user123",
      removed: false,
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: tmpResult,
      message: "we found this document ",
    });
  });

  test("should return 404 when document does not exist", async () => {
    mockExec.mockResolvedValue(null);

    await read("User", req, res);

    expect(MockUser.findOne).toHaveBeenCalledWith({
      _id: "user123",
      removed: false,
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "No document found ",
    });
  });
});
