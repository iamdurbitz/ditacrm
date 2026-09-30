import pool from "../db.js"
import bcrypt from "bcrypt"

export const register = async (req, res, next) => {
    const {name, email, password} = req.body

    if (!name || !email || !password){
        return res.status(400).json({
            error: "Name, email and password are required"
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
        
        console.log("Original:", password)
        console.log("Hashed:", hashedPassword)
        
        res.json({
            message: "Email available"
        })
    } catch (error){
        next(error)
    }

}