import express from "express"
import { createEmployee, getEmployees } from "./employee.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { authorize } from "../middleware/authorize.middleware.js"

const employeeRouter = express.Router()


employeeRouter.get("/", authMiddleware, authorize(["OWNER"]), getEmployees)
employeeRouter.post("/", authMiddleware, authorize(["OWNER"]), createEmployee)

export default employeeRouter