const pool = require("../utils/db"); // ใช้ MySQL connection pool
const fs = require("fs").promises
const path = require("path")
const dataFile = path.join(__dirname, "..", "data", "products.json")

// รับรายการสินค้าทั้งหมด (ถ้ามี)
async function getProducts(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id");
    return res.json(rows);
  } catch (err) {
    console.error("getProducts DB error:", err);
    // fallback to file if DB not available
    try {
      const raw = await fs.readFile(dataFile, "utf8");
      const products = JSON.parse(raw || "[]");
      return res.json(products);
    } catch (e) {
      console.error("getProducts fallback error:", e);
      return res.status(500).json({ error: "Failed to load products" });
    }
  }
}

// สร้างสินค้าใหม่
async function createProduct(req, res) {
  const body = req.body || {};
  try {
    const sql = `INSERT INTO products (name, price, stock, imageUrl, createdAt) VALUES (?, ?, ?, ?, NOW())`;
    const params = [body.name || "", body.price || 0, body.stock || 0, body.imageUrl || null];
    const [result] = await pool.query(sql, params);
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("createProduct DB error:", err);
    // fallback to file
    try {
      const raw = await fs.readFile(dataFile, "utf8").catch(() => "[]");
      const products = JSON.parse(raw || "[]");
      const nextId = products.length ? String(Math.max(...products.map(p => Number(p.id || 0))) + 1) : "1";
      const newProduct = {
        id: nextId,
        name: body.name || "",
        price: Number(body.price || 0),
        stock: Number(body.stock || 0),
        imageUrl: body.imageUrl || "",
        createdAt: new Date().toISOString()
      };
      products.push(newProduct);
      await fs.writeFile(dataFile, JSON.stringify(products, null, 2), "utf8");
      return res.status(201).json(newProduct);
    } catch (e) {
      console.error("createProduct fallback error:", e);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }
}

// UPDATE: อัปเดตสินค้า (รวม stock) — แก้ให้ทนทานต่อข้อผิดพลาดและคืนข้อมูลแถวที่อัปเดต
async function updateProduct(req, res) {
  const id = req.params.id;
  const body = req.body || {};

  if (!id) return res.status(400).json({ error: "Missing product id" });

  const allowed = ["name", "price", "stock", "imageUrl", "packSize", "description"];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      // sanitize numeric fields
      if (key === "price") {
        sets.push(`${key} = ?`);
        values.push(Number(body[key] || 0));
      } else if (key === "stock" || key === "packSize") {
        sets.push(`${key} = ?`);
        values.push(parseInt(body[key] ?? 0, 10));
      } else {
        sets.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
  }

  if (sets.length === 0) {
    return res.status(400).json({ error: "No updatable fields provided" });
  }

  // add updatedAt timestamp
  sets.push("updatedAt = NOW()");

  try {
    const sql = `UPDATE products SET ${sets.join(", ")} WHERE id = ?`;
    values.push(id);
    const [result] = await pool.query(sql, values);

    if (result && result.affectedRows > 0) {
      const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
      return res.json(rows[0]);
    }
    // ถ้าไม่มีแถวถูกอัปเดต ให้ลอง fallback ไปที่ไฟล์
  } catch (err) {
    console.error("DB updateProduct error:", err);
    // ไม่ return เพื่อให้ fallback พยายามอัปเดตไฟล์ต่อ
  }

  // Fallback: อัปเดตไฟล์ products.json
  try {
    const raw = await fs.readFile(dataFile, "utf8").catch(() => "[]");
    let products = [];
    try { products = JSON.parse(raw || "[]"); } catch (e) {
      console.error("Failed to parse products.json:", e);
      return res.status(500).json({ error: "Invalid products data" });
    }

    const idx = products.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updated = {
      ...products[idx],
      ...body,
      id: String(products[idx].id),
      updatedAt: new Date().toISOString()
    };

    products[idx] = updated;
    await fs.writeFile(dataFile, JSON.stringify(products, null, 2), "utf8");
    return res.json(updated);
  } catch (err) {
    console.error("updateProduct fallback error:", err);
    return res.status(500).json({ error: "Failed to update product" });
  }
}

// ลบสินค้า
async function deleteProduct(req, res) {
  const id = req.params.id;
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    if (result && result.affectedRows > 0) return res.json({ ok: true });
  } catch (err) {
    console.error("deleteProduct DB error:", err);
  }

  // fallback to file
  try {
    const raw = await fs.readFile(dataFile, "utf8").catch(() => "[]");
    let products = JSON.parse(raw || "[]");
    const idx = products.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: "Product not found" });
    products.splice(idx, 1);
    await fs.writeFile(dataFile, JSON.stringify(products, null, 2), "utf8");
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteProduct fallback error:", err);
    return res.status(500).json({ error: "Failed to delete product" });
  }
}

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};