import express from "express"
import helmet from "helmet"
import cors from "cors"
import "dotenv/config"
import pool from "./db.js"
import router from "./auth/auth.routes.js"
import { authMiddleware } from "./middleware/auth.middleware.js"

const app = express()

const PORT = process.env.PORT || 8000

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use("/api/auth", router)

app.get("/", (req, res) => {
    res.json({
        message: "DitaCRM API"
    })
})

app.get("/api/health", async (req, res, next) => {
    try {
        const result = await pool.query("SELECT NOW()")

        res.json({
            status: "ok",
            database: "connected",
            time: result.rows[0].now
        })
    } catch (error) {
        next(error)
    }
})

app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    })
})

app.use((err, req, res, next) => {
    console.error(err)

    res.status(500).json({
        error: "Internal server error"
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})