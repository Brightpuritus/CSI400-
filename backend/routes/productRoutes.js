const express = require("express");
const { updateStock, getProducts } = require("../controller/productController");
const router = express.Router();

router.get("/", getProducts);
router.put("/update-stock", updateStock);

module.exports = router;