"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Package, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react"
import "./Login.css"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("customer")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (register(email, password, name, role)) {
      setSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } else {
      setError("อีเมลนี้ถูกใช้งานแล้ว")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Package className="auth-icon" />
          <h1 className="auth-title">ลงทะเบียน</h1>
          <p className="auth-subtitle">สร้างบัญชีใหม่</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <CheckCircle size={16} />
              <span>ลงทะเบียนสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User size={16} />
              ชื่อ-นามสกุล
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="ชื่อของคุณ"
              required
            />
          </div>

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
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              <User size={16} />
              ประเภทผู้ใช้
            </label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="form-input" required>
              <option value="customer">ลูกค้า</option>
              <option value="employee">พนักงาน</option>
              <option value="manager">ผู้จัดการ</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            ลงทะเบียน
          </button>
        </form>

        <div className="auth-footer">
          <span>มีบัญชีอยู่แล้ว?</span>
          <Link to="/login" className="auth-link">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
