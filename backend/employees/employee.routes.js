import express from "express"
import { createEmployee } from "./employee.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { authorize } from "../middleware/authorize.middleware.js"

const router = express.Router()

router.post("/", authMiddleware, authorize(["OWNER"]), createEmployee)

export default router