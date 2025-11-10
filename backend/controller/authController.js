const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../utils/db"); // ใช้ MySQL connection pool

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // ใช้จาก .env

// ฟังก์ชัน Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    // ค้นหาผู้ใช้ในฐานข้อมูล
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const stored = String(user.password || "");

    // ตรวจสอบรหัสผ่าน
    const ok = await bcrypt.compare(password, stored);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // สร้าง JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    // ลบรหัสผ่านออกจากผลลัพธ์ก่อนส่งกลับ
    const { password: _, ...safe } = user;
    return res.json({ user: safe, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ฟังก์ชัน Register
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });

    // ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือไม่
    const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length > 0) return res.status(409).json({ error: "Email already exists" });

    // แฮชรหัสผ่าน
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // เพิ่มผู้ใช้ใหม่ในฐานข้อมูล
    const [result] = await pool.query(
      "INSERT INTO users (email, password, name, role, createdAt) VALUES (?, ?, ?, ?, NOW())",
      [email, hashed, name, "customer"]
    );

    const newUser = {
      id: result.insertId,
      email,
      name,
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    // สร้าง JWT Token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { login, register };