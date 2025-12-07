// cypress/e2e/about.cy.js

describe('About Page E2E Verification', () => {

  beforeEach(() => {
    // 1. Visit Login
    cy.visit('http://localhost:3000/login');
    cy.clearCookies();
    cy.clearLocalStorage();

    // 2. Fast Login (Bypassing credentials as per taxes.cy.js working method)
    // Note: The app currently allows empty login (known issue), we exploit this for test stability
    cy.get('button[type="submit"]').click({ force: true });

    // 3. Wait for dashboard to load (ensures login API completed)
    cy.get('.ant-layout-sider', { timeout: 30000 }).should('be.visible');

    // 4. Force visit About page to ensure we represent a user navigating there
    cy.visit('http://localhost:3000/about');

    // 5. Wait for page load
    cy.get('.ant-result', { timeout: 30000 }).should('be.visible');
  });

  it('TC01: Check About Page Structure & Title', () => {
    cy.get('.ant-result-title').should('contain', 'IDURAR');
    cy.get('.ant-result-icon').should('be.visible');
  });

  it('TC02: Verify Website Link', () => {
    cy.contains('a', 'www.idurarapp.com')
      .should('be.visible')
      .and('have.attr', 'href', 'https://www.idurarapp.com');
  });

  it('TC03: Verify GitHub Link', () => {
    cy.get('a[href*="github.com/idurar/idurar-erp-crm"]')
      .should('be.visible')
      .should('contain', 'idurar-erp-crm');
  });

  it('TC04: Verify Contact Us Button', () => {
    cy.get('button.ant-btn-primary')
      .should('be.visible')
      .invoke('text')
      .should('match', /Contact/i);

    cy.get('button.ant-btn-primary').should('not.be.disabled');
  });

});
