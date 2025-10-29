"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"

export function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user } = useAuth()

  // not logged in -> login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // role-based access: if roles provided and user.role not included -> redirect home
  if (roles.length > 0 && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
