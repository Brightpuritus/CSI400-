"use client"

import { useState } from "react"
import { useDataStore } from "../context/DataStore"
import { Truck, Package, CheckCircle, X } from "lucide-react"
import "./Delivery.css"

function Delivery() {
  const { orders, updateDeliveryInfo } = useDataStore()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [deliveryStatus, setDeliveryStatus] = useState("กำลังจัดส่ง")

  const deliveryOrders = {
    ready: orders.filter((o) => o.productionStatus === "พร้อมจัดส่ง" && !o.deliveryStatus),
    shipping: orders.filter((o) => o.deliveryStatus === "กำลังจัดส่ง"),
    delivered: orders.filter((o) => o.deliveryStatus === "จัดส่งสำเร็จ"),
  }

  const handleUpdateDelivery = () => {
    if (!trackingNumber) {
      alert("กรุณากรอกเลขพัสดุ")
      return
    }

    updateDeliveryInfo(selectedOrder.id, trackingNumber, deliveryStatus)
    setSelectedOrder(null)
    setTrackingNumber("")
    setDeliveryStatus("กำลังจัดส่ง")
  }

  const openDialog = (order) => {
    setSelectedOrder(order)
    setTrackingNumber(order.trackingNumber || "")
    setDeliveryStatus(order.deliveryStatus || "กำลังจัดส่ง")
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">จัดส่งสินค้า</h1>
          <p className="page-subtitle">จัดการการจัดส่งและติดตามพัสดุ</p>
        </div>
      </div>

      <div className="delivery-sections">
        <div className="delivery-section">
          <h2 className="section-title">
            <Package size={20} />
            พร้อมจัดส่ง ({deliveryOrders.ready.length})
          </h2>
          {deliveryOrders.ready.length === 0 ? (
            <div className="empty-state-small">ไม่มีคำสั่งซื้อที่พร้อมจัดส่ง</div>
          ) : (
            <div className="delivery-cards">
              {deliveryOrders.ready.map((order) => (
                <div key={order.id} className="delivery-card">
                  <div className="delivery-card-header">
                    <span className="order-id">คำสั่งซื้อ #{order.id}</span>
                    <span className="customer-name">{order.customerName}</span>
                  </div>
                  <div className="delivery-card-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="item-row">
                        {item.productName} x{item.quantity}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => openDialog(order)} className="btn btn-primary btn-sm btn-full">
                    <Truck size={16} />
                    เริ่มจัดส่ง
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="delivery-section">
          <h2 className="section-title">
            <Truck size={20} />
            กำลังจัดส่ง ({deliveryOrders.shipping.length})
          </h2>
          {deliveryOrders.shipping.length === 0 ? (
            <div className="empty-state-small">ไม่มีคำสั่งซื้อที่กำลังจัดส่ง</div>
          ) : (
            <div className="delivery-cards">
              {deliveryOrders.shipping.map((order) => (
                <div key={order.id} className="delivery-card">
                  <div className="delivery-card-header">
                    <span className="order-id">คำสั่งซื้อ #{order.id}</span>
                    <span className="customer-name">{order.customerName}</span>
                  </div>
                  <div className="tracking-info">
                    <strong>เลขพัสดุ:</strong> {order.trackingNumber}
                  </div>
                  <button onClick={() => openDialog(order)} className="btn btn-secondary btn-sm btn-full">
                    อัปเดตสถานะ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="delivery-section">
          <h2 className="section-title">
            <CheckCircle size={20} />
            จัดส่งสำเร็จ ({deliveryOrders.delivered.length})
          </h2>
          {deliveryOrders.delivered.length === 0 ? (
            <div className="empty-state-small">ยังไม่มีคำสั่งซื้อที่จัดส่งสำเร็จ</div>
          ) : (
            <div className="delivery-cards">
              {deliveryOrders.delivered.map((order) => (
                <div key={order.id} className="delivery-card delivery-card-success">
                  <div className="delivery-card-header">
                    <span className="order-id">คำสั่งซื้อ #{order.id}</span>
                    <span className="customer-name">{order.customerName}</span>
                  </div>
                  <div className="tracking-info">
                    <strong>เลขพัสดุ:</strong> {order.trackingNumber}
                  </div>
                  <div className="success-badge">
                    <CheckCircle size={16} />
                    จัดส่งสำเร็จ
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>อัปเดตข้อมูลการจัดส่ง</h3>
              <button onClick={() => setSelectedOrder(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">เลขพัสดุ</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="form-input"
                  placeholder="EX1234567890TH"
                />
              </div>
              <div className="form-group">
                <label className="form-label">สถานะการจัดส่ง</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="form-input"
                >
                  <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                  <option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary">
                ยกเลิก
              </button>
              <button onClick={handleUpdateDelivery} className="btn btn-primary">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Delivery
