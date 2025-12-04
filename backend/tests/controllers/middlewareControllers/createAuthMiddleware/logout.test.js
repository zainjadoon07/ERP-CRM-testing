// tests/controllers/middlewareControllers/createAuthMiddleware/logout.test.js

jest.mock('mongoose', () => ({
  model: jest.fn(),
}));

const mongoose = require('mongoose');
const logout = require('../../../../src/controllers/middlewaresControllers/createAuthMiddleware/logout');

describe('logout - 100% Coverage', () => {
  let req, res, UserPasswordModel;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      headers: {},
      admin: { _id: 'admin123' },
    };

    res = {
      json: jest.fn(() => res),
    };

    UserPasswordModel = {
      findOneAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      }),
    };

    mongoose.model.mockReturnValue(UserPasswordModel);
  });

  it('1. Should remove only the specific token when authorization header exists', async () => {
    req.headers['authorization'] = 'Bearer abc-token';

    await logout(req, res, { userModel: 'User' });

    expect(mongoose.model).toHaveBeenCalledWith('UserPassword');

    expect(UserPasswordModel.findOneAndUpdate).toHaveBeenCalledWith(
      { user: 'admin123' },
      { $pull: { loggedSessions: 'abc-token' } },
      { new: true }
    );

    const execFn = UserPasswordModel.findOneAndUpdate.mock.results[0].value.exec;
    expect(execFn).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {},
      message: 'Successfully logout',
    });
  });

  it('2. Should clear all sessions when no token is provided', async () => {
    req.headers['authorization'] = undefined; // no token

    await logout(req, res, { userModel: 'User' });

    expect(UserPasswordModel.findOneAndUpdate).toHaveBeenCalledWith(
      { user: 'admin123' },
      { loggedSessions: [] },
      { new: true }
    );

    const execFn = UserPasswordModel.findOneAndUpdate.mock.results[0].value.exec;
    expect(execFn).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      result: {},
      message: 'Successfully logout',
    });
  });
});
