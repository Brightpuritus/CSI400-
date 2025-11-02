"use client"

import { useDataStore } from "../context/DataStore"
import "./VerifyPayments.css"

function VerifyPayments() {
  const { orders, confirmPayment } = useDataStore()

  // กรองคำสั่งซื้อที่ยังไม่ได้ชำระเงิน
  const unverifiedOrders = orders.filter((order) => order.paymentStatus === "ยังไม่ได้ชำระเงิน")

  const handleConfirm = (orderId, paymentStatus) => {
    confirmPayment(orderId, paymentStatus)
  }

  return (
    <div className="page-container">
      <h1>ยืนยันการชำระเงิน</h1>
      {unverifiedOrders.length === 0 ? (
        <p>ไม่มีคำสั่งซื้อที่รอการยืนยัน</p>
      ) : (
        <div className="orders-grid">
          {unverifiedOrders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>คำสั่งซื้อ #{order.id}</h3>
              <p>สถานะ: {order.paymentStatus}</p>
              {order.paymentProof && (
                <a href={order.paymentProof} target="_blank" rel="noopener noreferrer">
                  ดูหลักฐานการโอน
                </a>
              )}
              <div className="actions">
                <button onClick={() => handleConfirm(order.id, "ชำระมัดจำแล้ว")}>ยืนยันชำระมัดจำ</button>
                <button onClick={() => handleConfirm(order.id, "ชำระทั้งหมดแล้ว")}>ยืนยันชำระทั้งหมด</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VerifyPayments