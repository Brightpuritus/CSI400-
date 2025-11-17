"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { User, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"
import "./Login.css"

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    if (!name.trim() || !email.trim() || !password) {
      setError("กรุณากรอกข้อมูลให้ครบ")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 201) {
        setSuccess(true)
        setTimeout(() => navigate("/login"), 1400)
      } else {
        setError(data.error || "สมัครไม่สำเร็จ")
      }
    } catch (err) {
      console.error("Register fetch error:", err)
      setError("เกิดข้อผิดพลาดติดต่อเซิร์ฟเวอร์")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">ลงทะเบียน</h1>
        <p className="auth-subtitle">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>

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

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? "กำลังสมัคร..." : "ลงทะเบียน"}
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
