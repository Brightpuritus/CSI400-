const express = require("express")
const fs = require("fs")
const path = require("path")

const router = express.Router()
const DATA_FILE = path.join(__dirname, "..", "data", "purchaseOrders.json")

// ===== Helper =====
function readPurchaseOrders() {
  if (!fs.existsSync(DATA_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))
  } catch (e) {
    return []
  }
}

function writePurchaseOrders(orders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")
}

// ===== Routes =====

// GET all
router.get("/", (req, res) => {
  res.json(readPurchaseOrders())
})

// GET one
router.get("/:id", (req, res) => {
  const orders = readPurchaseOrders()
  const order = orders.find(o => o.id === req.params.id)
  if (!order) return res.status(404).json({ error: "Not found" })
  res.json(order)
})

// CREATE
router.post("/", (req, res) => {
  const orders = readPurchaseOrders()
  const body = req.body || {}
  const id = Date.now().toString()

  const items = (body.items || []).map(it => ({
    productId: it.productId,
    productName: it.productName || it.name || "",
    quantity: Number(it.quantity) || 0,
    unitPrice: Number(it.pricePerUnit ?? it.unitPrice) || 0,
    totalPrice: (Number(it.quantity) || 0) * (Number(it.pricePerUnit ?? it.unitPrice) || 0)
  }))

  const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0)

  const newOrder = {
    ...body,
    id,
    items,
    totalAmount,
    status: body.status || "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  orders.push(newOrder)
  writePurchaseOrders(orders)
  res.status(201).json(newOrder)
})

// UPDATE
router.put("/:id", (req, res) => {
  let orders = readPurchaseOrders()
  const idx = orders.findIndex(o => o.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })

  const updated = { ...orders[idx], ...req.body, updatedAt: new Date().toISOString() }

  if (req.body.items) {
    updated.items = req.body.items.map(it => ({
      productId: it.productId,
      productName: it.productName || it.name || "",
      quantity: Number(it.quantity) || 0,
      unitPrice: Number(it.pricePerUnit ?? it.unitPrice) || 0,
      totalPrice: (Number(it.quantity) || 0) * (Number(it.pricePerUnit ?? it.unitPrice) || 0)
    }))
    updated.totalAmount = updated.items.reduce((s, i) => s + i.totalPrice, 0)
  }

  orders[idx] = updated
  writePurchaseOrders(orders)
  res.json(updated)
})

// DELETE
router.delete("/:id", (req, res) => {
  let orders = readPurchaseOrders()
  const idx = orders.findIndex(o => o.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })
  const deleted = orders.splice(idx, 1)[0]
  writePurchaseOrders(orders)
  res.json(deleted)
})

module.exports = router
