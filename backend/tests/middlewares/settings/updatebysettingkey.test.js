// tests/middlewares/settings/updateBySettingKey.test.js
const mongoose = require('mongoose');

// Mock findOneAndUpdate
const findOneAndUpdateMock = jest.fn();
mongoose.model = jest.fn().mockReturnValue({
  findOneAndUpdate: findOneAndUpdateMock,
});

const updateBySettingKey = require('../../..//src/middlewares/settings/updateBySettingKey');

describe('updateBySettingKey', () => {
  beforeEach(() => {
    findOneAndUpdateMock.mockReset();
  });

  test('should return null if settingKey is not provided', async () => {
    const result = await updateBySettingKey({ settingKey: '', settingValue: 5 });
    expect(result).toBeNull();
    expect(findOneAndUpdateMock).not.toHaveBeenCalled();
  });

  test('should return null if settingValue is not provided', async () => {
    const result = await updateBySettingKey({ settingKey: 'key1', settingValue: undefined });
    expect(result).toBeNull();
    expect(findOneAndUpdateMock).not.toHaveBeenCalled();
  });

  test('should return the updated document if found', async () => {
    const mockDoc = { settingKey: 'key1', settingValue: 10 };
    findOneAndUpdateMock.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDoc),
    });

    const result = await updateBySettingKey({ settingKey: 'key1', settingValue: 10 });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { settingKey: 'key1' },
      { settingValue: 10 },
      { new: true, runValidators: true }
    );
    expect(result).toEqual(mockDoc);
  });

  test('should return null if document not found', async () => {
    findOneAndUpdateMock.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const result = await updateBySettingKey({ settingKey: 'key2', settingValue: 5 });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { settingKey: 'key2' },
      { settingValue: 5 },
      { new: true, runValidators: true }
    );
    expect(result).toBeNull();
  });

  test('should return null if an error occurs', async () => {
    findOneAndUpdateMock.mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error('Some error')),
    });

    const result = await updateBySettingKey({ settingKey: 'key3', settingValue: 15 });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { settingKey: 'key3' },
      { settingValue: 15 },
      { new: true, runValidators: true }
    );
    expect(result).toBeNull();
  });
});
