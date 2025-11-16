const express = require("express");
const { getUsers, updateUserRole, deleteUser } = require("../controller/userController");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: U001
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     example: johndoe@example.com
 *                   role:
 *                     type: string
 *                     example: admin
 */
router.get("/", getUsers);

/**
 * @swagger
 * /users/update-role:
 *   put:
 *     summary: Update user role
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               role:
 *                 type: string
 *                 example: manager
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       404:
 *         description: User not found
 */
router.put("/update-role", updateUserRole);

/**
 * @swagger
 * /users/delete/{email}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/delete/:email", deleteUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile (protected route)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is a protected route
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: U001
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     role:
 *                       type: string
 *                       example: admin
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

module.exports = router;