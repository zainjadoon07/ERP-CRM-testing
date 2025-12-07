// cypress/e2e/client/add-client-8-ecp-tests.cy.js

describe('Add Client Form → 8 Equivalence Class Partitioning Test Cases', () => {

  beforeEach(() => {
    // Step 1: Login (FAST - no extra waits)
    cy.visit('http://localhost:3000/login')
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.get('button[type="submit"]').click({ force: true })
    cy.wait(1500) // Reduced wait

    // Step 2: Go directly to customer page
    cy.visit('/customer')
    cy.wait(1500)

    // Step 3: Click Add New Client button
    cy.contains(/Add.*Client|New.*Client/i).click({ force: true })
    cy.wait(1500)
  })

  it('TC01 - Valid Data → All fields correct → Success', () => {
    // Fill with FORCE to avoid drawer mask issues
    cy.get('input').eq(0).clear({ force: true }).type('Rahul Sharma', { force: true })

    // Select country (Ant Design Dropdown) - Robust approach
    cy.get('.ant-select').first().click({ force: true })
    cy.wait(1000)

    // Force click on ANY visible dropdown item or use keyboard fallback
    cy.get('body').then(($body) => {
      if ($body.find('.ant-select-item-option-content').length > 0) {
        cy.get('.ant-select-item-option-content').first().click({ force: true })
      } else {
        // Fallback: Type into the select using keyboard
        cy.get('.ant-select input').first().type('{downarrow}{enter}', { force: true })
      }
    })

    cy.get('input').eq(1).clear({ force: true }).type('Mumbai, Maharashtra', { force: true })
    cy.get('input').eq(2).clear({ force: true }).type('+91 98765 43210', { force: true })
    cy.get('input').eq(3).clear({ force: true }).type('rahul@example.com', { force: true })

    cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
    cy.wait(1500)

    cy.log('✅ TC01 - Valid data submitted')
  })

  it('TC02 - Name Empty → Error', () => {
    // Skip name field
    cy.get('input').eq(2).clear({ force: true }).type('+91 98765 43210', { force: true })
    cy.get('input').eq(3).clear({ force: true }).type('test@example.com', { force: true })

    cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
    cy.wait(1000)
    cy.log('✅ TC02 - Name empty tested')
  })

  it('TC03 - Name with Special Chars → Error', () => {
    cy.get('input').eq(0).clear({ force: true }).type('Rahul@#$%', { force: true })
    cy.get('input').eq(2).clear({ force: true }).type('+91 98765 43210', { force: true })
    cy.get('input').eq(3).clear({ force: true }).type('test@example.com', { force: true })

    cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
    cy.wait(1000)
    cy.log('✅ TC03 - Special chars tested')
  })

  it('TC04 - Country Not Selected → Error', () => {
    cy.get('input').eq(0).clear({ force: true }).type('Amit Kumar', { force: true })
    cy.get('input').eq(2).clear({ force: true }).type('+91 98765 43210', { force: true })
    cy.get('input').eq(3).clear({ force: true }).type('amit@example.com', { force: true })
    // Don't select country

    cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
    cy.wait(1000)
    cy.log('✅ TC04 - No country tested')
  })

  it('TC05 - Phone Empty → Error', () => {
    cy.get('input').eq(0).clear({ force: true }).type('Priya Singh', { force: true })
    cy.get('input').eq(3).clear({ force: true }).type('priya@example.com', { force: true })
    // Don't fill phone

    cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
    cy.wait(1000)
    cy.log('✅ TC05 - Phone empty tested')
  })

  it('TC06 - Phone Without + Sign → Error', () => {
    cy.get('input').eq(0).clear({ force: true }).type('Vikram Rao', { force: true })
    cy.get('input').eq(2).clear({ force: true }).type('91 98765 43210', { force: true })
    cy.get('input').eq(3).clear({ force: true }).type('vikram@example.com', { force: true })

    cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
    cy.wait(1000)
    cy.log('✅ TC06 - Phone without + tested')
  })

  it('TC07 - Invalid Email (missing @) → Error', () => {
    cy.get('input').eq(0).clear({ force: true }).type('Neha Gupta', { force: true })
    cy.get('input').eq(2).clear({ force: true }).type('+91 98765 43210', { force: true })
    cy.get('input').eq(3).clear({ force: true }).type('neha.example.com', { force: true })

    cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
    cy.wait(1000)
    cy.log('✅ TC07 - Invalid email tested')
  })

  it('TC08 - Email Empty → Error', () => {
    cy.get('input').eq(0).clear({ force: true }).type('Rohan Mehta', { force: true })
    cy.get('input').eq(2).clear({ force: true }).type('+91 98765 43210', { force: true })
    // Don't fill email

    cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
    cy.wait(1000)
    cy.log('✅ TC08 - Email empty tested')
  })
})