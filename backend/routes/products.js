const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")
require("dotenv").config()

// ✅ ใช้ MYSQL_URL จาก .env หรือ Railway
const pool = mysql.createPool(process.env.MYSQL_URL)

// ✅ ดึงสินค้าทั้งหมด
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products")
    res.json(rows)
  } catch (err) {
    console.error("❌ Error fetching products:", err)
    res.status(500).json({ error: "Database error" })
  }
})

// ✅ ดึงสินค้าเดี่ยวตาม id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: "Not found" })
    res.json(rows[0])
  } catch (err) {
    console.error("❌ Error fetching product:", err)
    res.status(500).json({ error: "Database error" })
  }
})

// ✅ เพิ่มสินค้าใหม่
router.post("/", async (req, res) => {
  try {
    const { name, description, category, price, quantity, unit, minStock, expiryDate, image } = req.body
    const id = Date.now().toString()
    await pool.query(
      "INSERT INTO products (id, name, description, category, price, quantity, unit, minStock, expiryDate, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name, description, category, price, quantity, unit, minStock, expiryDate, image]
    )
    res.status(201).json({ id, name, description, category, price, quantity, unit, minStock, expiryDate, image })
  } catch (err) {
    console.error("❌ Error adding product:", err)
    res.status(500).json({ error: "Database error" })
  }
})

// ✅ อัปเดตสินค้า
router.put("/:id", async (req, res) => {
  try {
    const { name, description, category, price, quantity, unit, minStock, expiryDate, image } = req.body
    const [result] = await pool.query(
      "UPDATE products SET name=?, description=?, category=?, price=?, quantity=?, unit=?, minStock=?, expiryDate=?, image=? WHERE id=?",
      [name, description, category, price, quantity, unit, minStock, expiryDate, image, req.params.id]
    )

    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" })
    res.json({ id: req.params.id, ...req.body })
  } catch (err) {
    console.error("❌ Error updating product:", err)
    res.status(500).json({ error: "Database error" })
  }
})

// ✅ ลบสินค้า
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" })
    res.json({ message: "Deleted successfully" })
  } catch (err) {
    console.error("❌ Error deleting product:", err)
    res.status(500).json({ error: "Database error" })
  }
})

module.exports = router
