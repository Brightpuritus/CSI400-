"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useDataStore } from "../context/DataStore"
import { useNavigate } from "react-router-dom"
import "./Dashboard.css"

export default function Dashboard() {
  const { user } = useAuth()
  const { orders } = useDataStore()
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState("all")

  useEffect(() => {
    if (!user || (user.role !== "manager" && user.role !== "admin")) {
      navigate("/login")
    }
  }, [user, navigate])

  if (!user) return null

  const completedOrders = orders.filter((o) => o.deliveryStatus === "จัดส่งสำเร็จ")

  const totalSales = completedOrders.reduce((sum, order) => sum + parseFloat(order.totalWithVat || 0), 0);
  const totalVAT = completedOrders.reduce((sum, order) => sum + parseFloat(order.vat || 0), 0);
  const totalRevenue = totalSales - totalVAT;
  const totalOrders = completedOrders.length

  console.log("Total Sales:", totalSales);
  console.log("Total VAT:", totalVAT);
  console.log("Total Revenue:", totalRevenue);

  // Filter by date range
  const filterOrdersByDate = (orders) => {
    const now = new Date()
    return orders.filter((order) => {
      const orderDate = new Date(order.orderDate)
      switch (dateRange) {
        case "today":
          return orderDate.toDateString() === now.toDateString()
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return orderDate >= weekAgo
        case "month":
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })
  }

  const filteredOrders = filterOrdersByDate(completedOrders)

  // Product sales data
  const productSales = {}
  filteredOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      if (!productSales[item.productName]) {
        productSales[item.productName] = { quantity: 0, revenue: 0 }
      }
      productSales[item.productName].quantity += item.quantity
      productSales[item.productName].revenue += item.price * item.quantity
    })
  })
  

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["วันที่", "เลขที่ออเดอร์", "ลูกค้า", "ยอดรวม", "VAT 7%", "สุทธิ", "สถานะ"]
    const rows = filteredOrders.map((order) => [
      new Date(order.orderDate).toLocaleDateString("th-TH"),
      order.id,
      order.customerName,
      order.total.toFixed(2),
      (order.total * 0.07).toFixed(2),
      (order.total * 0.93).toFixed(2),
      order.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>รายงานยอดขายและภาษี</h1>
          <p>สรุปข้อมูลการขายและคำนวณภาษีมูลค่าเพิ่ม</p>
        </div>
        <div className="dashboard-actions">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="date-select">
            <option value="all">ทั้งหมด</option>
            <option value="today">วันนี้</option>
            <option value="week">7 วันที่ผ่านมา</option>
            <option value="month">เดือนนี้</option>
          </select>
          <button onClick={exportToCSV} className="export-btn">
            ส่งออก CSV
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-sales">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">ยอดขายรวม</div>
            <div className="stat-value">฿{totalSales.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="stat-card stat-vat">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">VAT 7%</div>
            <div className="stat-value">฿{totalVAT.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="stat-card stat-revenue">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <div className="stat-label">รายได้สุทธิ</div>
            <div className="stat-value">฿{totalRevenue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="stat-card stat-orders">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">จำนวนออเดอร์</div>
            <div className="stat-value">{totalOrders}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <h2>ยอดขายตามสินค้า</h2>
          <div className="product-sales-list">
            {Object.entries(productSales).length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>ยังไม่มีข้อมูลยอดขาย</div>
            ) : (
              Object.entries(productSales).map(([name, data]) => (
                <div key={name} className="product-sale-item">
                  <div className="product-info">
                    <div className="product-name">{name}</div>
                    <div className="product-quantity">{data.quantity} กระป๋อง</div>
                  </div>
                  <div className="product-revenue">
                    ฿{data.revenue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chart-card">
          <h2>สถานะออเดอร์</h2>
          <div className="status-stats">
            <div className="status-item">
              <div className="status-label">รอดำเนินการ</div>
              <div className="status-value">{orders.filter((o) => o.status === "รอดำเนินการ").length}</div>
            </div>
            <div className="status-item">
              <div className="status-label">กำลังผลิต</div>
              <div className="status-value">{orders.filter((o) => o.productionStatus === "กำลังผลิต").length}</div>
            </div>
            <div className="status-item">
              <div className="status-label">พร้อมจัดส่ง</div>
              <div className="status-value">{orders.filter((o) => o.productionStatus === "พร้อมจัดส่ง").length}</div>
            </div>
            <div className="status-item">
              <div className="status-label">กำลังจัดส่ง</div>
              <div className="status-value">{orders.filter((o) => o.deliveryStatus === "กำลังจัดส่ง").length}</div>
            </div>
            <div className="status-item">
              <div className="status-label">เสร็จสิ้น</div>
              <div className="status-value">{orders.filter((o) => o.status === "เสร็จสิ้น").length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="orders-table-card">
        <h2>รายละเอียดออเดอร์</h2>
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>เลขที่ออเดอร์</th>
                <th>ลูกค้า</th>
                <th>ยอดรวม</th>
                <th>VAT 7%</th>
                <th>สุทธิ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                    ยังไม่มีออเดอร์ที่เสร็จสิ้น
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const vat = order.vat || 0;
                  const net = order.totalWithVat || 0;
                  return (
                    <tr key={order.id}>
                      <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString("th-TH") : "N/A"}</td>
                      <td>{order.id || "N/A"}</td>
                      <td>{order.customerName || "N/A"}</td>
                      <td>฿{order.subtotal ? order.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "0.00"}</td>
                      <td>฿{vat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                      <td>฿{net.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span className="status-badge status-completed">{order.status || "N/A"}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
