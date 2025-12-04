const create = require("../../../../src/controllers/middlewaresControllers/createCRUDController/create");

describe("create factory controller", () => {
  let MockModel;
  let req, res, savedDoc;

  beforeEach(() => {
    savedDoc = { _id: "123", name: "Test Item", removed: false };

    // Fake Model with `.save()`
    MockModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(savedDoc),
    }));

    req = {
      body: { name: "Test Item" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("should create a document and return 200 response", async () => {
    await create(MockModel, req, res);

    // req.body should get removed = false injected
    expect(req.body.removed).toBe(false);

    // Should call Model constructor with correct data
    expect(MockModel).toHaveBeenCalledWith({
      name: "Test Item",
      removed: false,
    });

    // Should return 200 with correct response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: savedDoc,
      message: "Successfully Created the document in Model ",
    });
  });
});
