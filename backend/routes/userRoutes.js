const express = require("express");
const { getUsers, updateUserRole, deleteUser } = require("../controller/userController");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", getUsers);
router.put("/update-role", updateUserRole);
router.delete("/delete/:email", deleteUser);

router.get("/profile", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

module.exports = router;