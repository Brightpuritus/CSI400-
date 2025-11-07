const pool = require("../utils/db"); // ใช้ MySQL connection pool

// GET /api/users -> ดึงข้อมูลผู้ใช้ทั้งหมด
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, email, name, role, createdAt FROM users ORDER BY id ASC");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// PUT /api/users/role -> อัปเดตบทบาทของผู้ใช้
const updateUserRole = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const [result] = await pool.query("UPDATE users SET role = ? WHERE email = ?", [role, email]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [[updatedUser]] = await pool.query("SELECT id, email, name, role, createdAt FROM users WHERE email = ?", [
      email,
    ]);
    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

// DELETE /api/users/:email -> ลบผู้ใช้
const deleteUser = async (req, res) => {
  const { email } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM users WHERE email = ?", [email]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser };