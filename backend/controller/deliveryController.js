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

  if (!id || !deliveryStatus) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // อัปเดตสถานะการจัดส่งในตาราง `orders`
    const [result] = await conn.query(
      `UPDATE orders 
       SET trackingNumber = ?, deliveryStatus = ?, 
           status = CASE WHEN ? = 'จัดส่งสำเร็จ' THEN 'เสร็จสิ้น' ELSE status END,
           productionStatus = CASE WHEN ? = 'จัดส่งสำเร็จ' THEN NULL ELSE productionStatus END,
           updatedAt = NOW()
       WHERE id = ?`,
      [trackingNumber, deliveryStatus, deliveryStatus, deliveryStatus, id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    // ดึงข้อมูลคำสั่งซื้อที่อัปเดตแล้ว
    const [[updatedOrder]] = await conn.query("SELECT * FROM orders WHERE id = ?", [id]);

    await conn.commit();
    res.json(updatedOrder);
  } catch (err) {
    await conn.rollback();
    console.error("Error updating delivery:", err);
    res.status(500).json({ error: "Failed to update delivery" });
  } finally {
    conn.release();
  }
};

module.exports = { getDeliveries, updateDelivery };