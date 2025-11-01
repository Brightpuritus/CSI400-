const { readJSON, writeJSON } = require("../utils/fileUtils")

const getDeliveries = (req, res) => {
  const orders = readJSON("orders.json")
  const deliveries = orders.filter((o) => o.deliveryStatus)
  res.json(deliveries)
}

const updateDelivery = (req, res) => {
  const orders = readJSON("orders.json")
  const { id, trackingNumber, deliveryStatus } = req.body

  const index = orders.findIndex((order) => order.id === id)
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" })
  }

  orders[index].trackingNumber = trackingNumber
  orders[index].deliveryStatus = deliveryStatus

  // อัปเดตสถานะคำสั่งซื้อเป็น "เสร็จสิ้น" และลบ productionStatus หากจัดส่งสำเร็จ
  if (deliveryStatus === "จัดส่งสำเร็จ") {
    orders[index].status = "เสร็จสิ้น"
    orders[index].productionStatus = null // ลบสถานะการผลิต
  }

  writeJSON("orders.json", orders)
  res.json(orders[index])
}

module.exports = { getDeliveries, updateDelivery }