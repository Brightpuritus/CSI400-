const express = require("express")
const fs = require("fs")
const path = require("path")
const router = express.Router()

const DATA_FILE = path.join(__dirname, "..", "data", "products.json")

function readProducts() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) } catch { return [] }
}
function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf8")
}

// GET
router.get("/", (req, res) => {
  res.json(readProducts())
})

// POST
router.post("/", (req, res) => {
  const products = readProducts()
  const { name, price = 0, stock = 0, imageUrl = "" } = req.body || {}
  if (!name) return res.status(400).json({ error: "Missing product name" })
  const newProduct = { id: `${Date.now()}`, name, price: Number(price)||0, stock: Number(stock)||0, imageUrl, createdAt: new Date().toISOString() }
  products.push(newProduct)
  writeProducts(products)
  res.status(201).json(newProduct)
})

// PUT /api/products/:id
router.put("/:id", (req, res) => {
  const products = readProducts()
  const id = String(req.params.id)
  const idx = products.findIndex(p => String(p.id) === id)
  if (idx === -1) return res.status(404).json({ error: "Product not found" })
  const { name, price = 0, stock = 0, imageUrl = "" } = req.body || {}
  if (!name) return res.status(400).json({ error: "Missing product name" })
  const updated = { ...products[idx], name, price: Number(price)||0, stock: Number(stock)||0, imageUrl, updatedAt: new Date().toISOString() }
  products[idx] = updated
  writeProducts(products)
  res.json(updated)
})

// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
  try {
    const products = readProducts()
    const id = String(req.params.id)
    const idx = products.findIndex(p => String(p.id) === id)
    if (idx === -1) return res.status(404).json({ error: "Product not found" })
    const removed = products.splice(idx, 1)[0]
    writeProducts(products)
    res.json({ ok: true, removedId: removed.id })
  } catch (err) {
    console.error("Delete product error", err)
    res.status(500).json({ error: "Failed to delete product" })
  }
})

module.exports = router