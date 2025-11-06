const express = require("express");
const { getProducts, createProduct, updateProduct, deleteProduct, updateStock } = require("../controller/productController");

const router = express.Router();

router.get("/", getProducts);
router.put("/update-stock", updateStock);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;