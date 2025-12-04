const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { generate: uniqueId } = require("shortid");
const updatePassword = require("../../../../src/controllers/middlewaresControllers/createUserController/updatePassword");

jest.mock("mongoose", () => ({
  model: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hashSync: jest.fn(() => "hashedPassword"),
}));

jest.mock("shortid", () => ({
  generate: jest.fn(() => "uniqueSalt"),
}));

describe("updatePassword controller", () => {
  let req, res, MockUserPassword, mockExec;

  beforeEach(() => {
    mockExec = jest.fn();
    MockUserPassword = {
      findOneAndUpdate: jest.fn(() => ({ exec: mockExec })),
    };
    mongoose.model.mockReturnValue(MockUserPassword);

    req = {
      params: { id: "user123" },
      body: { password: "validPass123" },
      user: { _id: "user123", email: "test@example.com" },
      user: { _id: "user123", email: "test@example.com" }, // for dynamic userModel
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return 400 if password is less than 8 characters", async () => {
    req.body.password = "short";

    await updatePassword("User", req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: "The password needs to be at least 8 characters long.",
    });
  });

  test("should return 403 if user is admin@admin.com", async () => {
    req.user = { _id: "admin123", email: "admin@admin.com" };

    await updatePassword("User", req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "you couldn't update demo password",
    });
  });

  test("should return 403 if findOneAndUpdate fails", async () => {
    mockExec.mockResolvedValue(null);

    await updatePassword("User", req, res);

    expect(MockUserPassword.findOneAndUpdate).toHaveBeenCalledWith(
      { user: "user123", removed: false },
      { $set: { password: "hashedPassword", salt: "uniqueSalt" } },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "User Password couldn't save correctly",
    });
  });

  test("should return 200 if password updated successfully", async () => {
    mockExec.mockResolvedValue({ user: "user123" });

    await updatePassword("User", req, res);

    expect(MockUserPassword.findOneAndUpdate).toHaveBeenCalledWith(
      { user: "user123", removed: false },
      { $set: { password: "hashedPassword", salt: "uniqueSalt" } },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {},
      message: "we update the password by this id: user123",
    });
  });
});
