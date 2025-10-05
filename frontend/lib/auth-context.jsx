"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

// Mock users with different roles
const MOCK_USERS = [
  { id: 1, username: "admin", password: "admin123", role: "admin", name: "ผู้ดูแลระบบ" },
  { id: 2, username: "manager", password: "manager123", role: "manager", name: "ผู้จัดการคลัง" },
  { id: 3, username: "staff", password: "staff123", role: "staff", name: "พนักงานคลัง" },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("warehouse_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    const foundUser = MOCK_USERS.find((u) => u.username === username && u.password === password)

    if (foundUser) {
      const userWithoutPassword = { ...foundUser }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      localStorage.setItem("warehouse_user", JSON.stringify(userWithoutPassword))
      return { success: true }
    }

    return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("warehouse_user")
  }

  const hasPermission = (requiredRole) => {
    if (!user) return false
    const roleHierarchy = { admin: 3, manager: 2, staff: 1 }
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
  }

  return <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
