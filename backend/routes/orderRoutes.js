const express = require("express")
const { getOrders, addOrder, updateOrder, updatePaymentStatus, confirmPayment, updateOrderStatus } = require("../controller/orderController")
const router = express.Router()

router.get("/", getOrders)
router.post("/", addOrder)
router.put("/:id", updateOrder)
router.put("/:id/status", updateOrderStatus); // สำหรับอัปเดต production + deliveryStatus + stock
router.put("/:id/payment", updatePaymentStatus)
router.put("/:id/confirm-payment", confirmPayment)

module.exports = router