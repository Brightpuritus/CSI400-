const express = require("express");
const { getDeliveries, updateDelivery } = require("../controller/deliveryController");
const router = express.Router();

router.get("/", getDeliveries); // ดึงข้อมูลการจัดส่ง
router.put("/:id", updateDelivery); // อัปเดตข้อมูลการจัดส่ง

module.exports = router;