const pool = require("../utils/db"); // ใช้ MySQL connection pool

// GET /api/deliveries -> ดึงข้อมูลการจัดส่งทั้งหมด
const getDeliveries = async (req, res) => {
  try {
    // ดึงคำสั่งซื้อที่มีสถานะการจัดส่งจากฐานข้อมูล
    const [deliveries] = await pool.query(
      "SELECT * FROM orders WHERE deliveryStatus IS NOT NULL ORDER BY updatedAt DESC"
    );
    res.json(deliveries);
  } catch (err) {
    console.error("Error fetching deliveries:", err);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
};

// PUT /api/deliveries -> อัปเดตสถานะการจัดส่ง
const updateDelivery = async (req, res) => {
  const { id, trackingNumber, deliveryStatus } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE orders 
       SET trackingNumber = ?, deliveryStatus = ? 
       WHERE id = ?`,
      [trackingNumber, deliveryStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [[updatedOrder]] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating delivery info:", err);
    res.status(500).json({ error: "Failed to update delivery info" });
  }
};

module.exports = { getDeliveries, updateDelivery };