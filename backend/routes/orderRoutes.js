const express = require("express")
const { getOrders, addOrder, updateOrder } = require("../controller/orderController")
const router = express.Router()

router.get("/", getOrders)
router.post("/", addOrder)
router.put("/:id", updateOrder) // เพิ่ม Route สำหรับอัปเดตคำสั่งซื้อ

module.exports = router