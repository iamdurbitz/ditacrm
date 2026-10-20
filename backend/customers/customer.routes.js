import express from "express"

import {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
} from "./customer.controller.js"

import { authMiddleware } from "../middleware/auth.middleware.js"

const customerRouter = express.Router()

customerRouter.use(authMiddleware)

customerRouter.get("/", getCustomers)
customerRouter.get("/:id", getCustomerById)
customerRouter.post("/", createCustomer)
customerRouter.put("/:id", updateCustomer)
customerRouter.delete("/:id", deleteCustomer)

export default customerRouter