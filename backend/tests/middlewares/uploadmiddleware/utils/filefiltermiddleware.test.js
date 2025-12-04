// tests/utils/fileFilterMiddleware.test.js
const fileFilterMiddleware = require('../../../../src/middlewares/uploadMiddleware/utils/fileFilterMiddleware');

describe('fileFilterMiddleware', () => {
  test('should allow all files if type is default', () => {
    expect(fileFilterMiddleware({ type: 'default', mimetype: 'any/type' })).toBe(true);
  });

  test('should allow only images for type=image', () => {
    expect(fileFilterMiddleware({ type: 'image', mimetype: 'image/png' })).toBe(true);
    expect(fileFilterMiddleware({ type: 'image', mimetype: 'application/pdf' })).toBe(false);
  });

  test('should allow only pdf for type=pdf', () => {
    expect(fileFilterMiddleware({ type: 'pdf', mimetype: 'application/pdf' })).toBe(true);
    expect(fileFilterMiddleware({ type: 'pdf', mimetype: 'image/jpeg' })).toBe(false);
  });

  test('should allow only videos for type=video', () => {
    expect(fileFilterMiddleware({ type: 'video', mimetype: 'video/mp4' })).toBe(true);
    expect(fileFilterMiddleware({ type: 'video', mimetype: 'audio/mpeg' })).toBe(false);
  });

  test('should allow only audio for type=audio', () => {
    expect(fileFilterMiddleware({ type: 'audio', mimetype: 'audio/mpeg' })).toBe(true);
    expect(fileFilterMiddleware({ type: 'audio', mimetype: 'video/mp4' })).toBe(false);
  });

  test('should allow text, word, excel for type=text', () => {
    expect(fileFilterMiddleware({ type: 'text', mimetype: 'text/plain' })).toBe(true);
    expect(fileFilterMiddleware({ type: 'text', mimetype: 'application/msword' })).toBe(true);
    expect(fileFilterMiddleware({ type: 'text', mimetype: 'application/vnd.ms-excel' })).toBe(true);
    expect(fileFilterMiddleware({ type: 'text', mimetype: 'application/pdf' })).toBe(false);
  });

  test('should allow only excel for type=excel', () => {
    expect(fileFilterMiddleware({ type: 'excel', mimetype: 'application/vnd.ms-excel' })).toBe(true);
    expect(
      fileFilterMiddleware({
        type: 'excel',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    ).toBe(true);
    expect(fileFilterMiddleware({ type: 'excel', mimetype: 'application/msword' })).toBe(false);
  });

  test('should allow only compressed for type=compressed', () => {
    expect(fileFilterMiddleware({ type: 'compressed', mimetype: 'application/zip' })).toBe(true);
    expect(fileFilterMiddleware({ type: 'compressed', mimetype: 'application/vnd.rar' })).toBe(true);
    expect(fileFilterMiddleware({ type: 'compressed', mimetype: 'text/plain' })).toBe(false);
  });

  test('should return false for unsupported mimetype', () => {
    expect(fileFilterMiddleware({ type: 'image', mimetype: 'video/mp4' })).toBe(false);
    expect(fileFilterMiddleware({ type: 'pdf', mimetype: 'text/plain' })).toBe(false);
  });
});
