"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useDataStore } from "../context/DataStore"
import { Plus, Package, Calendar, DollarSign } from "lucide-react"
import "./CustomerOrders.css"

function CustomerOrders() {
  const { user } = useAuth()
  const { orders } = useDataStore()

  const userOrders = user.role === "admin" ? orders : orders.filter((order) => order.customerId === user.id)

  const getStatusColor = (status) => {
    const colors = {
      รอดำเนินการ: "status-pending",
      กำลังผลิต: "status-production",
      พร้อมจัดส่ง: "status-ready",
      จัดส่งแล้ว: "status-delivered",
      เสร็จสิ้น: "status-completed",
    }
    return colors[status] || "status-pending"
  }

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

      {userOrders.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>ยังไม่มีคำสั่งซื้อ</h3>
          <p>เริ่มสั่งซื้อสินค้าของคุณวันนี้</p>
          <Link to="/customer/orders/new" className="btn btn-primary">
            สั่งซื้อเลย
          </Link>
        </div>
      ) : (
        <div className="orders-grid">
          {userOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3 className="order-id">คำสั่งซื้อ #{order.id}</h3>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span>
                </div>
              </div>

              <div className="order-details">
                <div className="order-detail-item">
                  <Calendar size={16} />
                  <span>{new Date(order.orderDate).toLocaleDateString("th-TH")}</span>
                </div>
                <div className="order-detail-item">
                  <Package size={16} />
                  <span>{order.items.length} รายการ</span>
                </div>
                <div className="order-detail-item">
                  <DollarSign size={16} />
                  <span>฿{order.totalWithVat.toLocaleString()}</span>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>
                      {item.productName} ({item.size})
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomerOrders
