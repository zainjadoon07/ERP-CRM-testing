// tests/middlewares/upload/doSingleStorage.test.js
const DoSingleStorage = require('../../../src/middlewares/uploadMiddleware/DoSingleStorage');
const fileFilterMiddleware = require('../../../src/middlewares/uploadMiddleware/utils/fileFilterMiddleware');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

jest.mock('../../../src/middlewares/uploadMiddleware/utils/fileFilterMiddleware');
jest.mock('@aws-sdk/client-s3');

describe('DoSingleStorage Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      files: {
        file: {
          name: 'testFile.png',
          mimetype: 'image/png',
          data: Buffer.from('testdata'),
        },
      },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    S3Client.mockClear();
    fileFilterMiddleware.mockClear();
  });

  test('should call next and set field to null if no file provided', async () => {
    req.files = {};
    const middleware = DoSingleStorage({ entity: 'user', fileType: 'image' });
    await middleware(req, res, next);
    expect(req.body.file).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  test('should return 403 if file type is not supported', async () => {
    fileFilterMiddleware.mockReturnValue(false);
    const middleware = DoSingleStorage({ entity: 'user', fileType: 'image' });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        controller: 'DoSingleStorage.js',
        message: 'Error on uploading file',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should upload file and call next if file type is supported', async () => {
    fileFilterMiddleware.mockReturnValue(true);

    // Mock S3 send response
    const mockSend = jest.fn().mockResolvedValue({ $metadata: { httpStatusCode: 200 } });
    S3Client.mockImplementation(() => ({
      send: mockSend,
    }));

    const middleware = DoSingleStorage({ entity: 'user', fileType: 'image' });
    await middleware(req, res, next);

    expect(fileFilterMiddleware).toHaveBeenCalledWith({ type: 'image', mimetype: 'image/png' });
    expect(mockSend).toHaveBeenCalled(); // Ensure S3 upload attempted
    expect(req.upload).toBeDefined();
    expect(req.body.file).toMatch(/public\/uploads\/user\//);
    expect(next).toHaveBeenCalled();
  });

  test('should return 403 if S3 upload fails', async () => {
    fileFilterMiddleware.mockReturnValue(true);

    // S3 send throws error
    const mockSend = jest.fn().mockRejectedValue(new Error('Upload failed'));
    S3Client.mockImplementation(() => ({
      send: mockSend,
    }));

    const middleware = DoSingleStorage({ entity: 'user', fileType: 'image' });
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        controller: 'DoSingleStorage.js',
        message: 'Error on uploading file',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
