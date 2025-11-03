const { readJSON, writeJSON } = require("../utils/fileUtils")
const productsPath = path.join(__dirname, "../data/products.json");

const getProduction = (req, res) => {
  const production = readJSON("production.json")
  res.json(production)
}

const updateProduction = (req, res) => {
  const production = readJSON("production.json")
  const { id, status } = req.body
  const index = production.findIndex((p) => p.id === id)

  if (index === -1) {
    return res.status(404).json({ error: "Production not found" })
  }

  production[index].status = status
  writeJSON("production.json", production)
  res.json(production[index])
}

module.exports = { getProduction, updateProduction }