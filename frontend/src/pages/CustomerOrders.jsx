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
                    {order.productionStatus}
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
