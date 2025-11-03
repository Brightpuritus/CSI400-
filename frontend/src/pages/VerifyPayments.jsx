"use client"

import { useDataStore } from "../context/DataStore"
import "./VerifyPayments.css"

function VerifyPayments() {
  const { orders, confirmPayment } = useDataStore()

  // ✅ รวมออเดอร์ที่ยังไม่ได้จ่ายหรือจ่ายมัดจำแล้ว
  const pendingOrders = orders.filter((order) =>
    ["ยังไม่ได้ชำระเงิน", "ชำระมัดจำแล้ว"].includes(order.paymentStatus)
  )

  const handleConfirm = (orderId, paymentStatus) => {
    confirmPayment(orderId, paymentStatus)
  }

  return (
    <div className="page-container">
      <h1>ยืนยันการชำระเงิน</h1>

      {pendingOrders.length === 0 ? (
        <p>ไม่มีคำสั่งซื้อที่รอการยืนยัน</p>
      ) : (
        <div className="orders-grid">
          {pendingOrders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>คำสั่งซื้อ #{order.id}</h3>
              <p>สถานะ: {order.paymentStatus}</p>

              {/* ✅ แสดงยอดรวมและยอดมัดจำ */}
              <p>ยอดรวมทั้งหมด: ฿{order.totalWithVat.toLocaleString()}</p>
              <p>ยอดมัดจำ 30%: ฿{(order.depositAmount ?? order.totalWithVat * 0.3).toLocaleString()}</p>

              {order.paymentProof && (
                <a href={order.paymentProof} target="_blank" rel="noopener noreferrer">
                  ดูหลักฐานการโอน
                </a>
              )}

              <div className="actions">
                {/* ✅ ถ้ายังไม่ได้จ่าย แสดงปุ่มมัดจำ */}
                {order.paymentStatus === "ยังไม่ได้ชำระเงิน" && (
                  <button
                    onClick={() => handleConfirm(order.id, "ชำระมัดจำแล้ว")}
                  >
                    ยืนยันชำระมัดจำ
                  </button>
                )}

                {/* ✅ ถ้ามัดจำแล้ว แสดงปุ่มยืนยันจ่ายเต็ม */}
                {order.paymentStatus === "ชำระมัดจำแล้ว" && (
                  <button
                    onClick={() => handleConfirm(order.id, "ชำระทั้งหมดแล้ว")}
                  >
                    ยืนยันชำระทั้งหมด
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VerifyPayments
