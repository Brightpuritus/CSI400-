const express = require("express")
const cors = require("cors")
const withdrawalOrdersRouter = require("./routes/withdrawalOrders")
const purchaseOrdersRouter = require("./routes/purchaseOrders")
const productsRouter = require("./routes/products")

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

// ใช้ router
app.use("/api/withdrawal-orders", withdrawalOrdersRouter)
app.use("/api/purchase-orders", purchaseOrdersRouter)
app.use("/api/products", productsRouter)

// Health check
app.get("/", (req, res) => res.send("Backend is running."))

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})