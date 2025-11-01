const express = require("express")
const { getDeliveries, updateDelivery } = require("../controller/deliveryController")
const router = express.Router()

router.get("/", getDeliveries)
router.put("/", updateDelivery) // Route สำหรับอัปเดตข้อมูลการจัดส่ง

module.exports = router