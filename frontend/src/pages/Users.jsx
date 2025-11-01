"use client"

import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import "./Users.css"

export default function Users() {
  const { user, users } = useAuth() // ดึง users จาก AuthContext
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || (user.role !== "manager" && user.role !== "admin")) {
      navigate("/login")
    }
  }, [user, navigate])

  if (!user) return null
  if (!users || users.length === 0) return <div>กำลังโหลดข้อมูลผู้ใช้...</div> // ตรวจสอบ users

  const roleGroups = {
    admin: {
      title: "ผู้ดูแลระบบ (Admin)",
      description: "มีสิทธิ์เข้าถึงและจัดการทุกส่วนของระบบ",
      color: "purple",
      users: users.filter((u) => u.role === "admin"),
    },
    manager: {
      title: "ผู้จัดการ (Manager)",
      description: "ดูรายงานยอดขาย, จัดการผู้ใช้งาน, คำนวณภาษี",
      color: "blue",
      users: users.filter((u) => u.role === "manager"),
    },
    employee: {
      title: "พนักงาน (Employee)",
      description: "วางแผนการผลิต, ติดตามสถานะ, จัดการจัดส่ง",
      color: "green",
      users: users.filter((u) => u.role === "employee"),
    },
    customer: {
      title: "ลูกค้า (Customer)",
      description: "สั่งซื้อสินค้า, ติดตามออเดอร์",
      color: "orange",
      users: users.filter((u) => u.role === "customer"),
    },
  }

  const permissions = {
    admin: ["เข้าถึงทุกฟีเจอร์ในระบบ", "จัดการผู้ใช้งานทุกระดับ", "ดูและแก้ไขข้อมูลทั้งหมด", "ตั้งค่าระบบ"],
    manager: ["ดูรายงานยอดขายและภาษี", "จัดการผู้ใช้งาน", "ส่งออกรายงาน", "ดูสถิติการผลิต"],
    employee: ["วางแผนการผลิต", "อัปเดตสถานะการผลิต", "จัดการการจัดส่ง", "ดูข้อมูลออเดอร์"],
    customer: ["สั่งซื้อสินค้า", "ดูประวัติการสั่งซื้อ", "ติดตามสถานะออเดอร์", "ดูข้อมูลสินค้า"],
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>จัดการผู้ใช้งาน</h1>
        <p>แสดงรายชื่อผู้ใช้งานและสิทธิ์การเข้าถึงระบบ</p>
      </div>

      <div className="role-groups">
        {Object.entries(roleGroups).map(([role, group]) => (
          <div key={role} className={`role-group role-${group.color}`}>
            <div className="role-header">
              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <div className="user-count">{group.users.length} คน</div>
            </div>

            <div className="permissions-section">
              <h3>สิทธิ์การใช้งาน:</h3>
              <ul className="permissions-list">
                {permissions[role].map((permission, index) => (
                  <li key={index}>
                    <span className="check-icon">✓</span>
                    {permission}
                  </li>
                ))}
              </ul>
            </div>

            <div className="users-list">
              {group.users.length > 0 ? (
                group.users.map((u) => (
                  <div key={u.email} className="user-card">
                    <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                      <div className="user-name">{u.name}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                    {u.email === user.email && <span className="current-user-badge">คุณ</span>}
                  </div>
                ))
              ) : (
                <div className="no-users">ไม่มีผู้ใช้งานในกลุ่มนี้</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
