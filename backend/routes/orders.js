const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const DATA_FILE = path.join(__dirname, '..', 'data', 'orders.json')

function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch (e) {
    return []
  }
}
function writeOrders(orders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf8')
}

// POST /api/orders  -> สร้างคำสั่งซื้อใหม่
router.post('/', (req, res) => {
  try {
    const orders = readOrders()
    const body = req.body

    const newOrder = {
      id: `${Date.now()}`,
      customerId: body.customerId || null,
      customerName: body.customerName || null,
      items: body.items || [],
      subtotal: body.subtotal || 0,
      vat: body.vat || 0,
      totalWithVat: body.totalWithVat || 0,
      deliveryDate: body.deliveryDate || null,
      deliveryAddress: body.deliveryAddress || null, // เก็บที่อยู่จัดส่ง
      productionStatus: body.productionStatus || null,
      trackingNumber: body.trackingNumber || null,
      deliveryStatus: body.deliveryStatus || null,
      status: body.status || 'รอดำเนินการ',
      createdAt: new Date().toISOString()
    }

    orders.unshift(newOrder)
    writeOrders(orders)

    res.status(201).json(newOrder)
  } catch (err) {
    console.error('Create order error', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

module.exports = router