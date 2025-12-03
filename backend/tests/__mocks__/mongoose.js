// Mock mongoose for Jest tests
module.exports = {
  model: jest.fn(() => ({
    collection: {
      name: 'invoices'
    }
  })),
  Schema: jest.fn(),
  Types: {
    ObjectId: jest.fn()
  }
};