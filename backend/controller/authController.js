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

const register = (req, res) => {
  const { email, password, name, role } = req.body
  const users = readJSON("users.json")

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "Email already exists" })
  }

  const newUser = { id: Date.now().toString(), email, password, name, role }
  users.push(newUser)
  writeJSON("users.json", users)

  res.status(201).json(newUser)
}

module.exports = { login, register }