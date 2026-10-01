import pool from "../db.js"
import bcrypt from "bcrypt"

export const createEmployee = async (req, res, next) => {

    const { name, email, password } = req.body

    if (!name || !email || !password) {

    return res.status(400).json({
        error: "Name, email and password are required"
        })
    }

    try {
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        )

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: "Email already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const businessId = req.user.businessId

        const employeeResult = await pool.query(
            `INSERT INTO users
            (business_id, name, email, password, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, business_id, name, email, role, created_at`,
            [businessId, name, email, hashedPassword, "EMPLOYEE"]
        )

        return res.status(201).json({
            message: "Employee created successfully",
            employee: employeeResult.rows[0]
        })

    } catch (error) {
        next(error)
    }
}