"use client"

import { useAuth } from "../contexts/auth-context"
import { useInventory } from "../contexts/inventory-context"
import { usePurchaseOrders } from "../contexts/purchase-order-context"
import { useWithdrawalOrders } from "../contexts/withdrawal-order-context"
import { LayoutDashboard, Package, ShoppingCart, FileText, Bell, LogOut, Menu } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import styles from "./app-layout.module.css"

export function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const { products, getLowStockProducts, getExpiringProducts } = useInventory()
  const { purchaseOrders } = usePurchaseOrders()
  const { withdrawalOrders } = useWithdrawalOrders()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const lowStockProducts = getLowStockProducts()
  const expiringProducts = getExpiringProducts(30)
  const expiredProducts = products.filter((p) => new Date(p.expirationDate) < new Date())
  const pendingPurchaseOrders = purchaseOrders.filter((o) => o.status === "pending")
  const pendingWithdrawalOrders = withdrawalOrders.filter((o) => o.status === "pending")

  const notificationCount =
    expiredProducts.length +
    expiringProducts.length +
    lowStockProducts.length +
    pendingPurchaseOrders.length +
    pendingWithdrawalOrders.length

  const navigation = [
    { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
    { name: "คลังสินค้า", href: "/inventory", icon: Package },
    { name: "ใบสั่งซื้อ", href: "/purchase-orders", icon: ShoppingCart },
    { name: "ใบเบิกสินค้า", href: "/withdrawal-orders", icon: FileText },
    { name: "การแจ้งเตือน", href: "/notifications", icon: Bell, badge: notificationCount },
  ]

  return (
    <div className={styles.container}>
      {/* Mobile menu button */}
      <div className={styles.mobileMenuButton}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--background)",
          }}
        >
          <Menu style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <h1 className={styles.sidebarTitle}>ระบบจัดการคลังสินค้า</h1>
            <p className={styles.sidebarSubtitle}>
              {user?.name} ({user?.role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"})
            </p>
          </div>

          <nav className={styles.nav}>
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navText}>{item.name}</span>
                  {item.badge > 0 && <span className={styles.badge}>{item.badge}</span>}
                </Link>
              )
            })}
          </nav>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutButton} onClick={logout}>
              <LogOut style={{ width: "1.25rem", height: "1.25rem" }} />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.mainContent}>{children}</div>
      </main>
    </div>
  )
}
