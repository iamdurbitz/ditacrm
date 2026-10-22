import pool from "../database/db.js"

const MAX_BIGINT = 9223372036854775807n

function getBusinessId(req) {
    return req.user.businessId
}

function isValidId(id) {
    if (typeof id !== "string" || !/^[1-9]\d*$/.test(id)) {
        return false
    }

    try {
        return BigInt(id) <= MAX_BIGINT
    } catch {
        return false
    }
}

function parseAmount(value, fieldName, defaultValue = 0) {
    if (value === undefined || value === null || value === "") {
        return { value: defaultValue }
    }

    if (
        typeof value !== "number" &&
        typeof value !== "string"
    ) {
        return { error: `${fieldName} must be a valid amount.` }
    }

    const normalizedValue = String(value).trim()

    // Allow up to 10 integer digits and 2 decimal places.
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(normalizedValue)) {
        return {
            error: `${fieldName} must be a non-negative amount with up to 2 decimal places.`
        }
    }

    return { value: normalizedValue }
}

function validateCustomerAmounts(totalAmount, amountPaid) {
    const parsedTotal = parseAmount(
        totalAmount,
        "Total amount"
    )

    if (parsedTotal.error) {
        return { error: parsedTotal.error }
    }

    const parsedPaid = parseAmount(
        amountPaid,
        "Amount paid"
    )

    if (parsedPaid.error) {
        return { error: parsedPaid.error }
    }

    if (
        Number(parsedPaid.value) >
        Number(parsedTotal.value)
    ) {
        return {
            error: "Amount paid cannot exceed total amount."
        }
    }

    return {
        totalAmount: parsedTotal.value,
        amountPaid: parsedPaid.value
    }
}

// GET /api/customers
export async function getCustomers(req, res, next) {
    try {
        const businessId = getBusinessId(req)

        const result = await pool.query(
            `SELECT
                id,
                name,
                phone,
                address,
                total_amount,
                amount_paid,
                (total_amount - amount_paid) AS remaining_balance,
                notes,
                created_at,
                updated_at
             FROM customers
             WHERE business_id = $1
             ORDER BY created_at DESC`,
            [businessId]
        )

        res.json({
            customers: result.rows
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/customers/:id
export async function getCustomerById(req, res, next) {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({
                error: "Invalid customer ID."
            })
        }

        const businessId = getBusinessId(req)

        const result = await pool.query(
            `SELECT
                id,
                name,
                phone,
                address,
                total_amount,
                amount_paid,
                (total_amount - amount_paid) AS remaining_balance,
                notes,
                created_at,
                updated_at
             FROM customers
             WHERE id = $1 AND business_id = $2`,
            [id, businessId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Customer not found."
            })
        }

        res.json({
            customer: result.rows[0]
        })
    } catch (error) {
        next(error)
    }
}

// POST /api/customers
export async function createCustomer(req, res, next) {
    try {
        const businessId = getBusinessId(req)

        const {
            name,
            phone,
            address,
            total_amount,
            amount_paid,
            notes
        } = req.body

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                error: "Customer name is required."
            })
        }

        if (name.trim().length > 150) {
            return res.status(400).json({
                error: "Customer name must not exceed 150 characters."
            })
        }

        if (
            phone != null &&
            phone !== "" &&
            (
                typeof phone !== "string" ||
                phone.trim().length > 30
            )
        ) {
            return res.status(400).json({
                error: "Invalid phone number."
            })
        }

        if (
            address != null &&
            (
                typeof address !== "string" ||
                address.length > 2000
            )
        ) {
            return res.status(400).json({
                error: "Invalid address."
            })
        }

        if (
            notes != null &&
            (
                typeof notes !== "string" ||
                notes.length > 10000
            )
        ) {
            return res.status(400).json({
                error: "Invalid notes."
            })
        }

        const amounts = validateCustomerAmounts(
            total_amount,
            amount_paid
        )

        if (amounts.error) {
            return res.status(400).json({
                error: amounts.error
            })
        }

        const result = await pool.query(
            `INSERT INTO customers (
                business_id,
                name,
                phone,
                address,
                total_amount,
                amount_paid,
                notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                id,
                name,
                phone,
                address,
                total_amount,
                amount_paid,
                (total_amount - amount_paid) AS remaining_balance,
                notes,
                created_at,
                updated_at`,
            [
                businessId,
                name.trim(),
                phone?.trim() || null,
                address?.trim() || null,
                amounts.totalAmount,
                amounts.amountPaid,
                notes?.trim() || null
            ]
        )

        res.status(201).json({
            message: "Customer created successfully.",
            customer: result.rows[0]
        })
    } catch (error) {
        next(error)
    }
}

// PUT /api/customers/:id
export async function updateCustomer(req, res, next) {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({
                error: "Invalid customer ID."
            })
        }

        const businessId = getBusinessId(req)

        const {
            name,
            phone,
            address,
            total_amount,
            amount_paid,
            notes
        } = req.body

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                error: "Customer name is required."
            })
        }

        if (name.trim().length > 150) {
            return res.status(400).json({
                error: "Customer name must not exceed 150 characters."
            })
        }

        if (
            phone != null &&
            phone !== "" &&
            (
                typeof phone !== "string" ||
                phone.trim().length > 30
            )
        ) {
            return res.status(400).json({
                error: "Invalid phone number."
            })
        }

        if (
            address != null &&
            (
                typeof address !== "string" ||
                address.length > 2000
            )
        ) {
            return res.status(400).json({
                error: "Invalid address."
            })
        }

        if (
            notes != null &&
            (
                typeof notes !== "string" ||
                notes.length > 10000
            )
        ) {
            return res.status(400).json({
                error: "Invalid notes."
            })
        }

        const amounts = validateCustomerAmounts(
            total_amount,
            amount_paid
        )

        if (amounts.error) {
            return res.status(400).json({
                error: amounts.error
            })
        }

        const result = await pool.query(
            `UPDATE customers
             SET
                name = $1,
                phone = $2,
                address = $3,
                total_amount = $4,
                amount_paid = $5,
                notes = $6,
                updated_at = NOW()
             WHERE id = $7 AND business_id = $8
             RETURNING
                id,
                name,
                phone,
                address,
                total_amount,
                amount_paid,
                (total_amount - amount_paid) AS remaining_balance,
                notes,
                created_at,
                updated_at`,
            [
                name.trim(),
                phone?.trim() || null,
                address?.trim() || null,
                amounts.totalAmount,
                amounts.amountPaid,
                notes?.trim() || null,
                id,
                businessId
            ]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Customer not found."
            })
        }

        res.json({
            message: "Customer updated successfully.",
            customer: result.rows[0]
        })
    } catch (error) {
        next(error)
    }
}

// DELETE /api/customers/:id
export async function deleteCustomer(req, res, next) {
    try {
        const { id } = req.params

        if (!isValidId(id)) {
            return res.status(400).json({
                error: "Invalid customer ID."
            })
        }

        const businessId = getBusinessId(req)

        const result = await pool.query(
            `DELETE FROM customers
             WHERE id = $1 AND business_id = $2
             RETURNING id`,
            [id, businessId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Customer not found."
            })
        }

        res.json({
            message: "Customer deleted successfully."
        })
    } catch (error) {
        next(error)
    }
}