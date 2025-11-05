const { readJSON } = require("../utils/fileUtils")
const fs = require("fs");
const path = require("path");
const usersPath = path.join(__dirname, "../data/users.json");

const getUsers = (req, res) => {
  const users = readJSON("users.json")
  res.json(users)
}

function updateUserRole(req, res) {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
  const userIndex = users.findIndex((u) => u.email === email);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[userIndex].role = role;

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json(users[userIndex]);
}

function deleteUser(req, res) {
  const { email } = req.params;

  const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
  const updatedUsers = users.filter((u) => u.email !== email);

  if (users.length === updatedUsers.length) {
    return res.status(404).json({ error: "User not found" });
  }

  fs.writeFileSync(usersPath, JSON.stringify(updatedUsers, null, 2));
  res.status(204).send();
}

module.exports = { getUsers, updateUserRole, deleteUser }