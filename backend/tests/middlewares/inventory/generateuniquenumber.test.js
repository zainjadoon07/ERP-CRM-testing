const generateUniqueNumber = require("../../../src/middlewares/inventory/generateUniqueNumber");

describe("generateUniqueNumber", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2025-12-04T00:00:00Z"));
    jest.spyOn(Math, "random").mockReturnValue(0.5); // fix random for predictability
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.spyOn(Math, "random").mockRestore();
  });

  test("should generate a 13-digit unique number by default", () => {
    const result = generateUniqueNumber(5);
    // 04 12 25 + random 100-999 (fixed at 550) + padded number
    // year=25, month=12, day=04, randomNumber=Math.floor(0.5*900)+100 = 550
    // number = 5+1=6 -> padded to 4 digits = '0006'
    expect(result).toBe("0412255500006");
    expect(result.length).toBe(13);
  });

  test("should generate a number with custom length", () => {
    const result = generateUniqueNumber(42, 15);
    expect(result.length).toBe(15);
  });

  test("should pad the uniqueId part correctly", () => {
    const result = generateUniqueNumber(0);
    // uniqueId+1 = 1 -> padded to 4 digits = '0001'
    expect(result.endsWith("0001")).toBe(true);
  });

  test("should handle large uniqueId", () => {
    const result = generateUniqueNumber(9999);
    expect(result.endsWith("10000")).toBe(true); // 9999+1
  });
});
