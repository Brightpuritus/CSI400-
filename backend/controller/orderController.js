const pool = require("../utils/db"); // ใช้ MySQL connection pool

// GET /api/orders -> ดึงข้อมูลคำสั่งซื้อทั้งหมด
const getOrders = async (req, res) => {
  try {
    // ดึงข้อมูลคำสั่งซื้อทั้งหมด
    const [orders] = await pool.query("SELECT * FROM orders");

    // ดึงข้อมูลรายการสินค้าในคำสั่งซื้อทั้งหมด
    const [items] = await pool.query("SELECT * FROM order_items");

    // รวมรายการสินค้าเข้ากับคำสั่งซื้อแต่ละรายการ
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: items.filter((item) => item.orderId === order.id), // รวมเฉพาะรายการสินค้าที่ตรงกับ orderId
    }));

    res.json(ordersWithItems);
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
    customerPhone = "", // <-- เพิ่มตรงนี้
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
        (customerId, customerName, customerPhone, subtotal, vat, totalWithVat, deliveryDate, deliveryAddress, 
         productionStatus, paymentStatus, trackingNumber, deliveryStatus, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        customerId,
        customerName,
        customerPhone, // <-- เพิ่มตรงนี้
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
      customerPhone, // ✅ เพิ่มตรงนี้
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
  const { paymentStatus } = req.body; // ✅ รับสถานะจากฝั่ง client

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ✅ อัปเดตสถานะการชำระเงินตามที่กดจริง
    const [result] = await conn.query(
      `UPDATE orders SET paymentStatus = ? WHERE id = ?`,
      [paymentStatus, id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    // ✅ ดึงข้อมูล order + items กลับไปให้ frontend
    const [[order]] = await conn.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    const [items] = await conn.query(`SELECT * FROM order_items WHERE orderId = ?`, [id]);
    order.items = items;

    await conn.commit();
    res.json(order);
  } catch (err) {
    await conn.rollback();
    console.error("Confirm payment error:", err);
    res.status(500).json({ error: "Failed to confirm payment" });
  } finally {
    conn.release();
  }
};




// PUT /api/orders/:id
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;             // <- ใช้ params แทน body
  const { productionStatus } = req.body; // <- productionStatus จาก body

  if (!productionStatus) {
    return res.status(400).json({ error: "Missing productionStatus" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // อัปเดต productionStatus + deliveryStatus
    const [updateResult] = await conn.query(
      `UPDATE orders
       SET productionStatus = ?,
           deliveryStatus = IF(? = 'พร้อมจัดส่ง', 'พร้อมจัดส่ง', deliveryStatus)
       WHERE id = ?`,
      [productionStatus, productionStatus, id]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    // ดึง order ล่าสุด
    const [[updatedOrder]] = await conn.query(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );

    // ลด stock ถ้า productionStatus = "พร้อมจัดส่ง"
    if (updatedOrder.productionStatus === "พร้อมจัดส่ง") {
      const [items] = await conn.query(
        "SELECT productId, quantity FROM order_items WHERE orderId = ?",
        [id]
      );

      for (const item of items) {
        if (item.productId && item.quantity > 0) {
          await conn.query(
            "UPDATE products SET stock = stock + ? WHERE id = ?",
            [item.quantity, item.productId]
          );
        }
      }
    }

    await conn.commit();
    res.json(updatedOrder);
  } catch (err) {
    await conn.rollback();
    console.error("Error updating order and stock:", err);
    res.status(500).json({ error: "Failed to update order and stock" });
  } finally {
    conn.release();
  }
};


module.exports = { getOrders, addOrder, updateOrder, updatePaymentStatus, confirmPayment, updateOrderStatus };