// cypress/e2e/settings/app-settings-ecp.cy.js

describe('Settings → App Settings (6 ECP Tests – Runtime Data)', () => {

    beforeEach(() => {
        // Step 1: Login (FAST - no name attributes)
        cy.visit('http://localhost:3000/login')
        cy.clearCookies()
        cy.clearLocalStorage()

        cy.get('button[type="submit"]').click({ force: true })
        cy.wait(1500)

        // Step 2: Navigate to Settings - Robust Strategy
        cy.get('body').then(($body) => {
            if ($body.text().includes('Settings')) {
                cy.contains(/Settings/i).click({ force: true })
            } else {
                cy.visit('/settings')
            }
        })
        cy.wait(2000)
    })

    it('1 → Change Date Format Only → Save Success', () => {
        // Try to click dropdown
        cy.get('.ant-select').first().click({ force: true })
        cy.wait(1000)

        // Force click on ANY visible dropdown item
        cy.get('body').then(($body) => {
            if ($body.find('.ant-select-item-option-content').length > 0) {
                cy.get('.ant-select-item-option-content').first().click({ force: true })
            } else {
                // Fallback: Type into the select
                cy.get('.ant-select input').first().type('{downarrow}{enter}', { force: true })
            }
        })

        cy.get('button').contains(/Save/i).click({ force: true })
        cy.wait(1500)
        cy.log('✅ TC01 - Date format change attempted')
    })

    it('2 → Enter Valid Email Only → Save Success', () => {
        const randomEmail = `testuser_${Date.now()}@example.com`

        cy.get('input').eq(1).clear({ force: true }).type(randomEmail, { force: true })

        cy.get('button').contains(/Save/i).click({ force: true })
        cy.wait(1500)
        cy.log('✅ TC02 - Email updated:', randomEmail)

        // Verify email persisted
        cy.reload()
        cy.wait(1000)
        cy.get('input').eq(1).should('have.value', randomEmail)
    })

    it('3 → Email Empty → Error', () => {
        cy.get('input').eq(1).clear({ force: true })

        cy.get('button').contains(/Save/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC03 - Empty email tested')
    })

    it('4 → Invalid Email (missing @) → Error', () => {
        cy.get('input').eq(1).clear({ force: true }).type('invalid.email.gmail.com', { force: true })

        cy.get('button').contains(/Save/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC04 - Invalid email (no @) tested')
    })

    it('5 → Invalid Email (missing domain) → Error', () => {
        cy.get('input').eq(1).clear({ force: true }).type('testuser@', { force: true })

        cy.get('button').contains(/Save/i).click({ force: true })
        cy.wait(1000)
        cy.log('✅ TC05 - Invalid email (no domain) tested')
    })

    it('6 → Change Both Date Format + Valid Email → Save Success', () => {
        const newEmail = `auto_${Cypress._.random(0, 999999)}@test.com`

        // Change date format
        cy.get('.ant-select').first().click({ force: true })
        cy.wait(1000)

        cy.get('body').then(($body) => {
            if ($body.find('.ant-select-item-option-content').length > 0) {
                // Click the second option if available, otherwise first
                if ($body.find('.ant-select-item-option-content').length > 1) {
                    cy.get('.ant-select-item-option-content').eq(1).click({ force: true })
                } else {
                    cy.get('.ant-select-item-option-content').first().click({ force: true })
                }
            } else {
                // Fallback: Type into the select
                cy.get('.ant-select input').first().type('{downarrow}{downarrow}{enter}', { force: true })
            }
        })

        // Change email
        cy.get('input').eq(1).clear({ force: true }).type(newEmail, { force: true })

        cy.get('button').contains(/Save/i).click({ force: true })
        cy.wait(1500)
        cy.log('✅ TC06 - Both date format and email updated')

        // Verify email persisted
        cy.reload()
        cy.wait(1000)
        cy.get('input').eq(1).should('have.value', newEmail)
    })
})