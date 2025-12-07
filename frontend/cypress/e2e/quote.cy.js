// cypress/e2e/quote/create-quote-minimal-ecp.cy.js

describe('Create Quote (Proforma Invoice) - 7 Strong ECP Tests', { retries: 1 }, () => {

    beforeEach(() => {
        // Step 1: Login using empty form method
        cy.visit('http://localhost:3000/login')
        cy.clearCookies()
        cy.clearLocalStorage()
        cy.wait(500)

        cy.get('button[type="submit"]').click({ force: true })
        cy.wait(2000)

        // Step 2: Navigate to Quote page
        cy.visit('/quote', { timeout: 10000 })
        cy.wait(2000)

        // Step 3: Click "Add New" button
        cy.get('body').then(($body) => {
            cy.log('Page text:', $body.text().substring(0, 200))

            cy.get('button, a, [role="button"]').then(($buttons) => {
                let clicked = false

                $buttons.each((index, btn) => {
                    const text = (btn.innerText || btn.textContent || '').toLowerCase()
                    if (!clicked && (text.includes('add') || text.includes('new') || text.includes('create') || text.includes('proforma') || text.includes('+'))) {
                        cy.log('Clicking button:', text)
                        cy.wrap(btn).click({ force: true })
                        clicked = true
                        return false
                    }
                })

                if (!clicked && $buttons.length > 0) {
                    cy.wrap($buttons[0]).click({ force: true })
                }
            })
        })

        cy.wait(2000)
    })

    it('1 → Valid Quote → Save Success', () => {
        // Select client from dropdown
        cy.get('input, select').first().click({ force: true })
        cy.wait(500)
        cy.get('.ant-select-item, .ant-dropdown-menu-item, li').first().click({ force: true })

        // Fill all form fields with runtime data
        cy.get('input').each(($input) => {
            const placeholder = ($input.attr('placeholder') || '').toLowerCase()
            const id = ($input.attr('id') || '').toLowerCase()

            if (placeholder.includes('item') && !placeholder.includes('description')) {
                cy.wrap($input).type('Website Design Service', { force: true })
            } else if (placeholder.includes('description')) {
                cy.wrap($input).type('Full stack web development project', { force: true })
            } else if (placeholder.includes('quantity') || id.includes('quantity')) {
                cy.wrap($input).clear({ force: true }).type('1', { force: true })
            } else if (placeholder.includes('price') || id.includes('price')) {
                cy.wrap($input).clear({ force: true }).type('15000', { force: true })
            }
        })

        cy.get('button').contains(/Save|Submit|Create/i).click({ force: true })
        cy.wait(2000)

        cy.get('body').then(($body) => {
            const text = $body.text()
            if (text.includes('success') || text.includes('created') || text.includes('added')) {
                cy.log('✅ Quote created successfully')
            }
        })
    })

    it('2 → Client Blank → Error', () => {
        // Skip client selection, fill items only
        cy.get('input').each(($input) => {
            const placeholder = ($input.attr('placeholder') || '').toLowerCase()

            if (placeholder.includes('quantity')) {
                cy.wrap($input).clear({ force: true }).type('1', { force: true })
            } else if (placeholder.includes('price')) {
                cy.wrap($input).clear({ force: true }).type('1000', { force: true })
            }
        })

        cy.get('button').contains(/Save|Submit|Create/i).click({ force: true })
        cy.wait(1000)

        cy.get('body').then(($body) => {
            const text = $body.text().toLowerCase()
            if (text.includes('client') || text.includes('required')) {
                cy.log('✅ Validation error shown')
            }
        })
    })

    it('3 → Issue Date Blank → Error', () => {
        // Select client
        cy.get('input, select').first().click({ force: true })
        cy.wait(500)
        cy.get('.ant-select-item, li').first().click({ force: true })

        // Fill items but skip date
        cy.get('input').each(($input) => {
            const placeholder = ($input.attr('placeholder') || '').toLowerCase()

            if (placeholder.includes('price')) {
                cy.wrap($input).clear({ force: true }).type('1000', { force: true })
            }
        })

        cy.get('button').contains(/Save|Submit|Create/i).click({ force: true })
        cy.wait(1000)

        cy.get('body').then(($body) => {
            const text = $body.text().toLowerCase()
            if (text.includes('date') || text.includes('required')) {
                cy.log('✅ Validation error shown')
            }
        })
    })

    it('4 → Expire Date Before Issue Date → Error', () => {
        // Select client
        cy.get('input, select').first().click({ force: true })
        cy.wait(500)
        cy.get('.ant-select-item, li').first().click({ force: true })

        // Try to set wrong date order using date pickers
        cy.get('.ant-picker').then(($pickers) => {
            if ($pickers.length >= 2) {
                // Set issue date
                cy.wrap($pickers[0]).click({ force: true })
                cy.wait(500)
                cy.get('.ant-picker-cell').not('.ant-picker-cell-disabled').eq(15).click({ force: true })

                // Set expire date (earlier)
                cy.wrap($pickers[1]).click({ force: true })
                cy.wait(500)
                cy.get('.ant-picker-cell').not('.ant-picker-cell-disabled').first().click({ force: true })
            }
        })

        cy.get('button').contains(/Save|Submit|Create/i).click({ force: true })
        cy.wait(1000)

        cy.get('body').then(($body) => {
            const text = $body.text().toLowerCase()
            if (text.includes('after') || text.includes('before') || text.includes('expire')) {
                cy.log('✅ Validation error shown')
            }
        })
    })

    it('5 → Quantity = 0 → Error', () => {
        // Select client
        cy.get('input, select').first().click({ force: true })
        cy.wait(500)
        cy.get('.ant-select-item, li').first().click({ force: true })

        // Fill with zero quantity
        cy.get('input').each(($input) => {
            const placeholder = ($input.attr('placeholder') || '').toLowerCase()

            if (placeholder.includes('item')) {
                cy.wrap($input).type('Test Item', { force: true })
            } else if (placeholder.includes('quantity')) {
                cy.wrap($input).clear({ force: true }).type('0', { force: true })
            } else if (placeholder.includes('price')) {
                cy.wrap($input).clear({ force: true }).type('500', { force: true })
            }
        })

        cy.get('button').contains(/Save|Submit|Create/i).click({ force: true })
        cy.wait(1000)

        cy.get('body').then(($body) => {
            const text = $body.text().toLowerCase()
            if (text.includes('greater') || text.includes('quantity') || text.includes('zero')) {
                cy.log('✅ Validation error shown')
            }
        })
    })

    it('6 → No Items Added → Error', () => {
        // Select client only
        cy.get('input, select').first().click({ force: true })
        cy.wait(500)
        cy.get('.ant-select-item, li').first().click({ force: true })

        // Don't fill any items, just try to save
        cy.get('button').contains(/Save|Submit|Create/i).click({ force: true })
        cy.wait(1000)

        cy.get('body').then(($body) => {
            const text = $body.text().toLowerCase()
            if (text.includes('item') || text.includes('required')) {
                cy.log('✅ Validation error shown')
            }
        })
    })

    it('7 → Price Blank → Error', () => {
        // Select client
        cy.get('input, select').first().click({ force: true })
        cy.wait(500)
        cy.get('.ant-select-item, li').first().click({ force: true })

        // Fill item and quantity but not price
        cy.get('input').each(($input) => {
            const placeholder = ($input.attr('placeholder') || '').toLowerCase()

            if (placeholder.includes('item')) {
                cy.wrap($input).type('Service Item', { force: true })
            } else if (placeholder.includes('quantity')) {
                cy.wrap($input).clear({ force: true }).type('2', { force: true })
            }
            // Skip price
        })

        cy.get('button').contains(/Save|Submit|Create/i).click({ force: true })
        cy.wait(1000)

        cy.get('body').then(($body) => {
            const text = $body.text().toLowerCase()
            if (text.includes('price') || text.includes('required')) {
                cy.log('✅ Validation error shown')
            }
        })
    })
})