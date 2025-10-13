import { ProtectedRoute } from "../components/protected-route"
import { AppLayout } from "../components/app-layout"
import { useInventory } from "../contexts/inventory-context"
import { usePurchaseOrders } from "../contexts/purchase-order-context"
import { useWithdrawalOrders } from "../contexts/withdrawal-order-context"
import { Package, DollarSign, AlertTriangle, ShoppingCart, FileText, Calendar } from "lucide-react"
import styles from "./DashboardPage.module.css"

export default function DashboardPage() {
  const { products, getLowStockProducts, getExpiringProducts } = useInventory()
  const { purchaseOrders } = usePurchaseOrders()
  const { withdrawalOrders } = useWithdrawalOrders()

  // Calculate statistics
  const totalProducts = products.length
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const totalStockQuantity = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowStockCount = getLowStockProducts().length
  const expiringCount = getExpiringProducts(30).length

  const pendingPurchaseOrders = purchaseOrders.filter((o) => o.status === "pending")
  const confirmedPurchaseOrders = purchaseOrders.filter((o) => o.status === "confirmed")
  const totalPurchaseValue = purchaseOrders
    .filter((o) => o.status === "confirmed")
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const pendingWithdrawalOrders = withdrawalOrders.filter((o) => o.status === "pending")
  const confirmedWithdrawalOrders = withdrawalOrders.filter((o) => o.status === "confirmed")

  // Recent activity
  const recentPurchaseOrders = purchaseOrders.slice(0, 5)
  const recentWithdrawalOrders = withdrawalOrders.slice(0, 5)

  // Category statistics
  const categoryStats = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = { count: 0, value: 0 }
    }
    acc[product.category].count += product.quantity
    acc[product.category].value += product.price * product.quantity
    return acc
  }, {})

  const topCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 5)

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>แดชบอร์ด</h1>
            <p>ภาพรวมระบบจัดการคลังสินค้า</p>
          </div>

          {/* Key Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>มูลค่าสต็อกทั้งหมด</span>
                <DollarSign className={styles.metricIcon} />
              </div>
              <div className={styles.metricValue}>฿{totalStockValue.toLocaleString()}</div>
              <p className={styles.metricDescription}>{totalProducts} รายการสินค้า</p>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>จำนวนสินค้าในสต็อก</span>
                <Package className={styles.metricIcon} />
              </div>
              <div className={styles.metricValue}>{totalStockQuantity.toLocaleString()}</div>
              <p className={styles.metricDescription}>หน่วย</p>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>สินค้าใกล้หมด</span>
                <AlertTriangle className={styles.metricIcon} style={{ color: "var(--orange)" }} />
              </div>
              <div className={styles.metricValue}>{lowStockCount}</div>
              <p className={styles.metricDescription}>รายการ</p>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>ใกล้หมดอายุ</span>
                <Calendar className={styles.metricIcon} style={{ color: "var(--destructive)" }} />
              </div>
              <div className={styles.metricValue}>{expiringCount}</div>
              <p className={styles.metricDescription}>รายการ (30 วัน)</p>
            </div>
          </div>

          {/* Orders Overview */}
          <div className={styles.ordersGrid}>
            <div className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <ShoppingCart />
                ใบสั่งซื้อ
              </div>
              <div className={styles.orderContent}>
                <div className={styles.orderRow}>
                  <span className={styles.orderLabel}>รอดำเนินการ</span>
                  <span className={`${styles.badge} ${styles.badgeSecondary}`}>{pendingPurchaseOrders.length}</span>
                </div>
                <div className={styles.orderRow}>
                  <span className={styles.orderLabel}>ยืนยันแล้ว</span>
                  <span className={`${styles.badge} ${styles.badgeDefault}`}>{confirmedPurchaseOrders.length}</span>
                </div>
                <div className={styles.orderRow}>
                  <span className={styles.orderLabel}>มูลค่ารวม</span>
                  <span className={styles.orderValue}>฿{totalPurchaseValue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <FileText />
                ใบเบิกสินค้า
              </div>
              <div className={styles.orderContent}>
                <div className={styles.orderRow}>
                  <span className={styles.orderLabel}>รอดำเนินการ</span>
                  <span className={`${styles.badge} ${styles.badgeSecondary}`}>{pendingWithdrawalOrders.length}</span>
                </div>
                <div className={styles.orderRow}>
                  <span className={styles.orderLabel}>ยืนยันแล้ว</span>
                  <span className={`${styles.badge} ${styles.badgeDefault}`}>{confirmedWithdrawalOrders.length}</span>
                </div>
                <div className={styles.orderRow}>
                  <span className={styles.orderLabel}>ทั้งหมด</span>
                  <span className={styles.orderValue}>{withdrawalOrders.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className={styles.categoryCard}>
            <div className={styles.categoryHeader}>สินค้าแยกตามหมวดหมู่</div>
            <div className={styles.categoryList}>
              {topCategories.map(([category, stats]) => {
                const percentage = (stats.value / totalStockValue) * 100
                return (
                  <div key={category} className={styles.categoryItem}>
                    <div className={styles.categoryInfo}>
                      <span className={styles.categoryName}>{category}</span>
                      <span className={styles.categoryStats}>
                        {stats.count} หน่วย • ฿{stats.value.toLocaleString()}
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.activityGrid}>
            <div className={styles.activityCard}>
              <div className={styles.activityHeader}>ใบสั่งซื้อล่าสุด</div>
              <div className={styles.activityList}>
                {recentPurchaseOrders.length === 0 ? (
                  <p className={styles.emptyState}>ยังไม่มีใบสั่งซื้อ</p>
                ) : (
                  recentPurchaseOrders.map((order) => (
                    <div key={order.id} className={styles.activityItem}>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityTitle}>{order.orderNumber}</p>
                        <p className={styles.activitySubtitle}>{order.supplier}</p>
                      </div>
                      <span
                        className={`${styles.badge} ${
                          order.status === "confirmed"
                            ? styles.badgeDefault
                            : order.status === "pending"
                              ? styles.badgeSecondary
                              : styles.badgeDestructive
                        }`}
                      >
                        {order.status === "confirmed" ? "ยืนยันแล้ว" : order.status === "pending" ? "รอดำเนินการ" : "ยกเลิก"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={styles.activityCard}>
              <div className={styles.activityHeader}>ใบเบิกสินค้าล่าสุด</div>
              <div className={styles.activityList}>
                {recentWithdrawalOrders.length === 0 ? (
                  <p className={styles.emptyState}>ยังไม่มีใบเบิกสินค้า</p>
                ) : (
                  recentWithdrawalOrders.map((order) => (
                    <div key={order.id} className={styles.activityItem}>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityTitle}>{order.orderNumber}</p>
                        <p className={styles.activitySubtitle}>{order.department}</p>
                      </div>
                      <span
                        className={`${styles.badge} ${
                          order.status === "confirmed"
                            ? styles.badgeDefault
                            : order.status === "pending"
                              ? styles.badgeSecondary
                              : styles.badgeDestructive
                        }`}
                      >
                        {order.status === "confirmed" ? "ยืนยันแล้ว" : order.status === "pending" ? "รอดำเนินการ" : "ยกเลิก"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
