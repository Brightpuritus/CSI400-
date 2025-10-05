"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Package, ShoppingCart, FileText, Bell, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard, role: "staff" },
  { name: "สต็อกสินค้า", href: "/stock", icon: Package, role: "staff" },
  { name: "ใบสั่งซื้อ", href: "/purchase-orders", icon: ShoppingCart, role: "manager" },
  { name: "ใบเบิกสินค้า", href: "/withdrawal-orders", icon: FileText, role: "staff" },
  { name: "การแจ้งเตือน", href: "/notifications", icon: Bell, role: "staff", showBadge: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, hasPermission } = useAuth()
  const { notifications } = useData()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const filteredNavigation = navigation.filter((item) => hasPermission(item.role))

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-4 py-6 border-b border-border">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg">คลังสินค้า</h1>
          <p className="text-xs text-muted-foreground">{user?.name}</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const notificationCount = item.showBadge ? notifications.length : 0

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {notificationCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center px-1 text-xs">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={logout}>
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-background"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-background border-r border-border">
        <NavContent />
      </div>
    </>
  )
}
