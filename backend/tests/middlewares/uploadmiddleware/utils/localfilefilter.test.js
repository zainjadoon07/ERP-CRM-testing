// tests/utils/localfilefilter.test.js
const fileFilter = require('../../../../src/middlewares/uploadMiddleware/utils/LocalfileFilter');

describe('fileFilter middleware', () => {
  const cbMock = jest.fn();

  beforeEach(() => {
    cbMock.mockReset();
  });

  const createFile = (mimetype) => ({ mimetype });

  test('should allow any file type if default', () => {
    const filter = fileFilter('default');
    const file = createFile('any/type');
    filter({}, file, cbMock);

    expect(cbMock).toHaveBeenCalledWith(null, true);
  });

  test('should allow only images for type=image', () => {
    const filter = fileFilter('image');

    const imageFile = createFile('image/png');
    const nonImageFile = createFile('application/pdf');

    filter({}, imageFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();

    filter({}, nonImageFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(expect.any(Error));
    expect(cbMock.mock.calls[0][0].message).toMatch(/File type not supported/);
  });

  test('should allow only pdf for type=pdf', () => {
    const filter = fileFilter('pdf');

    const pdfFile = createFile('application/pdf');
    const docFile = createFile('application/msword');

    filter({}, pdfFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, docFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should allow only videos for type=video', () => {
    const filter = fileFilter('video');

    const videoFile = createFile('video/mp4');
    const audioFile = createFile('audio/mpeg');

    filter({}, videoFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, audioFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should allow only audio for type=audio', () => {
    const filter = fileFilter('audio');

    const audioFile = createFile('audio/mpeg');
    const videoFile = createFile('video/mp4');

    filter({}, audioFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, videoFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should allow only text or word/excel for type=text', () => {
    const filter = fileFilter('text');

    const textFile = createFile('text/plain');
    const wordFile = createFile('application/msword');
    const excelFile = createFile('application/vnd.ms-excel');
    const pdfFile = createFile('application/pdf');

    filter({}, textFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, wordFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, excelFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, pdfFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should allow only excel files for type=excel', () => {
    const filter = fileFilter('excel');

    const excelFile1 = createFile('application/vnd.ms-excel');
    const excelFile2 = createFile(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const docFile = createFile('application/msword');

    filter({}, excelFile1, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, excelFile2, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, docFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should allow only compressed files for type=compressed', () => {
    const filter = fileFilter('compressed');

    const zipFile = createFile('application/zip');
    const rarFile = createFile('application/vnd.rar');
    const txtFile = createFile('text/plain');

    filter({}, zipFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, rarFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(null, true);

    cbMock.mockReset();
    filter({}, txtFile, cbMock);
    expect(cbMock).toHaveBeenCalledWith(expect.any(Error));
  });
});
