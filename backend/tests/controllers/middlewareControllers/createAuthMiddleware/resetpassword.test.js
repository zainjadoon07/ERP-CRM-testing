// tests/controllers/middlewareControllers/createAuthMiddleware/resetPassword.test.js

jest.mock('mongoose', () => ({
  model: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('shortid', () => ({
  generate: jest.fn(),
}));

jest.mock('joi', () => {
  const mockValidate = jest.fn();
  return {
    object: () => ({
      validate: mockValidate,
    }),
    string: () => ({
      required: () => ({}),
    }),
    _mockValidate: mockValidate,
  };
});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const Joi = require('joi');

const resetPassword = require('../../../../src/controllers/middlewaresControllers/createAuthMiddleware/resetPassword');

describe('resetPassword - 100% Coverage', () => {
  let req, res, UserPasswordModel, UserModel;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        password: 'newpass',
        userId: 'u123',
        resetToken: 'reset-123',
        remember: false,
      },
      hostname: 'localhost',
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };

    UserPasswordModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    UserModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    mongoose.model
      .mockReturnValueOnce(UserPasswordModel) // UserPassword
      .mockReturnValueOnce(UserModel);        // User
  });

  it('1. Should return 409 when user is disabled', async () => {
    UserPasswordModel.findOne.mockResolvedValue({ resetToken: 'reset-123' });
    UserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ enabled: false }) });

    await resetPassword(req, res, { userModel: 'User' });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    });
  });

  it('2. Should return 404 when user or password record is missing', async () => {
  // CASE: user exists but password record missing
  UserPasswordModel.findOne.mockResolvedValue(null); // missing password record
  UserModel.findOne.mockReturnValue({
    exec: jest.fn().mockResolvedValue({ enabled: true }) // user exists and enabled
  });

  await resetPassword(req, res, { userModel: 'User' });

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    result: null,
    message: 'No account with this email has been registered.',
  });
});


  it('3. Should return 403 when reset token is invalid, undefined or null', async () => {
    UserPasswordModel.findOne.mockResolvedValue({ resetToken: undefined });
    UserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ enabled: true }) });

    await resetPassword(req, res, { userModel: 'User' });

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Invalid reset token',
    });
  });

  it('4. Should return 409 when Joi validation fails', async () => {
    UserPasswordModel.findOne.mockResolvedValue({ resetToken: 'reset-123' });
    UserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ enabled: true }) });

    Joi._mockValidate.mockReturnValue({
      error: { message: 'Invalid object' },
      value: null,
    });

    await resetPassword(req, res, { userModel: 'User' });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      error: { message: 'Invalid object' },
      message: 'Invalid reset password object',
      errorMessage: 'Invalid object',
    });
  });

  it('5. Should return 200 on successful reset', async () => {
    // Valid database entries
    const dbPassword = { resetToken: 'reset-123' };
    const dbUser = {
      _id: 'u123',
      name: 'John',
      surname: 'Doe',
      role: 'user',
      email: 'john@test.com',
      photo: 'img.jpg',
      enabled: true,
    };

    UserPasswordModel.findOne.mockResolvedValue(dbPassword);
    UserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(dbUser) });

    Joi._mockValidate.mockReturnValue({ error: null, value: req.body });

    shortid.generate
      .mockReturnValueOnce('salt123')   // salt
      .mockReturnValueOnce('emailtok')  // email token
      .mockReturnValueOnce('new-reset-token'); // resetToken update

    bcrypt.hashSync.mockReturnValue('hashed-pass');

    jwt.sign.mockReturnValue('jwt-token');

    const execMock = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: execMock });

    await resetPassword(req, res, { userModel: 'User' });

    expect(UserPasswordModel.findOneAndUpdate).toHaveBeenCalledWith(
      { user: 'u123' },
      {
        $push: { loggedSessions: 'jwt-token' },
        password: 'hashed-pass',
        salt: 'salt123',
        emailToken: 'emailtok',
        resetToken: 'new-reset-token',
        emailVerified: true,
      },
      { new: true }
    );

    expect(execMock).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {
        _id: 'u123',
        name: 'John',
        surname: 'Doe',
        role: 'user',
        email: 'john@test.com',
        photo: 'img.jpg',
        token: 'jwt-token',
        maxAge: null,
      },
      message: 'Successfully resetPassword user',
    });
  });
});
