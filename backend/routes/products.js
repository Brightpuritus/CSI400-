const express = require("express")
const fs = require("fs")
const path = require("path")
const router = express.Router()

const DATA_FILE = path.join(__dirname, "..", "data", "products.json")

function readProducts() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) } catch (e) { return [] }
}
function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf8")
}

// GET /api/products
router.get("/", (req, res) => {
  const products = readProducts()
  res.json(products)
})

// POST /api/products
router.post("/", (req, res) => {
  console.log("POST /api/products - headers:", req.headers)
  console.log("POST /api/products - body:", req.body)

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Empty request body. Ensure Content-Type: application/json and body is valid JSON." })
  }

  try {
    const products = readProducts()
    const { name, price = 0, stock = 0, imageUrl = "" } = req.body
    if (!name) return res.status(400).json({ error: "Missing product name" })

    const newProduct = {
      id: `${Date.now()}`,
      name,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      imageUrl,
      createdAt: new Date().toISOString()
    }
    products.push(newProduct)

    try {
      writeProducts(products)
    } catch (writeErr) {
      console.error("Failed to write products.json:", writeErr)
      return res.status(500).json({ error: "Failed to write products file", detail: String(writeErr.message || writeErr) })
    }

    res.status(201).json(newProduct)
  } catch (err) {
    console.error("Create product error:", err)
    res.status(500).json({ error: "Failed to create product", detail: String(err.message || err) })
  }
})

module.exports = router