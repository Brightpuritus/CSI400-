const express = require("express")
const mysql = require("mysql2/promise")
const router = express.Router()
require("dotenv").config()

// ใช้ MYSQL_URL จาก .env
const pool = mysql.createPool({
  uri: process.env.MYSQL_URL, // ใช้ URL สำหรับการเชื่อมต่อ MySQL
  decimalNumbers: true, // คืนค่า DECIMAL เป็น number แทน string
})

pool.getConnection()
  .then((conn) => {
    console.log("✅ MySQL connected successfully!");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MySQL:", err.message);
  });

// Get all withdrawal orders
router.get("/", async (req, res) => {
  try {
    const [orders] = await pool.query("SELECT * FROM withdrawal_orders ORDER BY createdAt DESC")
    for (const order of orders) {
      const [items] = await pool.query("SELECT * FROM withdrawal_order_items WHERE orderId = ?", [order.id])
      order.items = items
    }
    res.json({ withdrawalOrders: orders })
  } catch (err) {
    console.error("Error fetching withdrawal orders:", err)
    res.status(500).json({ error: "Failed to fetch withdrawal orders" })
  }
})

// Create new withdrawal order
router.post("/", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const {
      branch,
      shippingAddress,
      requestedBy,
      notes,
      items = [],
    } = req.body;

    const id = `WO-${Date.now()}`;
    const orderNumber = `WD${new Date().getFullYear()}${String(items.length + 1).padStart(3, "0")}`;
    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " "); // แปลงเป็นรูปแบบที่ MySQL รองรับ
    const status = "pending";

    await conn.query(
      "INSERT INTO withdrawal_orders (id, orderNumber, branch, shippingAddress, requestedBy, createdAt, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, orderNumber, branch, shippingAddress, requestedBy, createdAt, status, notes]
    );

    for (const item of items) {
      // ดึงชื่อสินค้า (productName) จาก table products
      const [product] = await conn.query("SELECT name FROM products WHERE id = ?", [item.productId]);
      const productName = product.length ? product[0].name : null;

      if (!productName) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      await conn.query(
        "INSERT INTO withdrawal_order_items (orderId, productId, productName, quantity) VALUES (?, ?, ?, ?)",
        [id, item.productId, productName, item.quantity]
      );
    }

    await conn.commit();
    res.status(201).json({ id, orderNumber, branch, shippingAddress, requestedBy, createdAt, status, notes, items });
  } catch (err) {
    await conn.rollback();
    console.error("Error creating withdrawal order:", err);
    res.status(500).json({ error: "Failed to create withdrawal order" });
  } finally {
    conn.release();
  }
});

// Confirm withdrawal order
router.post("/:id/confirm", async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const { confirmedBy } = req.body
    const confirmedAt = new Date().toISOString().slice(0, 19).replace("T", " ") // แปลงเป็นรูปแบบที่ MySQL รองรับ

    const [orders] = await conn.query("SELECT * FROM withdrawal_orders WHERE id = ?", [req.params.id])
    if (!orders.length) {
      return res.status(404).json({ error: "Order not found" })
    }

    const order = orders[0]
    const [items] = await conn.query("SELECT * FROM withdrawal_order_items WHERE orderId = ?", [order.id])

    // ตรวจสอบว่าสินค้ามีเพียงพอหรือไม่
    const [products] = await conn.query("SELECT * FROM products")
    const hasEnoughStock = items.every((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product && product.quantity >= item.quantity
    })

    if (!hasEnoughStock) {
      return res.status(400).json({ error: "สินค้าไม่เพียงพอ" })
    }

    // อัปเดตจำนวนสินค้าในคลัง
    for (const item of items) {
      await conn.query(
        "UPDATE products SET quantity = quantity - ? WHERE id = ?",
        [item.quantity, item.productId]
      )
    }

    // อัปเดตสถานะใบเบิก
    await conn.query(
      "UPDATE withdrawal_orders SET status = ?, confirmedBy = ?, confirmedAt = ? WHERE id = ?",
      ["confirmed", confirmedBy, confirmedAt, req.params.id]
    )

    await conn.commit()
    res.json({ ...order, status: "confirmed", confirmedBy, confirmedAt, items })
  } catch (err) {
    await conn.rollback()
    console.error("Error confirming withdrawal order:", err)
    res.status(500).json({ error: "Failed to confirm withdrawal order" })
  } finally {
    conn.release()
  }
})

module.exports = router