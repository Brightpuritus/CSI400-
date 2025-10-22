const express = require("express")
const fs = require("fs")
const path = require("path")

const router = express.Router()

const DATA_FILE = path.join(__dirname, "..", "data", "products.json")

// Helper functions
function readProducts() {
  if (!fs.existsSync(DATA_FILE)) return []
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))
}
function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf8")
}

// GET all products
router.get("/", (req, res) => {
  res.json(readProducts())
})

// GET single product
router.get("/:id", (req, res) => {
  const products = readProducts()
  const product = products.find(p => p.id === req.params.id)
  if (!product) return res.status(404).json({ error: "Not found" })
  res.json(product)
})

// CREATE product
router.post("/", (req, res) => {
  const products = readProducts()
  const newProduct = { ...req.body, id: Date.now().toString() }
  products.push(newProduct)
  writeProducts(products)
  res.status(201).json(newProduct)
})

// UPDATE product
router.put("/:id", (req, res) => {
  let products = readProducts()
  const idx = products.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })
  products[idx] = { ...products[idx], ...req.body }
  writeProducts(products)
  res.json(products[idx])
})

// DELETE product
router.delete("/:id", (req, res) => {
  let products = readProducts()
  const idx = products.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })
  const deleted = products.splice(idx, 1)[0]
  writeProducts(products)
  res.json(deleted)
})

module.exports = router
