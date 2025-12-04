const mongoose = require("mongoose");
const increaseBySettingKey = require("../../../src/middlewares/settings/increaseBySettingKey");

jest.mock("mongoose", () => {
  const mExec = jest.fn();
  const mFindOneAndUpdate = jest.fn(() => ({ exec: mExec }));
  return {
    model: jest.fn(() => ({
      findOneAndUpdate: mFindOneAndUpdate,
    })),
  };
});

describe("increaseBySettingKey", () => {
  let mExec;
  let mFindOneAndUpdate;

  beforeEach(() => {
    jest.clearAllMocks();
    const mModel = mongoose.model();
    mFindOneAndUpdate = mModel.findOneAndUpdate;
    mExec = mFindOneAndUpdate().exec;
  });

  test("should return null if settingKey is not provided", async () => {
    const result = await increaseBySettingKey({});
    expect(result).toBeNull();
  });

  test("should return null if document not found", async () => {
    mExec.mockResolvedValue(null);
    const result = await increaseBySettingKey({ settingKey: "testKey" });
    expect(mFindOneAndUpdate).toHaveBeenCalledWith(
      { settingKey: "testKey" },
      { $inc: { settingValue: 1 } },
      { new: true, runValidators: true }
    );
    expect(result).toBeNull();
  });

  test("should return the updated document if found", async () => {
    const mockDoc = { settingKey: "testKey", settingValue: 42 };
    mExec.mockResolvedValue(mockDoc);

    const result = await increaseBySettingKey({ settingKey: "testKey" });

    expect(mFindOneAndUpdate).toHaveBeenCalledWith(
      { settingKey: "testKey" },
      { $inc: { settingValue: 1 } },
      { new: true, runValidators: true }
    );
    expect(result).toEqual(mockDoc);
  });

  test("should return null if an error is thrown", async () => {
    mExec.mockRejectedValue(new Error("Some error"));
    const result = await increaseBySettingKey({ settingKey: "testKey" });
    expect(result).toBeNull();
  });
});
