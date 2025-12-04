// tests/controllers/middlewareControllers/createAuthMiddleware/isValidAuthToken.test.js

jest.mock('jsonwebtoken');
jest.mock('mongoose', () => ({
  model: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const isValidAuthToken = require('../../../../src/controllers/middlewaresControllers/createAuthMiddleware/isValidAuthToken');

describe('isValidAuthToken - 100% Coverage', () => {
  let req, res, next, User, UserPassword;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      headers: {},
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    next = jest.fn();
    
    User = { findOne: jest.fn() };
    UserPassword = { findOne: jest.fn() };
    
    mongoose.model
      .mockReturnValueOnce(UserPassword)
      .mockReturnValueOnce(User);
    
    // Mock environment variable
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('1. No token provided → 401', async () => {
    req.headers['authorization'] = undefined;
    
    await isValidAuthToken(req, res, next, { userModel: 'User' });
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No authentication token, authorization denied.',
      jwtExpired: true,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('2. Authorization header without Bearer token → 401', async () => {
    req.headers['authorization'] = 'InvalidFormat';
    
    await isValidAuthToken(req, res, next, { userModel: 'User' });
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'No authentication token, authorization denied.',
      jwtExpired: true,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('3. Token verification fails (jwt.verify returns falsy) → 401', async () => {
    req.headers['authorization'] = 'Bearer invalid-token';
    jwt.verify.mockReturnValue(null); // Falsy value
    
    await isValidAuthToken(req, res, next, { userModel: 'User' });
    
    expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret-key');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Token verification failed, authorization denied.',
      jwtExpired: true,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('4. Token verification throws error → 500', async () => {
    req.headers['authorization'] = 'Bearer malformed-token';
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt malformed');
    });
    
    await isValidAuthToken(req, res, next, { userModel: 'User' });
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'jwt malformed',
      error: expect.any(Error),
      controller: 'isValidAuthToken',
      jwtExpired: true,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('5. User not found in database → 401', async () => {
    req.headers['authorization'] = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user123' });
    
    User.findOne.mockResolvedValue(null);
    UserPassword.findOne.mockResolvedValue({ loggedSessions: ['valid-token'] });
    
    await isValidAuthToken(req, res, next, { userModel: 'User' });
    
    expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123', removed: false });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: "User doens't Exist, authorization denied.",
      jwtExpired: true,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('6. Token not in logged sessions (user logged out) → 401', async () => {
    req.headers['authorization'] = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user123' });
    
    User.findOne.mockResolvedValue({ 
      _id: 'user123', 
      name: 'John Doe',
      removed: false 
    });
    UserPassword.findOne.mockResolvedValue({ 
      user: 'user123',
      loggedSessions: ['different-token', 'another-token'],
      removed: false
    });
    
    await isValidAuthToken(req, res, next, { userModel: 'User' });
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'User is already logout try to login, authorization denied.',
      jwtExpired: true,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('7. Valid token and user authenticated → calls next()', async () => {
    req.headers['authorization'] = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user123' });
    
    const mockUser = { 
      _id: 'user123', 
      name: 'John Doe',
      email: 'john@example.com',
      removed: false 
    };
    
    User.findOne.mockResolvedValue(mockUser);
    UserPassword.findOne.mockResolvedValue({ 
      user: 'user123',
      loggedSessions: ['valid-token', 'other-session'],
      removed: false
    });
    
    await isValidAuthToken(req, res, next, { userModel: 'User' });
    
    expect(UserPassword.findOne).toHaveBeenCalledWith({ user: 'user123', removed: false });
    expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123', removed: false });
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  

  it('9. Custom JWT secret environment variable → uses custom secret', async () => {
    process.env.CUSTOM_JWT_SECRET = 'custom-secret-key';
    
    req.headers['authorization'] = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user123' });
    
    User.findOne.mockResolvedValue({ _id: 'user123', removed: false });
    UserPassword.findOne.mockResolvedValue({ 
      user: 'user123',
      loggedSessions: ['valid-token'],
      removed: false
    });
    
    await isValidAuthToken(req, res, next, { 
      userModel: 'User',
      jwtSecret: 'CUSTOM_JWT_SECRET'
    });
    
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'custom-secret-key');
    expect(next).toHaveBeenCalled();
    
    delete process.env.CUSTOM_JWT_SECRET;
  });

 
});