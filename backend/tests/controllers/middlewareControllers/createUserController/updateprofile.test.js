const mongoose = require("mongoose");
const updateProfile = require("../../../../src/controllers/middlewaresControllers/createUserController/updateProfile");

jest.mock("mongoose", () => ({
  model: jest.fn(),
}));

describe("updateProfile controller", () => {
  let req, res, MockUser, mockExec;

  beforeEach(() => {
    mockExec = jest.fn();
    MockUser = {
      findOneAndUpdate: jest.fn(() => ({ exec: mockExec })),
    };
    mongoose.model.mockReturnValue(MockUser);

    req = {
      body: { email: "new@example.com", name: "John", surname: "Doe", photo: "photo.png" },
      user: { _id: "user123", email: "test@example.com" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return 403 if user is admin@admin.com", async () => {
    req.user = { _id: "admin123", email: "admin@admin.com" };

    await updateProfile("User", req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "you couldn't update demo informations",
    });
  });

  test("should return 404 if profile not found", async () => {
    mockExec.mockResolvedValue(null);

    await updateProfile("User", req, res);

    expect(MockUser.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "user123", removed: false },
      {
        $set: {
          email: "new@example.com",
          name: "John",
          surname: "Doe",
          photo: "photo.png",
        },
      },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "No profile found by this id: user123",
    });
  });

  test("should return 200 if profile updated successfully with photo", async () => {
    const mockResult = {
      _id: "user123",
      enabled: true,
      email: "new@example.com",
      name: "John",
      surname: "Doe",
      photo: "photo.png",
      role: "user",
    };
    mockExec.mockResolvedValue(mockResult);

    await updateProfile("User", req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      message: "we update this profile by this id: user123",
    });
  });

  test("should return 200 if profile updated successfully without photo", async () => {
    req.body.photo = undefined;
    const mockResult = {
      _id: "user123",
      enabled: true,
      email: "new@example.com",
      name: "John",
      surname: "Doe",
      photo: undefined,
      role: "user",
    };
    mockExec.mockResolvedValue(mockResult);

    await updateProfile("User", req, res);

    expect(MockUser.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "user123", removed: false },
      {
        $set: {
          email: "new@example.com",
          name: "John",
          surname: "Doe",
        },
      },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: mockResult,
      message: "we update this profile by this id: user123",
    });
  });
});
