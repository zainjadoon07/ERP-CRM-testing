// tests/middlewares/settings/readbysettingkey.test.js
const mongoose = require('mongoose');

// Mock mongoose.model BEFORE importing the module
const findOneMock = jest.fn();
mongoose.model = jest.fn().mockReturnValue({
  findOne: findOneMock,
});

const readBySettingKey = require('../../../src/middlewares/settings/readBySettingKey');

describe('readBySettingKey', () => {
  beforeEach(() => {
    findOneMock.mockReset();
  });

  test('should return null if settingKey is not provided', async () => {
    const result = await readBySettingKey({ settingKey: '' });
    expect(result).toBeNull();
    expect(findOneMock).not.toHaveBeenCalled();
  });

  test('should return the document if found', async () => {
    const mockDoc = { settingKey: 'key1', settingValue: 10 };
    findOneMock.mockResolvedValue(mockDoc);

    const result = await readBySettingKey({ settingKey: 'key1' });

    expect(findOneMock).toHaveBeenCalledWith({ settingKey: 'key1' });
    expect(result).toEqual(mockDoc);
  });

  test('should return null if no document is found', async () => {
    findOneMock.mockResolvedValue(null);

    const result = await readBySettingKey({ settingKey: 'key2' });

    expect(findOneMock).toHaveBeenCalledWith({ settingKey: 'key2' });
    expect(result).toBeNull();
  });

  test('should return null if an error occurs', async () => {
    findOneMock.mockRejectedValue(new Error('Some error'));

    const result = await readBySettingKey({ settingKey: 'key3' });

    expect(findOneMock).toHaveBeenCalledWith({ settingKey: 'key3' });
    expect(result).toBeNull();
  });
});
