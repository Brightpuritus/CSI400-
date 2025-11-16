const express = require("express");
const {
  getOrders,
  addOrder,
  updateOrder,
  updatePaymentStatus,
  confirmPayment,
  updateOrderStatus,
} = require("../controller/orderController");
const router = express.Router();

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: O001
 *                   customerName:
 *                     type: string
 *                     example: John Doe
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: string
 *                           example: P001
 *                         quantity:
 *                           type: integer
 *                           example: 2
 *                   totalWithVat:
 *                     type: number
 *                     example: 107.0
 *                   status:
 *                     type: string
 *                     example: Completed
 */
router.get("/", getOrders);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Add a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: John Doe
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: P001
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order added successfully
 *       400:
 *         description: Invalid request
 */
router.post("/", addOrder);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: Completed
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
router.put("/:id", updateOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productionStatus:
 *                 type: string
 *                 example: In Production
 *               deliveryStatus:
 *                 type: string
 *                 example: Delivered
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         description: Order not found
 */
router.put("/:id/status", updateOrderStatus);

/**
 * @swagger
 * /orders/{id}/payment:
 *   put:
 *     summary: Update payment status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 example: Paid
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       404:
 *         description: Order not found
 */
router.put("/:id/payment", updatePaymentStatus);

/**
 * @swagger
 * /orders/{id}/confirm-payment:
 *   put:
 *     summary: Confirm payment for an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       404:
 *         description: Order not found
 */
router.put("/:id/confirm-payment", confirmPayment);

module.exports = router;