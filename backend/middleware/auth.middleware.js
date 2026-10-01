import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({
            error: "Authentication required"
        })
    }

    const [type, token] = authHeader.split(" ")

    if (type !== "Bearer") {
        return res.status(401).json({
            error: "Invalid authentication format"
        })
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.user = decoded
        next()

    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token"
        })
    }
}