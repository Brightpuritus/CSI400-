const express = require("express")
const cors = require("cors")
const productsRouter = require("./routes/products")
const purchaseOrdersRouter = require("./routes/purchaseOrders")

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

// ใช้ router
app.use("/api/products", productsRouter)
app.use("/api/purchase-orders", purchaseOrdersRouter)

// Health check
app.get("/", (req, res) => res.send("Backend is running."))

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
