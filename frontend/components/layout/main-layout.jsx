"use client"

import { Sidebar } from "./sidebar"
import { ProtectedRoute } from "@/components/protected-route"

export function MainLayout({ children, requiredRole = "staff" }) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <main className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
