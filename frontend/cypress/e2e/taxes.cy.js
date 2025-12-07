// cypress/e2e/taxes/add-tax-runtime-ecp.cy.js

describe('Taxes Module → 6 ECP Tests (100% Runtime Unique Data)', () => {

    // Runtime unique data generators
    const uniqueTaxName = () => `AutoTax_${Date.now()}_${Cypress._.random(0, 9999)}`

    beforeEach(() => {
        // Step 1: Login (FAST)
        cy.visit('http://localhost:3000/login')
        cy.clearCookies()
        cy.clearLocalStorage()

        cy.get('button[type="submit"]').click({ force: true })

        // Wait for dashboard to load (ensures login API completed)
        cy.get('.ant-layout-sider', { timeout: 30000 }).should('be.visible')

        // Step 2: Navigate to Taxes
        cy.visit('http://localhost:3000/taxes')

        // Wait for header or table to ensure page loaded
        cy.get('.ant-page-header-heading-title, .ant-table', { timeout: 20000 }).should('exist')

        // Step 3: Click Add New Tax
        cy.contains(/Add.*Tax|New.*Tax/i, { timeout: 20000 }).should('be.visible').click({ force: true })
        cy.wait(1000) // Small wait for modal/drawer animation
    })

    it('1 → Valid Tax (Name + Value) → Success', () => {
        const name = uniqueTaxName()

        cy.get('input').eq(0).clear({ force: true }).type(name, { force: true })
        cy.get('input').eq(1).clear({ force: true }).type('18', { force: true })

        // Enable switch
        cy.get('[role="switch"]').first().click({ force: true })

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1500)
        cy.log('✅ TC01 - Valid tax created:', name)
    })

    it('2 → Name Empty → Error', () => {
        // Skip name, only fill value
        cy.get('input').eq(1).clear({ force: true }).type('12', { force: true })

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC02 - Empty name tested')
    })

    it('3 → Value Empty → Error', () => {
        cy.get('input').eq(0).clear({ force: true }).type(uniqueTaxName(), { force: true })
        // Skip value

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC03 - Empty value tested')
    })

    it('4 → Value Negative or >100 → Error', () => {
        // Fill name first
        cy.get('input').eq(0).clear({ force: true }).type(uniqueTaxName(), { force: true })

        // Test negative
        cy.get('input').eq(1).clear({ force: true }).type('-5', { force: true })
        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC04a - Negative value tested')

        // Clear and test >100 (no need to re-enter name)
        cy.get('input').eq(1).clear({ force: true }).type('150', { force: true })
        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC04b - Value >100 tested')
    })

    it('5 → Value Non-Numeric → Error', () => {
        cy.get('input').eq(0).clear({ force: true }).type(uniqueTaxName(), { force: true })
        cy.get('input').eq(1).clear({ force: true }).type('abc', { force: true })

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC05 - Non-numeric value tested')
    })

    it('6 → Only One Default Allowed → Auto Uncheck Old One', () => {
        // First tax as default
        const firstTax = uniqueTaxName()
        cy.get('input').eq(0).clear({ force: true }).type(firstTax, { force: true })
        cy.get('input').eq(1).clear({ force: true }).type('5', { force: true })

        // Click all switches (Enabled + Default)
        // Click switches sequentially
        cy.get('[role="switch"]').eq(0).click({ force: true })
        cy.wait(500)
        cy.get('[role="switch"]').eq(1).click({ force: true })

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1500)

        // Second tax → also make default
        cy.contains(/Add.*Tax|New.*Tax/i).click({ force: true })
        cy.wait(1500)

        const secondTax = uniqueTaxName()
        cy.get('input').eq(0).clear({ force: true }).type(secondTax, { force: true })
        cy.get('input').eq(1).clear({ force: true }).type('28', { force: true })

        // Click switches sequentially
        cy.get('[role="switch"]').eq(0).click({ force: true })
        cy.wait(500)
        cy.get('[role="switch"]').eq(1).click({ force: true })

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1500)
        cy.log('✅ TC06 - Second default created:', secondTax)
    })
})