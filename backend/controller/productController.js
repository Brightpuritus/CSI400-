const { readJSON } = require("../utils/fileUtils")

const getProducts = (req, res) => {
  const products = readJSON("products.json")
  res.json(products)
}

module.exports = { getProducts }