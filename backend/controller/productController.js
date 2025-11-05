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
  const { productId, quantity } = req.body;

  console.log("Request body:", req.body);

  if (!productId || quantity == null) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    console.error("Product not found for productId:", productId);
    return res.status(404).json({ error: "Product not found" });
  }

  products[productIndex].stock += quantity; // ลด stock ด้วยค่าลบ

  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  res.json(products[productIndex]);
}

module.exports = { getProducts, updateStock }