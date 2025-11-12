"use client";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDataStore } from "../context/DataStore";
import { Plus, Package, Calendar, DollarSign } from "lucide-react";
import "./CustomerOrders.css";
import { useState } from "react";

function CustomerOrders() {
  const { user } = useAuth();
  const { orders, updatePaymentStatus } = useDataStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);

  // ช่วยแปลง path ที่เก็บใน DB เป็น URL เต็ม (หรือใช้ blob: ได้เลย)
  const toFullUrl = (u) => {
    if (!u) return null;
    return u.startsWith("http") || u.startsWith("blob:") ? u : `http://localhost:5000${u}`;
  };

  // เปิดหลักฐานในแท็บใหม่ (รองรับ blob: และ relative path)
  const openProof = (rawUrl) => {
    if (!rawUrl) {
      alert("ไม่มีหลักฐานการโอนในระบบ");
      return;
    }
    const url = toFullUrl(rawUrl);
    try {
      // พยายามเปิดหน้าต่างใหม่ก่อน (user-initiated click => ไม่ถูกบล็อกโดยปกติ)
      const win = window.open();
      if (win) {
        // กำหนด location ของหน้าต่างที่สร้างขึ้น
        win.opener = null;
        win.location = url;
        return;
      }
      // fallback: สร้าง <a> ชั่วคราว แล้วคลิก
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("openProof error:", err);
      alert("ไม่สามารถเปิดหลักฐานได้ — ลองคลิกขวาแล้วเปิดในแท็บใหม่");
    }
  };

  // เปิด "ใบเสร็จ" ที่สวยขึ้นและพิมพ์ได้
  const openReceipt = (order) => {
    if (!order) return alert("ไม่พบข้อมูลคำสั่งซื้อ");

    const total = Number(order.totalWithVat || 0);
    const deposit = Number(order.depositAmount ?? total * 0.3);
    const vat = Number(order.vat ?? 0);
    const items = order.items || [];

    const rowsHtml = items
      .map((it, i) => {
        const qty = Number(it.quantity || 0);
        const price = Number(it.price || 0);
        const line = qty * price;
        return `<tr>
          <td class="c-index">${i + 1}</td>
          <td class="c-name">${it.productName || "-"}</td>
          <td class="c-qty">${qty}</td>
          <td class="c-price">฿${price.toLocaleString()}</td>
          <td class="c-line">฿${line.toLocaleString()}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>ใบเสร็จคำสั่งซื้อ #${order.id}</title>
        <style>
          :root{
            --bg:#f6f8fb; --card:#ffffff; --muted:#6b7280; --accent:#0b66f0;
            --text:#0f172a; --panel:#f8fafc;
          }
          body{font-family: Inter, Roboto, Arial, sans-serif; margin:24px; color:var(--text); background:var(--bg);}
          .wrap{max-width:900px;margin:0 auto;background:var(--card);padding:24px;border-radius:12px;box-shadow:0 10px 30px rgba(15,23,42,0.06);}
          header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px}
          .shop{font-weight:700;font-size:18px}
          .meta{color:var(--muted);font-size:13px}
          table{width:100%;border-collapse:collapse;margin-top:12px}
          thead th{background:var(--panel);padding:10px;border-bottom:1px solid #eef2f7;text-align:left;font-size:13px}
          tbody td{padding:10px;border-bottom:1px solid #f3f6f9;font-size:13px;vertical-align:middle}
          .c-index{width:40px;text-align:center;color:var(--muted)}
          .c-qty{width:80px;text-align:center}
          .c-price,.c-line{text-align:right;width:120px}
          .totals{margin-top:12px;display:flex;justify-content:flex-end}
          .totals .box{min-width:320px;padding:14px;border-radius:10px;background:#fbfdff;border:1px solid #eef2f7}
          .totals .row{display:flex;justify-content:space-between;margin-bottom:8px;color:var(--muted)}
          .totals .row strong{color:var(--text)}
          .status{margin-top:12px;color:var(--muted);font-size:13px}
          .print-btn{
            position:fixed;right:22px;top:22px;background:linear-gradient(90deg,var(--accent),#1e90ff);color:#fff;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;box-shadow:0 10px 30px rgba(11,102,240,0.12);font-weight:700;
          }
          .note{margin-top:18px;color:var(--muted);font-size:13px}
          @media print{
            .print-btn{display:none}
            body{background:#fff}
            .wrap{box-shadow:none;border:none;margin:0;padding:0}
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">พิมพ์</button>
        <div class="wrap">
          <header>
            <div>
              <div class="shop">ใบเสร็จการสั่งซื้อ — ร้านของคุณ</div>
              <div class="meta">เลขที่คำสั่งซื้อ: <strong>#${order.id}</strong></div>
              <div class="meta">วันที่: ${order.createdAt || "-"}</div>
            </div>
            <div style="text-align:right">
              <div><strong>ชื่อลูกค้า</strong></div>
              <div class="meta">${order.customerName || "-"}</div>
              <div style="height:8px"></div>
              <div><strong>ที่อยู่จัดส่ง</strong></div>
              <div class="meta">${order.deliveryAddress || "-"}</div>
            </div>
          </header>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>สินค้า</th>
                <th>จำนวน</th>
                <th>ราคาต่อหน่วย</th>
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="box">
              <div class="row"><span>รวมย่อย</span><strong>฿${(total - vat).toLocaleString()}</strong></div>
              <div class="row"><span>VAT</span><strong>฿${vat.toLocaleString()}</strong></div>
              <div class="row"><span>ยอดรวม</span><strong>฿${total.toLocaleString()}</strong></div>
              <div class="row"><span>มัดจำ</span><strong>฿${deposit.toLocaleString()}</strong></div>
              <div class="row" style="font-size:16px"><span>ยอดที่ต้องชำระ</span><strong>฿${Math.max(0, total - deposit).toLocaleString()}</strong></div>
            </div>
          </div>

          <div class="status">สถานะการชำระ: <strong>${order.paymentStatus || "-"}</strong></div>
          <div class="note">หมายเหตุ: เก็บใบเสร็จฉบับนี้ไว้เป็นหลักฐานการสั่งซื้อ หากต้องการข้อมูลเพิ่มเติม ติดต่อฝ่ายบริการลูกค้า</div>
        </div>

        <script>
          // พยายามโฟกัสแล้วเรียก print (จะไม่บังคับถ้าเบราว์เซอร์บล็อก)
          try {
            window.focus();
            // เปิด dialog อัตโนมัติ (บางเบราว์เซอร์อาจบล็อก)
            // setTimeout(() => window.print(), 300);
          } catch(e){}
        </script>
      </body>
      </html>
    `;

    try {
      const win = window.open("", "_blank");
      if (!win) return alert("เบราว์เซอร์บล็อกการเปิดหน้าใหม่ ลองคลิกขวา → เปิดในแท็บใหม่");
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (err) {
      console.error("openReceipt error:", err);
      alert("ไม่สามารถเปิดใบเสร็จได้ ลองรีเฟรชหน้าแล้วลองใหม่");
    }
  };

  const userOrders =
    user.role === "admin"
      ? orders
      : orders.filter((order) => order.customerId === user.id);

  const getStatusColor = (status) => {
    const colors = {
      รอดำเนินการ: "status-pending",
      กำลังผลิต: "status-production",
      พร้อมจัดส่ง: "status-ready",
      จัดส่งแล้ว: "status-delivered",
      เสร็จสิ้น: "status-completed",
    };
    return colors[status] || "status-pending";
  };

  const handlePayment = (order) => {
    const proof = paymentProof ? URL.createObjectURL(paymentProof) : null;
    updatePaymentStatus(order.id, order.paymentStatus, proof); // บันทึกหลักฐานโดยไม่เปลี่ยนสถานะ
    setSelectedOrder(null);
    setPaymentProof(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">คำสั่งซื้อของฉัน</h1>
          <p className="page-subtitle">ติดตามและจัดการคำสั่งซื้อของคุณ</p>
        </div>
        <Link to="/customer/orders/new" className="btn btn-primary">
          <Plus size={20} />
          สั่งซื้อสินค้าใหม่
        </Link>
      </div>

      {userOrders?.length > 0 ? (
        <div className="orders-grid">
          {userOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3 className="order-id">คำสั่งซื้อ #{order.id}</h3>
                  <span
                    className={`status-badge ${getStatusColor(order.status)}`}
                  >
                    {order.deliveryStatus ? order.deliveryStatus : order.productionStatus}
                  </span>
                </div>
              </div>

              <div className="order-details">
                <div className="order-detail-item">
                  <Calendar size={16} />
                  <span>
                  <span>สั่งซื้อเมื่อ: {order.createdAt || "-"}</span>
                  </span>
                </div>
                <div className="order-detail-item">
                  <span>เบอร์ลูกค้า: {order.customerPhone || "-"}</span>
                </div>
                <div className="order-detail-item">
                  <span>เบอร์บริษัท: {order.companyPhone || "02-000-0000"}</span>
                </div>
                <div className="order-detail-item">
                  <Package size={16} />
                  <span>{order.items?.length || 0} รายการ</span>
                </div>
                <div className="order-detail-item">
                  <DollarSign size={16} />
                  <span>฿{order.totalWithVat.toLocaleString()}</span>
                </div>
                <div className="order-detail-item">
                  <DollarSign size={16} />
                  <span>
                    มัดจำ 30%: ฿
                    {(
                      order.depositAmount ?? order.totalWithVat * 0.3
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* แสดงยอดคงเหลือที่ต้องชำระ */}
              {(() => {
                const total = order.totalWithVat || 0;
                const deposit = order.depositAmount ?? total * 0.3;
                const remaining = Math.max(0, total - deposit);

                if (order.paymentStatus === "ชำระมัดจำแล้ว") {
                  return (
                    <div
                      className="payment-summary"
                      style={{
                        marginTop: 10,
                        padding: "10px 12px",
                        border: "1px solid #eee",
                        borderRadius: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>ยอดคงเหลือที่ต้องชำระ</span>
                        <strong>฿{remaining.toLocaleString()}</strong>
                      </div>

                      {order.productionStatus === "พร้อมจัดส่ง" && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "6px 10px",
                            background: "#fff4e5",
                            border: "1px solid #ffd6a5",
                            borderRadius: 6,
                            color: "#8a5a00",
                          }}
                        >
                          ออเดอร์ของคุณพร้อมจัดส่งแล้ว
                          กรุณาชำระยอดคงเหลือเพื่อดำเนินการจัดส่ง
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div className="order-items">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>
                      {item.productName}
                    </span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {order.deliveryStatus && (
                <div className="delivery-info">
                  <div className="delivery-status">
                    สถานะการจัดส่ง: <strong>{order.deliveryStatus}</strong>
                  </div>
                  {order.trackingNumber && (
                    <div className="tracking-number">
                      เลขพัสดุ: <strong>{order.trackingNumber}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="payment-actions">
                {/* แสดงปุ่มอัปโหลดจนกว่า paymentStatus จะเป็น "ชำระทั้งหมดแล้ว" */}
                {order.paymentStatus !== "ชำระทั้งหมดแล้ว" ? (
                  <>
                    <button
                      onClick={() =>
                        setSelectedOrder({
                          ...order,
                          targetStatus:
                            order.paymentStatus === "ชำระมัดจำแล้ว"
                              ? "ชำระทั้งหมดแล้ว"
                              : "ชำระมัดจำแล้ว",
                        })
                      }
                    >
                      {order.paymentStatus === "ชำระมัดจำแล้ว"
                        ? "อัปโหลดหลักฐานชำระ “ยอดที่เหลือ”"
                        : "อัปโหลดหลักฐานการโอนเงิน (มัดจำ 30%) / อัปโหลดใหม่"}
                    </button>

                    {order.paymentProof && (
                      <button
                        onClick={() => openProof(order.paymentProof)}
                        style={{
                          marginLeft: 12,
                          background: "none",
                          border: "none",
                          color: "#0b66f0",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        ดูหลักฐานการโอน
                      </button>
                    )}

                    {/* ปุ่มดูใบเสร็จ (สร้างจากข้อมูลคำสั่งซื้อในฝั่ง client) */}
                    <button
                      onClick={() => openReceipt(order)}
                      style={{
                        marginLeft: 12,
                        background: "none",
                        border: "none",
                        color: "#0b66f0",
                        textDecoration: "underline",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      ดูใบเสร็จ
                    </button>
                  </>
                ) : (
                  order.paymentProof && (
                    <button
                      onClick={() => openProof(order.paymentProof)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0b66f0",
                        textDecoration: "underline",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      ดูหลักฐานการโอน (ชำระเต็มแล้ว)
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Package size={64} />
          <h3>ยังไม่มีคำสั่งซื้อ</h3>
          <p>เริ่มสั่งซื้อสินค้าของคุณวันนี้</p>
          <Link to="/customer/orders/new" className="btn btn-primary">
            สั่งซื้อเลย
          </Link>
        </div>
      )}

      {selectedOrder && (
        <div className="modal">
          <h3>อัปโหลดหลักฐานการโอนเงิน</h3>
          <input
            type="file"
            onChange={(e) => setPaymentProof(e.target.files[0])}
          />
          <button
            onClick={() =>
              handlePayment(
                selectedOrder,
                selectedOrder.targetStatus || selectedOrder.paymentStatus
              )
            }
          >
            อัปโหลด
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomerOrders;
