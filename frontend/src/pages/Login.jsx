"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Package, Mail, Lock, AlertCircle } from "lucide-react"
import "./Login.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (login(email, password)) {
      navigate("/")
    } else {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    }
  }

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail)
    setPassword("123456")
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Package className="auth-icon" />
          <h1 className="auth-title">เข้าสู่ระบบ</h1>
          <p className="auth-subtitle">ระบบจัดการโรงงานปลากระป๋อง</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

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

        <div className="auth-divider">
          <span>หรือทดลองใช้งานด้วย</span>
        </div>

        <div className="demo-accounts">
          <button type="button" onClick={() => handleDemoLogin("customer@test.com")} className="demo-button">
            <div className="demo-role">ลูกค้า</div>
            <div className="demo-email">customer@test.com</div>
          </button>
          <button type="button" onClick={() => handleDemoLogin("employee@test.com")} className="demo-button">
            <div className="demo-role">พนักงาน</div>
            <div className="demo-email">employee@test.com</div>
          </button>
          <button type="button" onClick={() => handleDemoLogin("manager@test.com")} className="demo-button">
            <div className="demo-role">ผู้จัดการ</div>
            <div className="demo-email">manager@test.com</div>
          </button>
          <button type="button" onClick={() => handleDemoLogin("admin@test.com")} className="demo-button">
            <div className="demo-role">ผู้ดูแลระบบ</div>
            <div className="demo-email">admin@test.com</div>
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
