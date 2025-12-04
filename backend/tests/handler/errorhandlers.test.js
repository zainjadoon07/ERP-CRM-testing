const {
  catchErrors,
  notFound,
  developmentErrors,
  productionErrors,
} = require("../../src/handlers/errorHandlers");

describe("Error Handlers - Branch Coverage", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("catchErrors - generic error object with undefined name", () => {
    test("should handle generic error without name field", async () => {
      const errorFn = jest.fn().mockRejectedValue({ message: "Unknown error" });
      const wrappedFn = catchErrors(errorFn);

      await wrappedFn(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        result: null,
        message: "Unknown error",
        controller: errorFn.name,
        error: { message: "Unknown error" },
      });
    });
  });

  describe("developmentErrors - error.stack undefined", () => {
    test("should handle missing stack", () => {
      const error = { message: "Dev error", stack: undefined };
      developmentErrors(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Dev error",
        error,
      });
    });
  });

  describe("productionErrors - generic branch already covered", () => {
    test("should still return 500 with error", () => {
      const error = { message: "Prod error" };
      productionErrors(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Prod error",
        error,
      });
    });
  });

  describe("notFound - no extra branches", () => {
    test("should still return 404", () => {
      notFound(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Api url doesn't exist ",
      });
    });
  });
});
