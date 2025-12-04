// tests/controllers/middlewareControllers/createAuthMiddleware/authUser.test.js

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authUser = require('../../../../src/controllers/middlewaresControllers/createAuthMiddleware/authUser');

describe('authUser Middleware - Complete Coverage', () => {
  let req, res, UserPasswordModel;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {},
      hostname: 'localhost',
    };
    
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    
    UserPasswordModel = {
      findOneAndUpdate: jest.fn(() => ({
        exec: jest.fn(),
      })),
    };
  });

  // Keep the original 3 tests for core logic
  it('Test 1: bcrypt.compare returns false → 403 error', async () => {
    const user = { _id: 'user123' };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'wrong-password';
    
    bcrypt.compare.mockResolvedValue(false);
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Invalid credentials.',
    });
  });

  it('Test 2: bcrypt.compare returns true, remember false → success', async () => {
    const user = {
      _id: 'user123',
      name: 'John',
      surname: 'Doe',
      role: 'admin',
      email: 'john@example.com',
      photo: 'photo.jpg',
    };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'correct-password';
    req.body.remember = false;
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('Test 3: bcrypt.compare returns true, remember true → success with longer token', async () => {
    const user = {
      _id: 'user123',
      name: 'Jane',
      surname: 'Smith',
      role: 'user',
      email: 'jane@example.com',
      photo: null,
    };
    const databasePassword = { salt: 'salt456', password: 'hashed-password-2' };
    const password = 'correct-password-2';
    req.body.remember = true;
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-long-token');
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '8760h' }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // NEW TESTS FOR MISSING COVERAGE
  
  // Test 4: Database update fails (async error)
  it('Test 4: Database update throws error → should propagate error', async () => {
    const user = {
      _id: 'user123',
      name: 'John',
      surname: 'Doe',
      role: 'admin',
      email: 'john@example.com',
      photo: 'photo.jpg',
    };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'correct-password';
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    
    // Mock exec to reject (database error)
    const mockExec = jest.fn().mockRejectedValue(new Error('Database connection failed'));
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    // Should propagate the error
    await expect(authUser(req, res, { user, databasePassword, password, UserPasswordModel }))
      .rejects.toThrow('Database connection failed');
    
    // Verify jwt.sign was still called
    expect(jwt.sign).toHaveBeenCalled();
  });

  // Test 5: bcrypt.compare throws error
  it('Test 5: bcrypt.compare throws error → should propagate error', async () => {
    const user = { _id: 'user123' };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'some-password';
    
    // Mock bcrypt.compare to throw error
    bcrypt.compare.mockRejectedValue(new Error('bcrypt error'));
    
    // Should propagate the error
    await expect(authUser(req, res, { user, databasePassword, password, UserPasswordModel }))
      .rejects.toThrow('bcrypt error');
    
    expect(res.status).not.toHaveBeenCalled();
  });

  // Test 6: Edge case - isMatch is not boolean (should never happen but we test it)
  it('Test 6: isMatch is not boolean → goes to else block', async () => {
    const user = { _id: 'user123' };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'some-password';
    
    // Mock bcrypt.compare to return something that's not true/false
    // Note: bcrypt.compare should always return boolean, but we test the else block
    bcrypt.compare.mockResolvedValue('not-a-boolean');
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    // Should go to the else block (lines 41-48)
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      result: null,
      message: 'Invalid credentials.',
    });
  });

  // Test 7: Edge case - user object missing some properties
  it('Test 7: User object with minimal properties → still works', async () => {
    const user = {
      _id: 'user123',
      // No name, surname, role, email, photo
    };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'correct-password';
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    // Should still succeed with undefined properties
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {
        _id: 'user123',
        name: undefined,
        surname: undefined,
        role: undefined,
        email: undefined,
        photo: undefined,
        token: 'mock-jwt-token',
        maxAge: null,
      },
      message: 'Successfully login user',
    });
  });

  // Test 8: Test with remember as undefined
  it('Test 8: req.body.remember is undefined → uses 24h token', async () => {
    const user = { _id: 'user123', name: 'Test' };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'correct-password';
    req.body.remember = undefined; // Explicitly undefined
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    // Should use 24h when remember is undefined
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  // Test 9: Test with remember as null
  it('Test 9: req.body.remember is null → uses 24h token', async () => {
    const user = { _id: 'user123', name: 'Test' };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'correct-password';
    req.body.remember = null;
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    // Should use 24h when remember is null
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  // Test 10: Test with remember as empty string
  it('Test 10: req.body.remember is empty string → uses 24h token', async () => {
    const user = { _id: 'user123', name: 'Test' };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'correct-password';
    req.body.remember = '';
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    // Empty string is falsy, should use 24h
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  // Test 11: Test with remember as 0 (falsy number)
  it('Test 11: req.body.remember is 0 → uses 24h token', async () => {
    const user = { _id: 'user123', name: 'Test' };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'correct-password';
    req.body.remember = 0;
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    // 0 is falsy, should use 24h
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  // Test 12: Test with remember as false explicitly
  it('Test 12: req.body.remember is false → uses 24h token', async () => {
    const user = { _id: 'user123', name: 'Test' };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'correct-password';
    req.body.remember = false;
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  // Test 13: Test with remember as truthy non-boolean
  it('Test 13: req.body.remember is truthy non-boolean (e.g., 1) → uses 8760h token', async () => {
    const user = { _id: 'user123', name: 'Test' };
    const databasePassword = { salt: 'salt123', password: 'hashed-password' };
    const password = 'correct-password';
    req.body.remember = 1; // Truthy number
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { user, databasePassword, password, UserPasswordModel });
    
    // 1 is truthy, should use 8760h
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123' },
      process.env.JWT_SECRET,
      { expiresIn: '8760h' }
    );
  });
});

// Minimal version that still gets 100% (6 essential tests)
describe('authUser - Minimal 100% Coverage (6 Tests)', () => {
  let req, res, UserPasswordModel;
  
  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = { status: jest.fn(() => res), json: jest.fn(() => res) };
    UserPasswordModel = { 
      findOneAndUpdate: jest.fn(() => ({ exec: jest.fn() })) 
    };
  });

  it('1. Password wrong → 403', async () => {
    bcrypt.compare.mockResolvedValue(false);
    await authUser(req, res, { 
      user: { _id: '1' }, 
      databasePassword: { salt: 's', password: 'p' }, 
      password: 'wrong', 
      UserPasswordModel 
    });
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('2. bcrypt.compare throws → propagates error', async () => {
    bcrypt.compare.mockRejectedValue(new Error('bcrypt error'));
    await expect(authUser(req, res, { 
      user: { _id: '1' }, 
      databasePassword: { salt: 's', password: 'p' }, 
      password: 'pass', 
      UserPasswordModel 
    })).rejects.toThrow('bcrypt error');
  });

  it('3. Password right, remember false → 200, 24h token', async () => {
    bcrypt.compare.mockResolvedValue(true);
    req.body.remember = false;
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { 
      user: { _id: '1', name: 'Test' }, 
      databasePassword: { salt: 's', password: 'p' }, 
      password: 'correct', 
      UserPasswordModel 
    });
    
    expect(jwt.sign).toHaveBeenCalledWith({ id: '1' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('4. Password right, remember true → 200, 8760h token', async () => {
    bcrypt.compare.mockResolvedValue(true);
    req.body.remember = true;
    const mockExec = jest.fn().mockResolvedValue({});
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await authUser(req, res, { 
      user: { _id: '1', name: 'Test' }, 
      databasePassword: { salt: 's', password: 'p' }, 
      password: 'correct', 
      UserPasswordModel 
    });
    
    expect(jwt.sign).toHaveBeenCalledWith({ id: '1' }, process.env.JWT_SECRET, { expiresIn: '8760h' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('5. Database update throws → propagates error', async () => {
    bcrypt.compare.mockResolvedValue(true);
    const mockExec = jest.fn().mockRejectedValue(new Error('DB error'));
    UserPasswordModel.findOneAndUpdate.mockReturnValue({ exec: mockExec });
    
    await expect(authUser(req, res, { 
      user: { _id: '1' }, 
      databasePassword: { salt: 's', password: 'p' }, 
      password: 'correct', 
      UserPasswordModel 
    })).rejects.toThrow('DB error');
  });

  it('6. isMatch is non-boolean → else block 403', async () => {
    bcrypt.compare.mockResolvedValue('not-boolean');
    
    await authUser(req, res, { 
      user: { _id: '1' }, 
      databasePassword: { salt: 's', password: 'p' }, 
      password: 'pass', 
      UserPasswordModel 
    });
    
    expect(res.status).toHaveBeenCalledWith(403);
  });
});