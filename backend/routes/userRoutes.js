const express = require("express")
const { getUsers, updateUserRole, deleteUser } = require("../controller/userController")
const router = express.Router()

router.get("/", getUsers)
router.put("/update-role", updateUserRole);
router.delete("/delete/:email", deleteUser);

module.exports = router