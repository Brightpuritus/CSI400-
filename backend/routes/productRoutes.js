const express = require("express");
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require("../controller/productController");

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: P001
 *                   name:
 *                     type: string
 *                     example: Product A
 *                   price:
 *                     type: number
 *                     example: 100.0
 *                   stock:
 *                     type: integer
 *                     example: 50
 */
router.get("/", getProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Product A
 *               price:
 *                 type: number
 *                 example: 100.0
 *               stock:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid request
 */
router.post("/", createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Product A Updated
 *               price:
 *                 type: number
 *                 example: 120.0
 *               stock:
 *                 type: integer
 *                 example: 40
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put("/:id", updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete("/:id", deleteProduct);

module.exports = router;