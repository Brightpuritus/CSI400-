"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useData } from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, TrendingDown, AlertTriangle, ShoppingCart, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { products, purchaseOrders, withdrawalOrders, notifications } = useData()

  // Calculate statistics
  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0)
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock)

  const pendingPurchaseOrders = purchaseOrders.filter((o) => o.status === "pending").length
  const confirmedPurchaseOrders = purchaseOrders.filter((o) => o.status === "confirmed").length
  const totalWithdrawals = withdrawalOrders.length

  // Calculate expiring products
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const expiringProducts = products.filter((p) => {
    const expiryDate = new Date(p.expiryDate)
    return expiryDate <= thirtyDaysFromNow && expiryDate > today
  })
  const expiredProducts = products.filter((p) => new Date(p.expiryDate) <= today)

  // Category breakdown
  const categoryStats = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = { count: 0, stock: 0, value: 0 }
    }
    acc[product.category].count++
    acc[product.category].stock += product.stock
    acc[product.category].value += product.stock * product.price
    return acc
  }, {})

  // Top products by stock value
  const topProducts = [...products]
    .map((p) => ({
      ...p,
      totalValue: p.stock * p.price,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
          <p className="text-muted-foreground mt-1">ภาพรวมของระบบจัดการคลังสินค้า</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">สินค้าทั้งหมด</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">รายการสินค้า</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">สต็อกรวม</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">ชิ้น</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">มูลค่าสต็อก</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">บาท</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">การแจ้งเตือน</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{notifications.length}</div>
              <p className="text-xs text-muted-foreground mt-1">รายการ</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                สินค้าหมดอายุ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{expiredProducts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">รายการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                ใกล้หมดอายุ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{expiringProducts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">รายการ (30 วัน)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-warning" />
                สต็อกต่ำ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{lowStockProducts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">รายการ</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                ใบสั่งซื้อรอยืนยัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingPurchaseOrders}</div>
              <p className="text-sm text-muted-foreground mt-1">รายการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-green-500" />
                ใบสั่งซื้อยืนยันแล้ว
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{confirmedPurchaseOrders}</div>
              <p className="text-sm text-muted-foreground mt-1">รายการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                ใบเบิกสินค้า
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalWithdrawals}</div>
              <p className="text-sm text-muted-foreground mt-1">รายการทั้งหมด</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>สรุปตามหมวดหมู่</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">
                      {stats.count} รายการ • {stats.stock} ชิ้น
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(stats.value / totalValue) * 100} className="flex-1" />
                    <span className="text-sm font-medium w-24 text-right">{stats.value.toLocaleString()} บาท</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>สินค้ามูลค่าสูงสุด</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.stock} ชิ้น × {product.price} บาท
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{product.totalValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">บาท</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Products */}
        {lowStockProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                สินค้าที่ต้องสั่งซื้อเพิ่ม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        เหลือ {product.stock} / {product.minStock} ชิ้น
                      </p>
                    </div>
                    <Badge variant="warning">ต่ำ</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
