const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const app = express()
const PORT = 5000
const DATA_FILE = path.join(__dirname, "data", "products.json")
const PURCHASE_ORDER_FILE = path.join(__dirname, "data", "purchaseOrders.json")


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

function readPurchaseOrders() {
  if (!fs.existsSync(PURCHASE_ORDER_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(PURCHASE_ORDER_FILE, "utf8"))
  } catch (e) {
    return []
  }
}

function writePurchaseOrders(orders) {
  fs.writeFileSync(PURCHASE_ORDER_FILE, JSON.stringify(orders, null, 2), "utf8")
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

// --- Purchase Orders API ---

// GET all purchase orders
app.get("/api/purchase-orders", (req, res) => {
  res.json(readPurchaseOrders())
})

// GET single purchase order
app.get("/api/purchase-orders/:id", (req, res) => {
  const orders = readPurchaseOrders()
  const order = orders.find(o => o.id === req.params.id)
  if (!order) return res.status(404).json({ error: "Not found" })
  res.json(order)
})

// CREATE purchase order
app.post("/api/purchase-orders", (req, res) => {
  const orders = readPurchaseOrders()
  const body = req.body || {}
  const id = Date.now().toString()

  // ensure items are normalized
  const items = (body.items || []).map((it) => ({
    productId: it.productId,
    productName: it.productName || it.name || "",
    quantity: Number(it.quantity) || 0,
    unitPrice: Number(it.pricePerUnit ?? it.unitPrice) || 0,
    totalPrice: (Number(it.quantity) || 0) * (Number(it.pricePerUnit ?? it.unitPrice) || 0),
  }))

  const totalAmount = items.reduce((s, i) => s + (i.totalPrice || 0), 0)

  const newOrder = {
    ...body,
    id,
    items,
    totalAmount,
    status: body.status || "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  orders.push(newOrder)
  writePurchaseOrders(orders)
  res.status(201).json(newOrder)
})

// UPDATE purchase order
app.put("/api/purchase-orders/:id", (req, res) => {
  let orders = readPurchaseOrders()
  const idx = orders.findIndex(o => o.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })
  const updated = { ...orders[idx], ...req.body, updatedAt: new Date().toISOString() }
  // Recompute totals if items provided
  if (req.body.items) {
    updated.items = (req.body.items || []).map((it) => ({
      productId: it.productId,
      productName: it.productName || it.name || "",
      quantity: Number(it.quantity) || 0,
      unitPrice: Number(it.pricePerUnit ?? it.unitPrice) || 0,
      totalPrice: (Number(it.quantity) || 0) * (Number(it.pricePerUnit ?? it.unitPrice) || 0),
    }))
    updated.totalAmount = updated.items.reduce((s, i) => s + (i.totalPrice || 0), 0)
  }
  orders[idx] = updated
  writePurchaseOrders(orders)
  res.json(updated)
})

// DELETE purchase order
app.delete("/api/purchase-orders/:id", (req, res) => {
  let orders = readPurchaseOrders()
  const idx = orders.findIndex(o => o.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })
  const deleted = orders.splice(idx, 1)[0]
  writePurchaseOrders(orders)
  res.json(deleted)
})

// Helper: read/write purchase orders
function readPurchaseOrders() {
  if (!fs.existsSync(PURCHASE_ORDER_FILE)) return [];
  return JSON.parse(fs.readFileSync(PURCHASE_ORDER_FILE, "utf8"));
}
function writePurchaseOrders(orders) {
  fs.writeFileSync(PURCHASE_ORDER_FILE, JSON.stringify(orders, null, 2), "utf8");
}

// GET all purchase orders
app.get("/api/purchase-orders", (req, res) => {
  res.json(readPurchaseOrders());
});

// GET single purchase order
app.get("/api/purchase-orders/:id", (req, res) => {
  const orders = readPurchaseOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

// CREATE purchase order
app.post("/api/purchase-orders", (req, res) => {
  const orders = readPurchaseOrders();
  const newOrder = { ...req.body, id: Date.now().toString(), status: "pending", createdAt: new Date().toISOString() };
  orders.push(newOrder);
  writePurchaseOrders(orders);
  res.status(201).json(newOrder);
});

// UPDATE purchase order
app.put("/api/purchase-orders/:id", (req, res) => {
  let orders = readPurchaseOrders();
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  orders[idx] = { ...orders[idx], ...req.body, updatedAt: new Date().toISOString() };
  writePurchaseOrders(orders);
  res.json(orders[idx]);
});

// DELETE purchase order
app.delete("/api/purchase-orders/:id", (req, res) => {
  let orders = readPurchaseOrders();
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const deleted = orders.splice(idx, 1)[0];
  writePurchaseOrders(orders);
  res.json(deleted);
});

// Health check
app.get("/", (req, res) => res.send("Backend is running."))

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})