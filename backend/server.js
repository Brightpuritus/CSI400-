const express = require("express")
const cors = require("cors")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const orderRoutes = require("./routes/orderRoutes")
const productionRoutes = require("./routes/productionRoutes")
const deliveryRoutes = require("./routes/deliveryRoutes")
const productRoutes = require("./routes/productRoutes")

const app = express()

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // URL ของ Frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}))
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/production", productionRoutes)
app.use("/api/delivery", deliveryRoutes)
app.use("/api/products", productRoutes)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})