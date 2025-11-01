const { readJSON, writeJSON } = require("../utils/fileUtils")

const getOrders = (req, res) => {
  const orders = readJSON("orders.json")
  res.json(orders)
}

const addOrder = (req, res) => {
  const orders = readJSON("orders.json")
  const newOrder = {
    id: Date.now().toString(),
    productionStatus: "รอเริ่มผลิต", // เพิ่มสถานะเริ่มต้น
    ...req.body,
  }
  orders.push(newOrder)
  writeJSON("orders.json", orders)
  res.status(201).json(newOrder)
}

const updateOrder = (req, res) => {
  const orders = readJSON("orders.json")
  const { id } = req.params
  const { productionStatus } = req.body

  const index = orders.findIndex((order) => order.id === id)
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" })
  }

  orders[index].productionStatus = productionStatus
  writeJSON("orders.json", orders)
  res.json(orders[index])
}

module.exports = { getOrders, addOrder, updateOrder }