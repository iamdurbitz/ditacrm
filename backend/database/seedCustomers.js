import pool from "./db.js"

const SEED_MARKER = "[DITACRM_SEED_V1]"

const firstNames = [
    "James", "William", "Oliver", "Henry",
    "Benjamin", "Lucas", "Alexander", "Daniel",
    "Matthew", "David"
]

const lastNames = [
    "Smith", "Johnson", "Brown", "Taylor"
]

const businessRoots = [
    "Apex", "Prime", "Summit", "Evergreen",
    "Blue Oak", "Silverline", "Northstar",
    "Pioneer", "Crestview", "Redwood",
    "Horizon", "Oakwood", "Atlas", "Brightway",
    "Westfield"
]

const businessSuffixes = [
    "Solutions", "Group", "Services", "Enterprises"
]

const streetNames = [
    "Oak Street", "Maple Avenue", "Cedar Road",
    "Pine Street", "Lake Avenue", "Hill Road",
    "Washington Street", "Park Avenue",
    "River Road", "Sunset Boulevard"
]

const cities = [
    "Austin, TX",
    "Denver, CO",
    "Seattle, WA",
    "Portland, OR",
    "Phoenix, AZ",
    "Dallas, TX",
    "Atlanta, GA",
    "Nashville, TN",
    "Columbus, OH",
    "Charlotte, NC"
]

const individualNotes = [
    "Interested in a kitchen renovation.",
    "Requested a quotation for home improvements.",
    "Regular customer since last year.",
    "Interested in plumbing maintenance.",
    "Follow up regarding the pending quotation.",
    "Prefers phone communication.",
    "Potential long-term customer.",
    "Requested information about available services."
]

const businessNotes = [
    "Requested a bulk pricing quotation.",
    "Potential recurring business customer.",
    "Interested in a long-term supply agreement.",
    "Contact regarding the next project.",
    "Requires regular product deliveries.",
    "Requested updated product pricing.",
    "Follow up with the purchasing department.",
    "Interested in opening a business account."
]

const categories = [
    {
        name: "General Business",
        count: 25
    },
    {
        name: "Construction",
        count: 15
    },
    {
        name: "Plumbing",
        count: 10
    },
    {
        name: "Other",
        count: 10
    }
]

function createIndividualCustomers() {
    const customers = []

    for (let i = 0; i < 40; i++) {
        const firstName = firstNames[i % firstNames.length]
        const lastName = lastNames[Math.floor(i / firstNames.length)]

        customers.push({
            name: `${firstName} ${lastName}`,
            category: "Individual",
            phone: `+1-202-555-${String(100 + i).padStart(4, "0")}`,
            address: `${100 + i} ${streetNames[i % streetNames.length]}, ${cities[i % cities.length]}`,
            notes: individualNotes[i % individualNotes.length]
        })
    }

    return customers
}

function createBusinessCustomers() {
    const customers = []

    let index = 0

    for (const category of categories) {
        for (let i = 0; i < category.count; i++) {
            const root = businessRoots[index % businessRoots.length]
            const suffix = businessSuffixes[Math.floor(index / businessRoots.length)]

            customers.push({
                name: `${root} ${suffix}`,
                category: category.name,
                phone: `+1-202-555-${String(140 + index).padStart(4, "0")}`,
                address: `${200 + index} ${streetNames[index % streetNames.length]}, ${cities[index % cities.length]}`,
                notes: businessNotes[index % businessNotes.length]
            })

            index++
        }
    }

    return customers
}

function generateFinancialData(index) {
    const totalAmounts = [
        250,
        450,
        750,
        1200,
        1850,
        2400,
        3200,
        4750,
        6200,
        8500
    ]

    const totalAmount = totalAmounts[index % totalAmounts.length]

    let amountPaid

    // 25 fully paid customers
    if (index < 25) {
        amountPaid = totalAmount
    }

    // 35 partially paid customers
    else if (index < 60) {
        amountPaid = Math.round(totalAmount * 0.4 * 100) / 100
    }

    // 25 unpaid customers
    else if (index < 85) {
        amountPaid = 0
    }

    // 15 customers with different payment amounts
    else {
        amountPaid = totalAmount
    }

    return {
        totalAmount,
        amountPaid
    }
}

function generateCreatedAt(index) {
    const daysAgo = (index * 7) % 180

    const date = new Date()
    date.setDate(date.getDate() - daysAgo)

    return date
}

async function seedCustomers() {
    const businessId = process.argv[2]

    if (!businessId || !/^\d+$/.test(businessId)) {
        throw new Error(
            "Please provide a valid business ID.\n" +
            "Example: node database/seedCustomers.js 1"
        )
    }

    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const businessResult = await client.query(
            `SELECT id, name FROM businesses WHERE id = $1`,
            [businessId]
        )

        if (businessResult.rowCount === 0) {
            throw new Error(`Business with ID ${businessId} does not exist.`)
        }

        const business = businessResult.rows[0]

        console.log(`Seeding customers for: ${business.name}`)

        // Remove only records created by this seed script.
        await client.query(
            `DELETE FROM customers
             WHERE business_id = $1
             AND notes LIKE $2`,
            [businessId, `${SEED_MARKER}%`]
        )

        const customers = [
            ...createIndividualCustomers(),
            ...createBusinessCustomers()
        ]

        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i]
            const financial = generateFinancialData(i)
            const createdAt = generateCreatedAt(i)

            const notes = [
                SEED_MARKER,
                `Category: ${customer.category}`,
                customer.notes
            ].join(" | ")

            await client.query(
                `INSERT INTO customers (
                    business_id,
                    name,
                    phone,
                    address,
                    total_amount,
                    amount_paid,
                    notes,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
                [
                    businessId,
                    customer.name,
                    customer.phone,
                    customer.address,
                    financial.totalAmount,
                    financial.amountPaid,
                    notes,
                    createdAt
                ]
            )
        }

        await client.query("COMMIT")

        console.log("--------------------------------")
        console.log("Customer seeding completed!")
        console.log(`Business: ${business.name}`)
        console.log(`Total customers: ${customers.length}`)
        console.log("--------------------------------")

    } catch (error) {
        await client.query("ROLLBACK")
        console.error("Seeding failed:", error.message)
        process.exitCode = 1

    } finally {
        client.release()
        await pool.end()
    }
}

seedCustomers()