const pool = require("../utils/db"); // ใช้ MySQL connection pool

// GET /api/products -> ดึงข้อมูลสินค้าทั้งหมด
const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// POST /api/products -> สร้างสินค้าใหม่
const createProduct = async (req, res) => {
  const { name, price = 0, stock = 0, imageUrl = null } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, price, stock, imageUrl) VALUES (?, ?, ?, ?)",
      [name, price, stock, imageUrl]
    );

    const newProduct = {
      id: result.insertId,
      name,
      price,
      stock,
      imageUrl,
    };

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// PUT /api/products/update-stock -> อัปเดตสต็อกสินค้า
const updateStock = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const item of items) {
      const { productId, quantity } = item;
      await conn.query(
        "UPDATE products SET stock = GREATEST(0, stock + ?) WHERE id = ?",
        [quantity, productId]
      );
    }

    const [updatedProducts] = await conn.query("SELECT * FROM products");
    await conn.commit();

    res.json(updatedProducts);
  } catch (err) {
    await conn.rollback();
    console.error("Error updating stock:", err);
    res.status(500).json({ error: "Failed to update stock" });
  } finally {
    conn.release();
  }
};

// PUT /api/products/:id -> อัปเดตข้อมูลสินค้า
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const fields = [];
  const values = [];
  for (const key in updates) {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  }
  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const [[updatedProduct]] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// DELETE /api/products/:id -> ลบสินค้า
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

module.exports = { getProducts, createProduct, updateStock, updateProduct, deleteProduct };