import express from "express"
import helmet from "helmet"
import cors from "cors"
import "dotenv/config"

const app = express()

const PORT = process.env.PORT || 8000

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})