import { Routes, Route } from "react-router-dom"
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

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <PurchaseOrderProvider>
          <WithdrawalOrderProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="/withdrawal-orders" element={<WithdrawalOrdersPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Routes>
            <Toaster />
          </WithdrawalOrderProvider>
        </PurchaseOrderProvider>
      </InventoryProvider>
    </AuthProvider>
  )
}

export default App
