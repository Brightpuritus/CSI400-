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

  console.log("==== updateDelivery called ====");
  console.log("Request body:", req.body);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // เช็คถ้า deliveryStatus เป็น "จัดส่งสำเร็จ" เปลี่ยน order status เป็น "เสร็จสิ้น"
    let newOrderStatus = deliveryStatus === "จัดส่งสำเร็จ" ? "เสร็จสิ้น" : null;

    // Update orders
    let updateQuery = "UPDATE orders SET trackingNumber = ?, deliveryStatus = ?, updatedAt = NOW()";
    const queryParams = [trackingNumber, deliveryStatus];

    if (newOrderStatus) {
      updateQuery += ", status = ?";
      queryParams.push(newOrderStatus);
    }

    updateQuery += " WHERE id = ?";
    queryParams.push(id);

    const [result] = await conn.query(updateQuery, queryParams);
    console.log("Update orders result:", result);

    if (result.affectedRows === 0) {
      await conn.rollback();
      console.log("Order not found, rollback");
      return res.status(404).json({ error: "Order not found" });
    }

    // ดึง order หลังอัปเดต
    const [[updatedOrder]] = await conn.query("SELECT * FROM orders WHERE id = ?", [id]);

    // ดึง items
    const [orderItems] = await conn.query(
      "SELECT productId, quantity, productName, price FROM order_items WHERE orderId = ?",
      [id]
    );

    // ลด stock ถ้า deliveryStatus = "กำลังจัดส่ง"
    if (deliveryStatus === "กำลังจัดส่ง") {
      console.log("Delivery status is 'กำลังจัดส่ง', decreasing stock...");
      for (const item of orderItems) {
        const { productId, quantity } = item;

        const [rows] = await conn.query("SELECT stock FROM products WHERE id = ?", [productId]);
        if (!rows.length) throw new Error(`Product ${productId} not found`);

        const currentStock = rows[0].stock;
        const newStock = currentStock - quantity;

        console.log(`Product ${productId}: stock ${currentStock} -> ${newStock}`);
        if (newStock < 0) throw new Error(`สต๊อกสินค้า ${productId} ไม่พอ`);

        await conn.query("UPDATE products SET stock = ? WHERE id = ?", [newStock, productId]);
      }
      console.log("All stock updated successfully");
    }

    await conn.commit();
    console.log("Transaction committed");

    // ส่ง response: order + items
    res.json({ ...updatedOrder, items: orderItems });
  } catch (err) {
    await conn.rollback();
    console.error("Error updating delivery info, rollback:", err);
    res.status(500).json({ error: "Failed to update delivery info", message: err.message });
  } finally {
    conn.release();
    console.log("Connection released");
  }
};

module.exports = { getDeliveries, updateDelivery };