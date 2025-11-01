const { readJSON } = require("../utils/fileUtils")

const getUsers = (req, res) => {
  const users = readJSON("users.json")
  res.json(users)
}

module.exports = { getUsers }