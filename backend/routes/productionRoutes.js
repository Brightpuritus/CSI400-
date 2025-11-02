const express = require("express")
const fs = require("fs")
const path = require("path")
const router = express.Router()

const DATA_FILE = path.join(__dirname, "..", "data", "production.json")

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))
  } catch (e) {
    return []
  }
}
function writeData(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf8")
}

// POST /api/production -> เพิ่มรายการไปยัง production.json
router.post("/", (req, res) => {
  try {
    const items = readData()
    const { imageUrl = "", name, price = 0, stock = 0 } = req.body
    if (!name) return res.status(400).json({ error: "Missing name" })

    const newItem = {
      id: `${Date.now()}`,
      imageUrl,
      name,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      createdAt: new Date().toISOString()
    }
    items.unshift(newItem)
    writeData(items)
    res.status(201).json(newItem)
  } catch (err) {
    console.error("Create production item error", err)
    res.status(500).json({ error: "Failed to create production item" })
  }
})

module.exports = router