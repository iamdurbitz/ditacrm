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

// GET /api/customers
export async function getCustomers(req, res, next) {
    try {
        const businessId = getBusinessId(req)

        const result = await pool.query(
            `SELECT
                id,
                name,
                email,
                phone,
                company,
                address,
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
                email,
                phone,
                company,
                address,
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
            email,
            phone,
            company,
            address,
            notes
        } = req.body

        // Name validation
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

        // Email validation
        if (
            email != null &&
            (
                typeof email !== "string" ||
                email.trim().length === 0 ||
                email.trim().length > 255
            )
        ) {
            return res.status(400).json({
                error: "Invalid email."
            })
        }

        // Phone and company validation
        const optionalFields = {
            phone: { value: phone, max: 30 },
            company: { value: company, max: 150 }
        }

        for (const [field, config] of Object.entries(optionalFields)) {
            if (
                config.value != null &&
                (
                    typeof config.value !== "string" ||
                    config.value.trim().length === 0 ||
                    config.value.trim().length > config.max
                )
            ) {
                return res.status(400).json({
                    error: `Invalid ${field}.`
                })
            }
        }

        // Address validation
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

        // Notes validation
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

        const result = await pool.query(
            `INSERT INTO customers (
                business_id,
                name,
                email,
                phone,
                company,
                address,
                notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                id,
                name,
                email,
                phone,
                company,
                address,
                notes,
                created_at,
                updated_at`,
            [
                businessId,
                name.trim(),
                email?.trim() || null,
                phone?.trim() || null,
                company?.trim() || null,
                address?.trim() || null,
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
            email,
            phone,
            company,
            address,
            notes
        } = req.body

        // Name validation
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

        // Email validation
        if (
            email != null &&
            (
                typeof email !== "string" ||
                email.trim().length === 0 ||
                email.trim().length > 255
            )
        ) {
            return res.status(400).json({
                error: "Invalid email."
            })
        }

        // Phone and company validation
        const optionalFields = {
            phone: { value: phone, max: 30 },
            company: { value: company, max: 150 }
        }

        for (const [field, config] of Object.entries(optionalFields)) {
            if (
                config.value != null &&
                (
                    typeof config.value !== "string" ||
                    config.value.trim().length === 0 ||
                    config.value.trim().length > config.max
                )
            ) {
                return res.status(400).json({
                    error: `Invalid ${field}.`
                })
            }
        }

        // Address validation
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

        // Notes validation
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

        const result = await pool.query(
            `UPDATE customers
             SET
                name = $1,
                email = $2,
                phone = $3,
                company = $4,
                address = $5,
                notes = $6,
                updated_at = NOW()
             WHERE id = $7 AND business_id = $8
             RETURNING
                id,
                name,
                email,
                phone,
                company,
                address,
                notes,
                created_at,
                updated_at`,
            [
                name.trim(),
                email?.trim() || null,
                phone?.trim() || null,
                company?.trim() || null,
                address?.trim() || null,
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