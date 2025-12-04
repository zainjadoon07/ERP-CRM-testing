jest.mock("resend");
jest.mock("../../../../src/emailTemplate/emailVerfication", () => ({
  passwordVerfication: jest.fn(() => "<html>Email Template</html>"),
}));

const { passwordVerfication } = require("../../../../src/emailTemplate/emailVerfication");
const { Resend } = require("resend");
const sendMail = require("../../../../src/controllers/middlewaresControllers/createAuthMiddleware/sendMail");

describe("sendMail Helper", () => {
  let mockSend;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSend = jest.fn();

    Resend.mockImplementation(() => ({
      emails: { send: mockSend },
    }));
  });

  test("should send email with correct arguments and return data", async () => {
    const mockData = { id: "email_12345" };
    mockSend.mockResolvedValue({ data: mockData });

    const result = await sendMail({
      email: "test@example.com",
      name: "John Doe",
      link: "https://verify.com",
      idurar_app_email: "noreply@idurar.com",
      subject: "Verify Email",
    });

    expect(passwordVerfication).toHaveBeenCalledWith({
      name: "John Doe",
      link: "https://verify.com",
    });

    expect(mockSend).toHaveBeenCalledWith({
      from: "noreply@idurar.com",
      to: "test@example.com",
      subject: "Verify Email",
      html: "<html>Email Template</html>",
    });

    expect(result).toEqual(mockData);
  });

  test("should throw when resend fails", async () => {
    mockSend.mockRejectedValue(new Error("Email failed"));

    await expect(
      sendMail({
        email: "test@example.com",
        name: "John",
        link: "https://verify.com",
        idurar_app_email: "noreply@idurar.com",
      })
    ).rejects.toThrow("Email failed");
  });
});

