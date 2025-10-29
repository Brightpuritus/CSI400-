"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext(undefined)

const MOCK_USERS = [
  { id: "1", username: "admin", password: "admin123", name: "ผู้ดูแลระบบ", role: "admin" },
  { id: "2", username: "staff", password: "staff123", name: "พนักงาน", role: "staff" },
  { id: "3", username: "manager", password: "manager123", name: "ผู้จัดการ", role: "manager" },
  { id: "4", username: "branch", password: "branch123", name: "ผู้จัดการสาขา", role: "branch" },
]

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const isAuthenticated = !!user

  const login = async (username, password) => {
    // simulate API delay
    await new Promise((r) => setTimeout(r, 200))

    const found = MOCK_USERS.find((u) => u.username === username && u.password === password)
    if (!found) return false

    const { password: _, ...u } = found
    setUser(u)
    localStorage.setItem("user", JSON.stringify(u))

    // navigate based on role; use navigate then fallback to window location
    const go = (path) => {
      try {
        navigate(path, { replace: true })
      } catch {
        window.location.href = path
      }
    }

    if (u.role === "staff") go("/inventory")
    else if (u.role === "branch") go("/withdrawal-orders")
    else go("/dashboard") // admin, manager

    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    try {
      navigate("/login", { replace: true })
    } catch {
      window.location.href = "/login"
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
