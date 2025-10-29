"use client"

import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Box, ShoppingCart, FileText, Bell, User, LogOut, Menu } from "lucide-react"

import { useAuth } from "../contexts/auth-context"
import { useInventory } from "../contexts/inventory-context"
import { usePurchaseOrders } from "../contexts/purchase-order-context"

import styles from "./app-layout.module.css"

export function AppLayout({ children }) {
  const { user, logout } = useAuth()
  // initialize other contexts so they load data
  useInventory()
  usePurchaseOrders()

  const [open, setOpen] = useState(false) // for mobile drawer / manual open
  const [expanded, setExpanded] = useState(false) // hover expansion state for desktop
  const role = user?.role
  const location = useLocation()

  const navLinks = [
    { to: "/dashboard", label: "แดชบอร์ด", roles: ["admin", "manager"], icon: <Home /> },
    { to: "/inventory", label: "คลังสินค้า", roles: ["admin", "staff", "manager", "branch"], icon: <Box /> },
    { to: "/purchase-orders", label: "ใบสั่งซื้อ", roles: ["admin", "staff"], icon: <ShoppingCart /> },
    { to: "/withdrawal-orders", label: "ใบเบิก", roles: ["admin", "branch"], icon: <FileText /> },
    { to: "/notifications", label: "การแจ้งเตือน", roles: ["admin", "staff", "manager"], icon: <Bell /> },
  ]

  const visibleLinks = navLinks.filter(l => l.roles.includes(role))

  return (
    <div className={styles.container}>
      {/* mobile menu button */}
      <button
        className={styles.mobileButton}
        onClick={() => setOpen(true)}
        aria-label="เปิดเมนู"
      >
        <Menu />
      </button>

      {/* sidebar */}
      <aside
        className={`${styles.sidebar} ${open ? styles.open : ""} ${expanded ? styles.expanded : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className={styles.sidebarInner}>
          <div className={styles.sidebarHeader}>
            <div className={styles.brandDot}></div>
            <div className={styles.brandText}>
              <div className={styles.brandName}>Warehouse</div>
              <div className={styles.brandSub}>Management</div>
            </div>
          </div>

          <nav className={styles.nav}>
            {visibleLinks.map(link => {
              const active = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${styles.navLink} ${active ? styles.active : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <div className={styles.iconWrap}>
                    <div className={styles.iconBg}>{link.icon}</div>
                  </div>

                  <div className={styles.textWrap}>
                    <div className={styles.linkLabel}>{link.label}</div>
                    {/* small description image-like line */}
                    <div className={styles.linkSub}>ไปที่ {link.label}</div>
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className={styles.sidebarFooter}>
            {user ? (
              <div className={styles.userRow}>
                <div className={styles.avatar}><User /></div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userRole}>{user.role}</div>
                </div>

                <button className={styles.logoutBtn} onClick={logout} title="ออกจากระบบ">
                  <LogOut />
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.loginLink}>เข้าสู่ระบบ</Link>
            )}
          </div>
        </div>
      </aside>

      {/* overlay for mobile */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      {/* main content */}
      <main className={styles.main}>
        {/* remount page container on path change to trigger CSS animation */}
        <div key={location.pathname} className={styles.page}>
          <div className={styles.mainContent}>{children}</div>
        </div>
      </main>
    </div>
  )
}
  
export default AppLayout
