const { readJSON } = require("../utils/fileUtils")
const fs = require("fs");
const path = require("path");
const productsPath = path.join(__dirname, "../data/products.json");

const getProducts = (req, res) => {
  try {
    const products = readJSON("products.json"); // อ่านข้อมูลจากไฟล์ products.json
    res.json(products); // ส่งข้อมูลสินค้าในรูปแบบ JSON
  } catch (error) {
    console.error("Error reading products:", error);
    res.status(500).json({ error: "Failed to load products" });
  }
};

function updateStock(req, res) {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

  items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const currentStock = Number(product.stock) || 0;
      const change = Number(item.quantity) || 0;

      // ✅ เพิ่มหรือตัดสต็อกได้ในฟังก์ชันเดียว
      product.stock = Math.max(0, currentStock + change);
    }
  });

  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  res.json(products);
}


function createProduct(req, res) {
  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  const newProduct = { id: Date.now().toString(), ...req.body };
  products.push(newProduct);
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  res.status(201).json(newProduct);
}

function updateProduct(req, res) {
  const { id } = req.params;
  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products[productIndex] = { ...products[productIndex], ...req.body };
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  res.json(products[productIndex]);
}

function deleteProduct(req, res) {
  const { id } = req.params;
  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  const updatedProducts = products.filter((p) => p.id !== id);

  if (products.length === updatedProducts.length) {
    return res.status(404).json({ error: "Product not found" });
  }

  fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));
  res.status(204).end();
}

module.exports = { getProducts, updateStock, createProduct, updateProduct, deleteProduct }