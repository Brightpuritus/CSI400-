const bcrypt = require("bcryptjs")
const { readJSON, writeJSON } = require("../utils/fileUtils")

const USERS_FILE = "users.json"
const SALT_ROUNDS = 10

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" })

    const users = Array.isArray(readJSON(USERS_FILE)) ? readJSON(USERS_FILE) : []
    const user = users.find((u) => u && String(u.email).toLowerCase() === String(email).toLowerCase())
    if (!user) return res.status(401).json({ error: "Invalid credentials" })

    const stored = String(user.password || "")

    // if stored password looks like a bcrypt hash -> compare with bcrypt
    if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
      const ok = await bcrypt.compare(password, stored)
      if (!ok) return res.status(401).json({ error: "Invalid credentials" })
    } else {
      // legacy plain-text password: allow login and migrate to hashed password
      if (stored !== password) return res.status(401).json({ error: "Invalid credentials" })
      try {
        user.password = await bcrypt.hash(password, SALT_ROUNDS)
        writeJSON(USERS_FILE, users)
      } catch (e) {
        console.warn("Failed to migrate user password to hash:", e)
      }
    }

    const { password: _, ...safe } = user
    return res.json({ user: safe })
  } catch (err) {
    console.error("Login error:", err)
    return res.status(500).json({ error: "Server error" })
  }
}

// แก้เฉพาะ register ให้บังคับ role เป็น "customer" แล้วเขียนลงไฟล์ users.json
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body || {}
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" })

    const users = Array.isArray(readJSON(USERS_FILE)) ? readJSON(USERS_FILE) : []
    const exists = users.find((u) => u && String(u.email).toLowerCase() === String(email).toLowerCase())
    if (exists) return res.status(409).json({ error: "Email already exists" })

    const hashed = await bcrypt.hash(password, SALT_ROUNDS)

    const newUser = {
      id: `${Date.now()}`,
      email,
      password: hashed,
      name,
      role: "customer",
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    writeJSON(USERS_FILE, users)

    const { password: _, ...safe } = newUser
    return res.status(201).json({ user: safe })
  } catch (err) {
    console.error("Register error:", err)
    return res.status(500).json({ error: "Server error" })
  }
}

module.exports = { login, register }