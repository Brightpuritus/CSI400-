"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
    } else if (allowedRoles && !allowedRoles.includes(user?.role)) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, user, allowedRoles, navigate])

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return null
  }

  return children
}
