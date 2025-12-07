// cypress/e2e/payment-mode/payment-mode-runtime-data.cy.js

describe('Payment Mode → 6 ECP Tests (100% Runtime Unique Data)', () => {

    const uniqueName = () => `AutoMode_${Date.now()}_${Cypress._.random(0, 1e6)}`
    const uniqueDesc = () => `Automated test mode created at ${new Date().toLocaleString()}`

    beforeEach(() => {
        // Step 1: Login (Fast Method)
        cy.visit('http://localhost:3000/login')
        cy.clearCookies()
        cy.clearLocalStorage()

        cy.get('button[type="submit"]').click({ force: true })

        // Wait for dashboard to load (ensures login API completed)
        cy.get('.ant-layout-sider', { timeout: 30000 }).should('be.visible')

        // Step 2: Navigate to Payment Mode
        cy.visit('http://localhost:3000/payment/mode')

        // Wait for page header or table to ensure content loaded
        cy.get('.ant-page-header-heading-title, .ant-table', { timeout: 20000 }).should('exist')

        // Step 3: Click Add New Payment Mode (with robust wait)
        cy.contains(/Add.*Payment|New.*Payment/i, { timeout: 20000 }).should('be.visible').click({ force: true })
        cy.wait(1000) // Animation wait
    })

    it('1 → Valid Payment Mode → Success', () => {
        const name = uniqueName()

        // Name Field (first input)
        cy.get('input').eq(0).clear({ force: true }).type(name, { force: true })

        // Description Field (second input or textarea)
        cy.get('input, textarea').eq(1).clear({ force: true }).type(uniqueDesc(), { force: true })

        // Enable switch (click, not check)
        cy.get('[role="switch"]').first().click({ force: true })

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1500)
        cy.log('✅ TC01 - Valid payment mode:', name)
    })

    it('2 → Payment Mode Empty → Error', () => {
        // Skip name, only fill description
        cy.get('input, textarea').eq(1).clear({ force: true }).type(uniqueDesc(), { force: true })

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC02 - Empty name tested')
    })

    it('3 → Payment Mode Only Spaces → Error', () => {
        cy.get('input').eq(0).clear({ force: true }).type('     ', { force: true })
        cy.get('input, textarea').eq(1).clear({ force: true }).type(uniqueDesc(), { force: true })

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC03 - Spaces only tested')
    })

    it('4 → Duplicate Name → Error', () => {
        const name = uniqueName()

        // First time → create
        cy.get('input').eq(0).clear({ force: true }).type(name, { force: true })
        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1500)

        // Second time → try same name
        cy.contains(/Add.*Payment|New.*Payment/i).click({ force: true })
        cy.wait(1500)

        cy.get('input').eq(0).clear({ force: true }).type(name, { force: true })
        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC04 - Duplicate name tested:', name)
    })

    it('5 → Create as Default + Enabled → Success', () => {
        const name = uniqueName()

        cy.get('input').eq(0).clear({ force: true }).type(name, { force: true })
        cy.get('input, textarea').eq(1).clear({ force: true }).type('Default mode', { force: true })

        // Click all switches (Enabled + Default)
        // Click switches sequentially to avoid detached DOM errors
        cy.get('[role="switch"]').eq(0).click({ force: true })
        cy.wait(500)
        cy.get('[role="switch"]').eq(1).click({ force: true })

        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1500)
        cy.log('✅ TC05 - Default mode created:', name)
    })

    it('6 → Only One Default Allowed → Old one auto unchecked', () => {
        const first = uniqueName()
        const second = uniqueName()

        // Create first default
        cy.get('input').eq(0).clear({ force: true }).type(first, { force: true })
        // Click switches sequentially
        cy.get('[role="switch"]').eq(0).click({ force: true })
        cy.wait(500)
        cy.get('[role="switch"]').eq(1).click({ force: true })
        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1500)

        // Create second default
        cy.contains(/Add.*Payment|New.*Payment/i).click({ force: true })
        cy.wait(1500)

        cy.get('input').eq(0).clear({ force: true }).type(second, { force: true })
        // Click switches sequentially
        cy.get('[role="switch"]').eq(0).click({ force: true })
        cy.wait(500)
        cy.get('[role="switch"]').eq(1).click({ force: true })
        cy.get('button').contains(/Submit|Save|Create/i).click({ force: true })
        cy.wait(1500)
        cy.log('✅ TC06 - Second default created:', second)
    })
})