const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const router = express.Router();
const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  decimalNumbers: true, // ✅ ให้ MySQL คืนค่า DECIMAL เป็น number แทน string
});
// GET all
router.get("/", async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT * FROM purchase_orders ORDER BY createdAt DESC"
    );
    for (const order of orders) {
      const [items] = await pool.query(
        "SELECT * FROM purchase_order_items WHERE orderId = ?",
        [order.id]
      );
      order.items = items;
      order.totalAmount = Number(order.totalAmount) || 0; // ✅ แปลงเป็นตัวเลข
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one
router.get("/:id", async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [req.params.id]
    );
    if (!orders.length) return res.status(404).json({ error: "Not found" });
    const order = orders[0];
    const [items] = await pool.query(
      "SELECT * FROM purchase_order_items WHERE orderId = ?",
      [order.id]
    );
    order.items = items;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
router.post("/", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const {
      supplier,
      notes,
      status = "pending",
      confirmedBy,
      confirmedAt,
      items = [],
    } = req.body;

    const id = Date.now().toString();
    const createdAt = new Date();
    const updatedAt = new Date();
    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice),
      0
    );

    await conn.query(
      "INSERT INTO purchase_orders (id, supplier, notes, status, createdAt, updatedAt, confirmedBy, confirmedAt, totalAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        supplier,
        notes,
        status,
        createdAt,
        updatedAt,
        confirmedBy || null,
        confirmedAt || null,
        totalAmount,
      ]
    );

    for (const it of items) {
      await conn.query(
        "INSERT INTO purchase_order_items (orderId, productId, productName, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?, ?)",
        [
          id,
          it.productId,
          it.productName || it.name || "",
          Number(it.quantity) || 0,
          Number(it.unitPrice ?? it.pricePerUnit) || 0,
          (Number(it.quantity) || 0) *
            (Number(it.unitPrice ?? it.pricePerUnit) || 0),
        ]
      );
    }

    await conn.commit();
    res
      .status(201)
      .json({
        id,
        supplier,
        notes,
        status,
        createdAt,
        updatedAt,
        confirmedBy,
        confirmedAt,
        totalAmount,
        items,
      });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.put("/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      supplier,
      notes,
      status,
      confirmedBy,
      confirmedAt: confirmedAtRaw,
      items = [],
    } = req.body;

    const toDateOrNull = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    const updatedAt = new Date();
    const confirmedAt = toDateOrNull(confirmedAtRaw);

    // 🧮 ดึงสินค้าปัจจุบันในฐานข้อมูลก่อน
    const [existingItems] = await conn.query(
      "SELECT * FROM purchase_order_items WHERE orderId = ?",
      [req.params.id]
    );

    // 🧾 สร้าง map ของสินค้าปัจจุบันเพื่อเปรียบเทียบ
    const existingMap = new Map();
    for (const it of existingItems) {
      existingMap.set(it.productId, it);
    }

    // 🧮 คำนวณราคารวมใหม่
    let totalAmount = 0;
    for (const it of items) {
      totalAmount += Number(it.quantity) * Number(it.unitPrice);
    }

    // ✅ อัปเดตข้อมูลหลักในตาราง purchase_orders
    await conn.query(
      `UPDATE purchase_orders
       SET supplier=?, notes=?, status=?, updatedAt=?, confirmedBy=?, confirmedAt=?, totalAmount=?
       WHERE id=?`,
      [
        supplier,
        notes,
        status,
        updatedAt,
        confirmedBy || null,
        confirmedAt,
        totalAmount,
        req.params.id,
      ]
    );

    // ✅ วนลูปดูสินค้าที่ส่งมาจาก frontend
    for (const it of items) {
      const existing = existingMap.get(it.productId);
      const totalPrice = Number(it.quantity) * Number(it.unitPrice);

      if (existing) {
        // 🔄 ถ้ามีอยู่แล้ว → อัปเดตจำนวนและราคารวม
        await conn.query(
          `UPDATE purchase_order_items
           SET quantity=?, unitPrice=?, totalPrice=?, productName=?
           WHERE orderId=? AND productId=?`,
          [
            Number(it.quantity),
            Number(it.unitPrice),
            totalPrice,
            it.productName || existing.productName,
            req.params.id,
            it.productId,
          ]
        );
        existingMap.delete(it.productId);
      } else {
        // ➕ ถ้ายังไม่มี → เพิ่มใหม่
        await conn.query(
          `INSERT INTO purchase_order_items (orderId, productId, productName, quantity, unitPrice, totalPrice)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            req.params.id,
            it.productId,
            it.productName || it.name || "",
            Number(it.quantity),
            Number(it.unitPrice),
            totalPrice,
          ]
        );
      }
    }

    // ❌ ลบสินค้าที่ไม่ได้ส่งมา (แปลว่าถูกลบออก)
    for (const [productId] of existingMap) {
      await conn.query(
        "DELETE FROM purchase_order_items WHERE orderId=? AND productId=?",
        [req.params.id, productId]
      );
    }

    await conn.commit();
    res.json({
      id: req.params.id,
      supplier,
      notes,
      status,
      confirmedBy,
      confirmedAt,
      totalAmount,
      items,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error updating purchase order:", err);
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM purchase_order_items WHERE orderId = ?", [
      req.params.id,
    ]);
    await conn.query("DELETE FROM purchase_orders WHERE id = ?", [
      req.params.id,
    ]);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
