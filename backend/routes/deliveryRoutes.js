const express = require("express");
const { getDeliveries, updateDelivery } = require("../controller/deliveryController");
const router = express.Router();

/**
 * @swagger
 * /delivery:
 *   get:
 *     summary: Get all delivery records
 *     tags: [Delivery]
 *     responses:
 *       200:
 *         description: A list of all delivery records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: D001
 *                   status:
 *                     type: string
 *                     example: Delivered
 *                   trackingNumber:
 *                     type: string
 *                     example: TRK123456789
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-17T10:00:00Z
 *       500:
 *         description: Internal server error
 */
router.get("/", getDeliveries); // ดึงข้อมูลการจัดส่ง

/**
 * @swagger
 * /delivery:
 *   put:
 *     summary: Update delivery information
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: D001
 *               status:
 *                 type: string
 *                 example: In Transit
 *               trackingNumber:
 *                 type: string
 *                 example: TRK987654321
 *     responses:
 *       200:
 *         description: Delivery information updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Delivery record not found
 *       500:
 *         description: Internal server error
 */
router.put("/", updateDelivery); // อัปเดตข้อมูลการจัดส่ง

module.exports = router;