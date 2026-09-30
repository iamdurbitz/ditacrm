import pool from "../db.js"
import bcrypt from "bcrypt"

export const register = async (req, res, next) => {
    const {businessName, name, email, password} = req.body

    if (!businessName || !name || !email || !password){
        return res.status(400).json({
            error: "Business name, name, email and password are required"
        })
    }

    try {
        const result = await pool.query(
            "SELECT id FROM users WHERE email = $1", [email]
        )

        if (result.rows.length > 0) {
            return res.status(409).json({
                error: "Email already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 12)

        const client = await pool.connect()

        try {
            await client.query("BEGIN")

            const businessResult = await client.query(
            "INSERT INTO businesses (name) VALUES ($1) RETURNING id", 
            [businessName]
            )

            const businessId = businessResult.rows[0].id

            const userResult = await client.query(
                `INSERT INTO users
                (business_id, name, email, password, role)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, business_id, name, email, role, created_at`,
                [businessId, name, email, hashedPassword, "OWNER"]
                )

            await client.query("COMMIT")

            res.status(201).json({
                message: "Registration successful",
                user: userResult.rows[0]
            })
        } catch (error){
            await client.query("ROLLBACK")
            throw error
        } finally {
            client.release()
        }
    } catch (error){
        next(error)
    }

}