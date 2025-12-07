const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    defaultCommandTimeout: 30000, // Increased to 20 seconds
    pageLoadTimeout: 60000,       // Increased to 60 seconds
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
