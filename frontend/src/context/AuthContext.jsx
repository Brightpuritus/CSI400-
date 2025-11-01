"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

const mockUsers = [
  { id: 1, email: "customer@test.com", password: "123456", name: "ลูกค้าทดสอบ", role: "customer" },
  { id: 2, email: "employee@test.com", password: "123456", name: "พนักงานทดสอบ", role: "employee" },
  { id: 3, email: "manager@test.com", password: "123456", name: "ผู้จัดการทดสอบ", role: "manager" },
  { id: 4, email: "admin@test.com", password: "123456", name: "ผู้ดูแลระบบ", role: "admin" },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState(mockUsers)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedUsers = localStorage.getItem("users")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    }
  }, [])

  const login = (email, password) => {
    const foundUser = users.find((u) => u.email === email && u.password === password)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const register = (email, password, name, role) => {
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return false
    }

    const newUser = {
      id: users.length + 1,
      email,
      password,
      name,
      role,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, users, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
