const fs = require("fs")
const path = require("path")

// อ่านข้อมูลจากไฟล์ JSON
function readJSON(filePath) {
  const fullPath = path.join(__dirname, "../data", filePath)
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify([]))
  }
  const data = fs.readFileSync(fullPath, "utf8")
  return JSON.parse(data)
}

// เขียนข้อมูลลงในไฟล์ JSON
function writeJSON(filePath, data) {
  const fullPath = path.join(__dirname, "../data", filePath)
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8")
}

module.exports = { readJSON, writeJSON }