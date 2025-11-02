"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Package, LogOut, ShoppingCart, Factory, Truck, BarChart3, Users, Box } from "lucide-react"
import "./Navbar.css"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const roleText = {
    customer: "ลูกค้า",
    employee: "พนักงาน",
    manager: "ผู้จัดการ",
    admin: "ผู้ดูแลระบบ",
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Package className="navbar-icon" />
          <span>โรงงานปลากระป๋อง</span>
        </Link>

        <div className="navbar-links">
          {(user.role === "customer" || user.role === "admin") && (
            <Link to="/customer/orders" className="navbar-link">
              <ShoppingCart size={18} />
              <span>คำสั่งซื้อของฉัน</span>
            </Link>
          )}

          {(user.role === "employee" || user.role === "admin") && (
            <>
              <Link to="/employee/production" className="navbar-link">
                <Factory size={18} />
                <span>การผลิต</span>
              </Link>
              <Link to="/employee/delivery" className="navbar-link">
                <Truck size={18} />
                <span>จัดส่งสินค้า</span>
              </Link>
              <Link to="/employee/verify-payments" className="navbar-link">
                <span>ยืนยันการชำระเงิน</span>
              </Link>
            </>
          )}

          {(user.role === "manager" || user.role === "admin") && (
            <>
              <Link to="/manager/dashboard" className="navbar-link">
                <BarChart3 size={18} />
                <span>รายงานยอดขาย</span>
              </Link>
              <Link to="/manager/stock" className="navbar-link">
                <Box size={18} />
                <span>สินค้าคงคลัง</span>
              </Link>
              <Link to="/manager/users" className="navbar-link">
                <Users size={18} />
                <span>จัดการผู้ใช้</span>
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{roleText[user.role]}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
