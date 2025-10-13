"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { Package } from "lucide-react"
import styles from "./LoginPage.module.css"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        navigate("/dashboard")
      } else {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconContainer}>
            <Package className={styles.icon} />
          </div>
          <div>
            <h1 className={styles.title}>ระบบจัดการคลังสินค้า</h1>
            <p className={styles.description}>เข้าสู่ระบบเพื่อจัดการคลังสินค้าของคุณ</p>
          </div>
        </div>
        <div className={styles.cardContent}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.alert}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                ชื่อผู้ใช้
              </label>
              <input
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            <div className={styles.testInfo}>
              <p>ทดสอบระบบ:</p>
              <p>Admin: admin / admin123</p>
              <p>Staff: staff / staff123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
