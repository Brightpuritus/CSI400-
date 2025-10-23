const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()
const DATA_FILE = path.join(__dirname, '..', 'data', 'withdrawalOrders.json')
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json')

function readProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

// Helper functions
function readWithdrawalOrders() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = { withdrawalOrders: [] }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8')
    return initialData
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return { withdrawalOrders: [] }
  }
}

function writeWithdrawalOrders(orders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf8')
}

// Get all withdrawal orders
router.get('/', (req, res) => {
  const orders = readWithdrawalOrders()
  res.json(orders)
})

// Create new withdrawal order
router.post('/', (req, res) => {
  try {
    const orders = readWithdrawalOrders()
    const products = readProducts()
    const body = req.body

    const newOrder = {
      id: `WO-${Date.now()}`,
      orderNumber: `WD${new Date().getFullYear()}${String(orders.withdrawalOrders.length + 1).padStart(3, '0')}`,
      department: body.department,
      purpose: body.purpose,
      requestedBy: body.requestedBy,
      createdAt: new Date().toISOString(),
      status: 'pending',
      items: body.items.map(item => {
        const product = products.find(p => p.id === item.productId)
        return {
          productId: item.productId,
          productName: product ? product.name : 'Unknown Product',
          quantity: parseInt(item.quantity)
        }
      }),
      notes: body.notes || null
    }

    orders.withdrawalOrders.push(newOrder)
    writeWithdrawalOrders(orders)
    res.status(201).json(newOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create withdrawal order' })
  }
})

// Confirm withdrawal order
router.post('/:id/confirm', (req, res) => {
  try {
    const orders = readWithdrawalOrders()
    const orderIndex = orders.withdrawalOrders.findIndex(o => o.id === req.params.id)

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' })
    }

    orders.withdrawalOrders[orderIndex] = {
      ...orders.withdrawalOrders[orderIndex],
      status: 'confirmed',
      confirmedBy: req.body.confirmedBy,
      confirmedAt: new Date().toISOString()
    }

    writeWithdrawalOrders(orders)
    res.json(orders.withdrawalOrders[orderIndex])
  } catch (error) {
    console.error('Error confirming order:', error)
    res.status(500).json({ error: 'Failed to confirm withdrawal order' })
  }
})

module.exports = router