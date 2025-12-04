const downloadPdf = require("../../../src/handlers/downloadHandler/downloadPdf");
const custom = require("../../../src/controllers/pdfController");
const mongoose = require("mongoose");

jest.mock("../../../src/controllers/pdfController", () => ({
  generatePdf: jest.fn(),
}));

describe("downloadPdf handler", () => {
  let req, res, ModelMock;

  beforeEach(() => {
    ModelMock = {
      findOne: jest.fn(),
    };

    mongoose.models = {};
    mongoose.model = jest.fn(() => ModelMock);

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      download: jest.fn((path, cb) => cb && cb(null)),
    };

    jest.clearAllMocks();
  });

  test("should return 404 if model does not exist", async () => {
    const directory = "nonexistent";
    await downloadPdf(req, res, { directory, id: "123" });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: `Model 'Nonexistent' does not exist`,
    });
  });

  test("should return 400 if document not found (ValidationError)", async () => {
    const directory = "user";
    const id = "123";

    mongoose.models["User"] = true;

    // FIX: mock findOne().exec() properly
    ModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await downloadPdf(req, res, { directory, id });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      error: undefined,
      message: "Required fields are not supplied",
    });
  });

  test("should call generatePdf and download successfully", async () => {
    const directory = "user";
    const id = "123";

    const doc = { _id: "123" };
    mongoose.models["User"] = true;

    ModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(doc),
    });

    custom.generatePdf.mockImplementation((modelName, options, data, callback) => callback());

    await downloadPdf(req, res, { directory, id });

    expect(custom.generatePdf).toHaveBeenCalled();
    expect(res.download).toHaveBeenCalledWith(
      expect.stringContaining("user-123.pdf"),
      expect.any(Function)
    );
  });

  test("should handle download error", async () => {
    const directory = "user";
    const id = "123";

    const doc = { _id: "123" };
    mongoose.models["User"] = true;

    ModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(doc),
    });

    custom.generatePdf.mockImplementation((modelName, options, data, callback) => callback());

    res.download.mockImplementationOnce((path, cb) => cb(new Error("Download failed")));

    await downloadPdf(req, res, { directory, id });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "Couldn't find file",
      error: "Download failed",
    });
  });

  test("should handle unexpected server errors", async () => {
    const directory = "user";
    const id = "123";

    mongoose.models["User"] = true;
    ModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("Server crashed")),
    });

    await downloadPdf(req, res, { directory, id });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      error: "Server crashed",
      message: "Server crashed",
      controller: "downloadPDF.js",
    });
  });
});
