const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const app = express()
const PORT = 5000
const DATA_FILE = path.join(__dirname, "data", "products.json")

app.use(cors())
app.use(express.json())

// Helper: read/write products
function readProducts() {
  if (!fs.existsSync(DATA_FILE)) return []
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))
}
function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf8")
}

// GET all products
app.get("/api/products", (req, res) => {
  res.json(readProducts())
})

// GET single product
app.get("/api/products/:id", (req, res) => {
  const products = readProducts()
  const product = products.find(p => p.id === req.params.id)
  if (!product) return res.status(404).json({ error: "Not found" })
  res.json(product)
})

// CREATE product
app.post("/api/products", (req, res) => {
  const products = readProducts()
  const newProduct = { ...req.body, id: Date.now().toString() }
  products.push(newProduct)
  writeProducts(products)
  res.status(201).json(newProduct)
})

// UPDATE product
app.put("/api/products/:id", (req, res) => {
  let products = readProducts()
  const idx = products.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })
  products[idx] = { ...products[idx], ...req.body }
  writeProducts(products)
  res.json(products[idx])
})

// DELETE product
app.delete("/api/products/:id", (req, res) => {
  let products = readProducts()
  const idx = products.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })
  const deleted = products.splice(idx, 1)[0]
  writeProducts(products)
  res.json(deleted)
})

// Health check
app.get("/", (req, res) => res.send("Backend is running."))

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})