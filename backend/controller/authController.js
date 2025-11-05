const { readJSON, writeJSON } = require("../utils/fileUtils")

const login = (req, res) => {
  const { email, password } = req.body
  const users = readJSON("users.json")
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" })
  }

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
}

// แก้เฉพาะ register ให้บังคับ role เป็น "customer" แล้วเขียนลงไฟล์ users.json
const register = (req, res) => {
  try {
    const { email, password, name } = req.body || {}
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" })

    // readJSON expected to return array (utils/fileUtils in project)
    const users = Array.isArray(readJSON("users.json")) ? readJSON("users.json") : []

    const exists = users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase())
    if (exists) return res.status(409).json({ error: "Email already exists" })

    const newUser = {
      id: `${Date.now()}`,
      email,
      password, // kept as plain to match project pattern
      name,
      role: "customer", // <-- ensure role is customer
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    writeJSON("users.json", users)

    const { password: _, ...safe } = newUser
    return res.status(201).json({ user: safe })
  } catch (err) {
    console.error("Register error:", err)
    return res.status(500).json({ error: "Server error" })
  }
}

module.exports = { login, register }