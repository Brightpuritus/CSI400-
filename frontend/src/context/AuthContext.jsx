"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        } else {
          console.error("Failed to fetch users")
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }
    fetchUsers()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) return false
      const data = await response.json().catch(() => ({}))
      // backend returns { user: {...} } — handle both shapes
      const authUser = data.user || data
      setUser(authUser)
      return true
    } catch (err) {
      console.error("Auth login error:", err)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, setUser, users, setUsers, login, logout }), [user, users, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
