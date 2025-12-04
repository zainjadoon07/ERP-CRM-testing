// tests/utils/checkAndCorrectURL.test.js
const checkAndCorrectURL = require('../../../../src/controllers/middlewaresControllers/createAuthMiddleware/checkAndCorrectURL');

describe('checkAndCorrectURL - 3 Tests for 100%', () => {
  it('1. HTTPS URL → https://cleaned', () => {
    expect(checkAndCorrectURL('https://test.com/')).toBe('https://test.com');
  });

  it('2. HTTP URL → http://cleaned', () => {
    expect(checkAndCorrectURL('http://test.com/')).toBe('http://test.com');
  });

  it('3. No protocol → http://cleaned', () => {
    expect(checkAndCorrectURL('test.com/')).toBe('http://test.com');
  });
});