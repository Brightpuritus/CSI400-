import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "./components/protected-route"
import { AuthProvider } from "./contexts/auth-context"
import { InventoryProvider } from "./contexts/inventory-context"
import { PurchaseOrderProvider } from "./contexts/purchase-order-context"
import { WithdrawalOrderProvider } from "./contexts/withdrawal-order-context"
import { Toaster } from "./components/ui/toaster"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import InventoryPage from "./pages/InventoryPage"
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage"
import WithdrawalOrdersPage from "./pages/WithdrawalOrdersPage"
import NotificationsPage from "./pages/NotificationsPage"
import HomePage from "./pages/HomePage"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./contexts/auth-context"

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return
    if (user?.role === "staff") navigate("/inventory", { replace: true })
    else if (user?.role === "branch") navigate("/withdrawal-orders", { replace: true })
    else navigate("/dashboard", { replace: true }) // admin, manager
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated) return <HomePage />
  return null
}

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <PurchaseOrderProvider>
          <WithdrawalOrderProvider>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Dashboard -> admin, manager */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Inventory -> admin, staff, manager, branch */}
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute roles={["admin", "staff", "manager", "branch"]}>
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Purchase Orders -> admin, staff */}
              <Route
                path="/purchase-orders"
                element={
                  <ProtectedRoute roles={["admin", "staff"]}>
                    <PurchaseOrdersPage />
                  </ProtectedRoute>
                }
              />

              {/* Withdrawal Orders -> admin, branch */}
              <Route
                path="/withdrawal-orders"
                element={
                  <ProtectedRoute roles={["admin", "branch"]}>
                    <WithdrawalOrdersPage />
                  </ProtectedRoute>
                }
              />

              {/* Notifications -> admin, staff, manager */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute roles={["admin", "staff", "manager"]}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </WithdrawalOrderProvider>
        </PurchaseOrderProvider>
      </InventoryProvider>
    </AuthProvider>
  )
}

export default App
