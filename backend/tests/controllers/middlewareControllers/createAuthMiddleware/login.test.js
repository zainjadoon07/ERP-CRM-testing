// tests/controllers/middlewareControllers/createAuthMiddleware/login.test.js

jest.mock('joi', () => {
  const mockValidate = jest.fn();
  const Joi = {
    object: () => ({
      validate: mockValidate,
    }),
    string: () => ({
      email: () => ({
        required: () => ({}),
      }),
      required: () => ({}),
    }),
  };
  Joi._mockValidate = mockValidate;
  return Joi;
});

jest.mock('mongoose', () => ({
  model: jest.fn(),
}));

jest.mock('../../../../src/controllers/middlewaresControllers/createAuthMiddleware/authUser');

const mongoose = require('mongoose');
const login = require('../../../../src/controllers/middlewaresControllers/createAuthMiddleware/login');
const authUser = require('../../../../src/controllers/middlewaresControllers/createAuthMiddleware/authUser');

describe('login - 100% Coverage', () => {
  let req, res, UserModel, UserPasswordModel;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = { 
      body: {
        email: '',
        password: ''
      }
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    
    UserModel = { findOne: jest.fn() };
    UserPasswordModel = { findOne: jest.fn() };
    
    mongoose.model
      .mockReturnValueOnce(UserPasswordModel)
      .mockReturnValueOnce(UserModel);
  });

  it('1. Invalid email validation → 409', async () => {
    const Joi = require('joi');
    Joi._mockValidate.mockReturnValue({
      error: { message: 'Invalid email format' },
      value: null
    });
    
    req.body.email = 'invalid-email';
    req.body.password = 'password123';
    
    await login(req, res, { userModel: 'User' });
    
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      error: { message: 'Invalid email format' },
      message: 'Invalid/Missing credentials.',
      errorMessage: 'Invalid email format',
    });
  });

  it('2. Missing password → 409', async () => {
    const Joi = require('joi');
    Joi._mockValidate.mockReturnValue({
      error: { message: 'Password is required' },
      value: null
    });
    
    req.body.email = 'test@email.com';
    req.body.password = '';
    
    await login(req, res, { userModel: 'User' });
    
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      error: { message: 'Password is required' },
      message: 'Invalid/Missing credentials.',
      errorMessage: 'Password is required',
    });
  });

  it('3. User not found → 404', async () => {
    const Joi = require('joi');
    Joi._mockValidate.mockReturnValue({
      error: null,
      value: { email: 'test@email.com', password: 'password123' }
    });
    
    req.body.email = 'test@email.com';
    req.body.password = 'password123';
    
    UserModel.findOne.mockResolvedValue(null);
    
    await login(req, res, { userModel: 'User' });
    
    expect(UserModel.findOne).toHaveBeenCalledWith({ 
      email: 'test@email.com', 
      removed: false 
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });
  });

  it('4. User account disabled → 409', async () => {
    const Joi = require('joi');
    Joi._mockValidate.mockReturnValue({
      error: null,
      value: { email: 'test@email.com', password: 'password123' }
    });
    
    req.body.email = 'test@email.com';
    req.body.password = 'password123';
    
    const mockUser = {
      _id: 'user123',
      email: 'test@email.com',
      enabled: false,
      removed: false
    };
    
    UserModel.findOne.mockResolvedValue(mockUser);
    UserPasswordModel.findOne.mockResolvedValue({
      user: 'user123',
      password: 'hashed-password',
      removed: false
    });
    
    await login(req, res, { userModel: 'User' });
    
    expect(UserPasswordModel.findOne).toHaveBeenCalledWith({ 
      user: 'user123', 
      removed: false 
    });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    });
    expect(authUser).not.toHaveBeenCalled();
  });

  it('5. Valid credentials and enabled user → calls authUser', async () => {
    const Joi = require('joi');
    Joi._mockValidate.mockReturnValue({
      error: null,
      value: { email: 'test@email.com', password: 'password123' }
    });
    
    req.body.email = 'test@email.com';
    req.body.password = 'password123';
    
    const mockUser = {
      _id: 'user123',
      email: 'test@email.com',
      name: 'John Doe',
      enabled: true,
      removed: false
    };
    
    const mockDatabasePassword = {
      user: 'user123',
      password: 'hashed-password',
      removed: false
    };
    
    UserModel.findOne.mockResolvedValue(mockUser);
    UserPasswordModel.findOne.mockResolvedValue(mockDatabasePassword);
    authUser.mockImplementation(() => {});
    
    await login(req, res, { userModel: 'User' });
    
    expect(UserModel.findOne).toHaveBeenCalledWith({ 
      email: 'test@email.com', 
      removed: false 
    });
    expect(UserPasswordModel.findOne).toHaveBeenCalledWith({ 
      user: 'user123', 
      removed: false 
    });
    expect(authUser).toHaveBeenCalledWith(req, res, {
      user: mockUser,
      databasePassword: mockDatabasePassword,
      password: 'password123',
      UserPasswordModel: UserPasswordModel,
    });
  });


});