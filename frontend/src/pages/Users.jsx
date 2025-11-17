"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useDataStore } from "../context/DataStore"
import "./Users.css"

const API_URL = import.meta.env.VITE_API_URL;

export default function Users() {
  const { user, users, setUsers } = useAuth(); // เพิ่ม setUsers
  const navigate = useNavigate()
  const { updateUserRole, deleteUser } = useDataStore(); // ดึงฟังก์ชันจาก DataStore
  const [selectedUser, setSelectedUser] = useState(null); // เก็บข้อมูลผู้ใช้ที่เลือก
  const [showPopup, setShowPopup] = useState(false); // ควบคุมการแสดง popup
  const [roleGroups, setRoleGroups] = useState({});

  const openPopup = (user) => {
    setSelectedUser(user); // เก็บข้อมูลผู้ใช้ที่เลือก
    setShowPopup(true); // แสดง popup
  };

  const closePopup = () => {
    setSelectedUser(null); // ล้างข้อมูลผู้ใช้ที่เลือก
    setShowPopup(false); // ปิด popup
  };

  const handleChangeRole = async (user, newRole) => {
    await updateUserRole(user.email, newRole); // เรียกใช้ฟังก์ชันจาก DataStore หรือ AuthContext
    await fetchUsers(); // ดึงข้อมูลผู้ใช้ใหม่
    closePopup();
    console.log(`เปลี่ยน Role ของ ${user.name} เป็น ${newRole}`);
  };

  const handleDeleteUser = (user) => {
    deleteUser(user.email); // เรียกใช้ฟังก์ชันจาก DataStore หรือ AuthContext
    console.log(`ลบผู้ใช้: ${user.name}`);
    closePopup();
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`); // URL ของ API สำหรับดึงข้อมูลผู้ใช้
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data); // อัปเดต users state
      console.log("Fetched users:", data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== "manager" && user.role !== "admin")) {
      navigate("/login")
    }
  }, [user, navigate])

  useEffect(() => {
    fetchUsers(); // ดึงข้อมูลผู้ใช้เมื่อหน้าโหลด
  }, []);

  useEffect(() => {
    const updatedRoleGroups = {
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
    };

    setRoleGroups(updatedRoleGroups);
  }, [users]); // อัปเดต roleGroups เมื่อ users เปลี่ยน

  if (!user) return null
  if (!users || users.length === 0) return <div>กำลังโหลดข้อมูลผู้ใช้...</div> // ตรวจสอบ users

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
                  <div
                    key={u.email}
                    className="user-card"
                    onClick={() => openPopup(u)} // เรียก openPopup เมื่อกดที่ user
                  >
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

      {showPopup && selectedUser && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>จัดการผู้ใช้</h3>
              <button onClick={closePopup} className="popup-close">X</button>
            </div>
            <div className="popup-body">
              <p>ชื่อ: {selectedUser.name}</p>
              <p>อีเมล: {selectedUser.email}</p>
              <div className="form-group">
                <label>เปลี่ยน Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleChangeRole(selectedUser, e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            </div>
            <div className="popup-footer">
              <button onClick={() => handleDeleteUser(selectedUser)} className="btn btn-danger">
                ลบผู้ใช้
              </button>
              <button onClick={closePopup} className="btn btn-secondary">
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
