const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { generate: uniqueId } = require("shortid");
const updateProfilePassword = require("../../../../src/controllers/middlewaresControllers/createUserController/updateProfilePassword");

jest.mock("mongoose", () => ({
  model: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hashSync: jest.fn(() => "hashedPassword"),
}));

jest.mock("shortid", () => ({
  generate: jest.fn(() => "randomSalt"),
}));

describe("updateProfilePassword controller", () => {
  let req, res, MockUserPassword, mockExec;

  beforeEach(() => {
    mockExec = jest.fn();
    MockUserPassword = {
      findOneAndUpdate: jest.fn(() => ({ exec: mockExec })),
    };
    mongoose.model.mockReturnValue(MockUserPassword);

    req = {
      body: { password: "password123", passwordCheck: "password123" },
      user: { _id: "user123", email: "test@example.com" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return 400 if password or passwordCheck is missing", async () => {
    req.body = { password: "password123" }; // missing passwordCheck

    await updateProfilePassword("User", req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Not all fields have been entered." });
  });

  test("should return 400 if password < 8 chars", async () => {
    req.body = { password: "123", passwordCheck: "123" };

    await updateProfilePassword("User", req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: "The password needs to be at least 8 characters long.",
    });
  });

  test("should return 400 if passwords do not match", async () => {
    req.body = { password: "password123", passwordCheck: "password456" };

    await updateProfilePassword("User", req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Enter the same password twice for verification.",
    });
  });

  test("should return 403 if admin email tries to update", async () => {
    req.user = { _id: "admin123", email: "admin@admin.com" };

    await updateProfilePassword("User", req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "you couldn't update demo password",
    });
  });

  test("should return 403 if findOneAndUpdate returns null", async () => {
    mockExec.mockResolvedValue(null);

    await updateProfilePassword("User", req, res);

    expect(MockUserPassword.findOneAndUpdate).toHaveBeenCalledWith(
      { user: "user123", removed: false },
      { $set: { password: "hashedPassword", salt: "randomSalt" } },
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
    mockExec.mockResolvedValue({}); // Simulate successful update

    await updateProfilePassword("User", req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {},
      message: "we update the password by this id: user123",
    });
  });
});
