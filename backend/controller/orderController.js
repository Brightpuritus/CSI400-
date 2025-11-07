const pool = require("../utils/db"); // ใช้ MySQL connection pool

// GET /api/orders -> ดึงข้อมูลคำสั่งซื้อทั้งหมด
const getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query("SELECT * FROM orders ORDER BY createdAt DESC");
    const [items] = await pool.query("SELECT * FROM order_items");

    // รวมรายการสินค้าเข้ากับคำสั่งซื้อ
    const result = orders.map((order) => ({
      ...order,
      items: items.filter((item) => item.orderId === order.id),
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// POST /api/orders -> สร้างคำสั่งซื้อใหม่
const addOrder = async (req, res) => {
  const {
    customerId,
    customerName,
    items = [],
    subtotal = 0,
    vat = 0,
    totalWithVat = 0,
    deliveryDate = null,
    deliveryAddress = null,
    productionStatus = "รอเริ่มผลิต",
    paymentStatus = "ยังไม่ได้ชำระเงิน",
    trackingNumber = null,
    deliveryStatus = null,
    status = "รอดำเนินการ",
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // เพิ่มคำสั่งซื้อใหม่ในตาราง `orders`
    const [orderResult] = await conn.query(
      `INSERT INTO orders 
        (customerId, customerName, subtotal, vat, totalWithVat, deliveryDate, deliveryAddress, 
         productionStatus, paymentStatus, trackingNumber, deliveryStatus, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        customerId,
        customerName,
        subtotal,
        vat,
        totalWithVat,
        deliveryDate,
        deliveryAddress,
        productionStatus,
        paymentStatus,
        trackingNumber,
        deliveryStatus,
        status,
      ]
    );

    const orderId = orderResult.insertId;

    // เพิ่มรายการสินค้าในตาราง `order_items`
    for (const item of items) {
      const { productId, productName, quantity, price } = item;
      await conn.query(
        `INSERT INTO order_items 
          (orderId, productId, productName, quantity, price, createdAt)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [orderId, productId, productName, quantity, price]
      );
    }

    await conn.commit();

    res.status(201).json({
      id: orderId,
      customerId,
      customerName,
      items,
      subtotal,
      vat,
      totalWithVat,
      deliveryDate,
      deliveryAddress,
      productionStatus,
      paymentStatus,
      trackingNumber,
      deliveryStatus,
      status,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    await conn.rollback();
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    conn.release();
  }
};

// PUT /api/orders/:id -> อัปเดตคำสั่งซื้อ
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const fields = [];
  const values = [];
  for (const key in updates) {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  }
  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [[updatedOrder]] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    res.json(updatedOrder);
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// PUT /api/orders/:id/payment -> อัปเดตสถานะการชำระเงิน
const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { paymentProof, paymentStatus } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE orders SET paymentProof = ?, paymentStatus = ? WHERE id = ?`,
      [paymentProof, paymentStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [[updatedOrder]] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    res.json(updatedOrder);
  } catch (err) {
    console.error("Update payment status error:", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
};

// PUT /api/orders/:id/confirm-payment -> ยืนยันการชำระเงิน
const confirmPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `UPDATE orders SET paymentStatus = 'ชำระทั้งหมดแล้ว' WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [[updatedOrder]] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    res.json(updatedOrder);
  } catch (err) {
    console.error("Confirm payment error:", err);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id, productionStatus } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE orders SET productionStatus = ?, deliveryStatus = CASE 
        WHEN ? = 'พร้อมจัดส่ง' THEN 'พร้อมจัดส่ง' 
        ELSE deliveryStatus END 
      WHERE id = ?`,
      [productionStatus, productionStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [[updatedOrder]] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

module.exports = { getOrders, addOrder, updateOrder, updatePaymentStatus, confirmPayment, updateOrderStatus };