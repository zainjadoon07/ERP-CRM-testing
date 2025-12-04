const mongoose = require("mongoose");
const listAllSettings = require("../../../src/middlewares/settings/listAllSettings");

jest.mock("mongoose", () => {
  const mExec = jest.fn();
  const mFind = jest.fn(() => ({ exec: mExec }));
  return {
    model: jest.fn(() => ({
      find: mFind,
    })),
  };
});

describe("listAllSettings", () => {
  let mExec;
  let mFind;

  beforeEach(() => {
    jest.clearAllMocks();
    const mModel = mongoose.model();
    mFind = mModel.find;
    mExec = mFind().exec;
  });

  test("should return list of documents if found", async () => {
    const mockData = [{ settingKey: "key1", settingValue: 1 }];
    mExec.mockResolvedValue(mockData);

    const result = await listAllSettings();

    expect(mFind).toHaveBeenCalledWith({ removed: false });
    expect(result).toEqual(mockData);
  });

  test("should return empty array if no documents found", async () => {
    mExec.mockResolvedValue([]);

    const result = await listAllSettings();

    expect(mFind).toHaveBeenCalledWith({ removed: false });
    expect(result).toEqual([]);
  });

  test("should return empty array if an error occurs", async () => {
    mExec.mockRejectedValue(new Error("Some error"));

    const result = await listAllSettings();

    expect(result).toEqual([]);
  });
});
