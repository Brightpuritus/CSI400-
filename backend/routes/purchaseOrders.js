const express = require("express")
const mysql = require("mysql2/promise")
require("dotenv").config()

const router = express.Router()
const pool = mysql.createPool(process.env.MYSQL_URL)

// GET all
router.get("/", async (req, res) => {
  try {
    const [orders] = await pool.query("SELECT * FROM purchase_orders ORDER BY createdAt DESC")
    for (const order of orders) {
      const [items] = await pool.query("SELECT * FROM purchase_order_items WHERE orderId = ?", [order.id])
      order.items = items
    }
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET one
router.get("/:id", async (req, res) => {
  try {
    const [orders] = await pool.query("SELECT * FROM purchase_orders WHERE id = ?", [req.params.id])
    if (!orders.length) return res.status(404).json({ error: "Not found" })
    const order = orders[0]
    const [items] = await pool.query("SELECT * FROM purchase_order_items WHERE orderId = ?", [order.id])
    order.items = items
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// CREATE
router.post("/", async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const {
      supplier,
      notes,
      status = "pending",
      confirmedBy,
      confirmedAt,
      items = []
    } = req.body

    const id = Date.now().toString()
    const createdAt = new Date()
    const updatedAt = new Date()
    const totalAmount = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice)), 0)

    await conn.query(
      "INSERT INTO purchase_orders (id, supplier, notes, status, createdAt, updatedAt, confirmedBy, confirmedAt, totalAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, supplier, notes, status, createdAt, updatedAt, confirmedBy || null, confirmedAt || null, totalAmount]
    )

    for (const it of items) {
      await conn.query(
        "INSERT INTO purchase_order_items (orderId, productId, productName, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?, ?)",
        [
          id,
          it.productId,
          it.productName || it.name || "",
          Number(it.quantity) || 0,
          Number(it.unitPrice ?? it.pricePerUnit) || 0,
          (Number(it.quantity) || 0) * (Number(it.unitPrice ?? it.pricePerUnit) || 0)
        ]
      )
    }

    await conn.commit()
    res.status(201).json({ id, supplier, notes, status, createdAt, updatedAt, confirmedBy, confirmedAt, totalAmount, items })
  } catch (err) {
    await conn.rollback()
    res.status(400).json({ error: err.message })
  } finally {
    conn.release()
  }
})

// UPDATE
router.put("/:id", async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const {
      supplier,
      notes,
      status,
      confirmedBy,
      confirmedAt,
      items = []
    } = req.body

    const updatedAt = new Date()
    const totalAmount = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice)), 0)

    await conn.query(
      "UPDATE purchase_orders SET supplier=?, notes=?, status=?, updatedAt=?, confirmedBy=?, confirmedAt=?, totalAmount=? WHERE id=?",
      [supplier, notes, status, updatedAt, confirmedBy || null, confirmedAt || null, totalAmount, req.params.id]
    )

    await conn.query("DELETE FROM purchase_order_items WHERE orderId = ?", [req.params.id])
    for (const it of items) {
      await conn.query(
        "INSERT INTO purchase_order_items (orderId, productId, productName, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?, ?)",
        [
          req.params.id,
          it.productId,
          it.productName || it.name || "",
          Number(it.quantity) || 0,
          Number(it.unitPrice ?? it.pricePerUnit) || 0,
          (Number(it.quantity) || 0) * (Number(it.unitPrice ?? it.pricePerUnit) || 0)
        ]
      )
    }

    await conn.commit()
    res.json({ id: req.params.id, supplier, notes, status, updatedAt, confirmedBy, confirmedAt, totalAmount, items })
  } catch (err) {
    await conn.rollback()
    res.status(400).json({ error: err.message })
  } finally {
    conn.release()
  }
})

// DELETE
router.delete("/:id", async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query("DELETE FROM purchase_order_items WHERE orderId = ?", [req.params.id])
    await conn.query("DELETE FROM purchase_orders WHERE id = ?", [req.params.id])
    await conn.commit()
    res.json({ success: true })
  } catch (err) {
    await conn.rollback()
    res.status(400).json({ error: err.message })
  } finally {
    conn.release()
  }
})

module.exports = router
