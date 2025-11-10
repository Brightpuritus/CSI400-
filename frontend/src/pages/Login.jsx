"use client"

import { useState } from "react"
import { useNavigate, Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Mail, Lock, AlertCircle } from "lucide-react"
import "./Login.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { user, login } = useAuth() // เพิ่ม user เพื่อตรวจสอบสถานะการล็อกอิน
  const navigate = useNavigate()

  // หากผู้ใช้ล็อกอินแล้ว ให้เปลี่ยนเส้นทางไปหน้าแรก
  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password);
    if (success) {
      navigate("/");
    } else {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  }

  // ฟังก์ชันช่วยกรอกข้อมูลสำหรับแต่ละ role
  const handleAutoFill = (role) => {
    const testAccounts = {
      customer: { email: "customer@test.com", password: "123456" },
      employee: { email: "employee@test.com", password: "123456" },
      manager: { email: "manager@test.com", password: "123456" },
      admin: { email: "admin@test.com", password: "123456" },
    }

    const account = testAccounts[role]
    if (account) {
      setEmail(account.email)
      setPassword(account.password)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">เข้าสู่ระบบ</h1>
        <p className="auth-subtitle">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</p>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={16} />
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={16} />
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            เข้าสู่ระบบ
          </button>
        </form>

        {/* ปุ่มช่วยกรอกข้อมูลสำหรับแต่ละ role */}
        <div className="auto-fill-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleAutoFill("customer")}
          >
            กรอกข้อมูลลูกค้า
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleAutoFill("employee")}
          >
            กรอกข้อมูลพนักงาน
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleAutoFill("manager")}
          >
            กรอกข้อมูลผู้จัดการ
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleAutoFill("admin")}
          >
            กรอกข้อมูลผู้ดูแลระบบ
          </button>
        </div>

        <div className="auth-footer">
          <span>ยังไม่มีบัญชี?</span>
          <Link to="/register" className="auth-link">
            ลงทะเบียน
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
