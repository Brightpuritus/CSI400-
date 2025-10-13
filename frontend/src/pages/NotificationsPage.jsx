import { ProtectedRoute } from "../components/protected-route"
import { AppLayout } from "../components/app-layout"
import { useInventory } from "../contexts/inventory-context"
import { usePurchaseOrders } from "../contexts/purchase-order-context"
import { useWithdrawalOrders } from "../contexts/withdrawal-order-context"
import { AlertCircle, AlertTriangle, Package, ShoppingCart, FileText, Calendar } from "lucide-react"
import { Link } from "react-router-dom"
import styles from "./NotificationsPage.module.css"

export default function NotificationsPage() {
  const { products, getLowStockProducts, getExpiringProducts } = useInventory()
  const { purchaseOrders } = usePurchaseOrders()
  const { withdrawalOrders } = useWithdrawalOrders()

  const lowStockProducts = getLowStockProducts()
  const expiringProducts = getExpiringProducts(30)
  const expiredProducts = products.filter((p) => new Date(p.expirationDate) < new Date())
  const pendingPurchaseOrders = purchaseOrders.filter((o) => o.status === "pending")
  const pendingWithdrawalOrders = withdrawalOrders.filter((o) => o.status === "pending")

  const totalNotifications =
    expiredProducts.length +
    expiringProducts.length +
    lowStockProducts.length +
    pendingPurchaseOrders.length +
    pendingWithdrawalOrders.length

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>การแจ้งเตือน</h1>
            <p>{totalNotifications > 0 ? `มี ${totalNotifications} รายการที่ต้องดำเนินการ` : "ไม่มีการแจ้งเตือน"}</p>
          </div>

          {totalNotifications === 0 ? (
            <div className={styles.card}>
              <div className={styles.emptyState}>
                <Package className={styles.emptyIcon} />
                <p className={styles.emptyText}>ไม่มีการแจ้งเตือนในขณะนี้</p>
              </div>
            </div>
          ) : (
            <div className={styles.container}>
              {expiredProducts.length > 0 && (
                <div className={`${styles.card} ${styles.cardDanger}`}>
                  <div className={styles.cardHeader}>
                    <h2 className={`${styles.cardTitle} ${styles.titleDanger}`}>
                      <AlertCircle size={20} />
                      สินค้าหมดอายุ ({expiredProducts.length})
                    </h2>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.notificationList}>
                      {expiredProducts.map((product) => (
                        <div key={product.id} className={styles.alert}>
                          <AlertCircle className={styles.alertIcon} />
                          <div className={styles.alertContent}>
                            <p className={styles.alertTitle}>{product.name}</p>
                            <p className={styles.alertDescription}>
                              หมดอายุเมื่อ: {new Date(product.expirationDate).toLocaleDateString("th-TH")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link to="/inventory">
                      <button className={`${styles.actionButton} ${styles.actionButtonDanger}`}>ไปที่คลังสินค้า</button>
                    </Link>
                  </div>
                </div>
              )}

              {expiringProducts.length > 0 && (
                <div className={`${styles.card} ${styles.cardWarning}`}>
                  <div className={styles.cardHeader}>
                    <h2 className={`${styles.cardTitle} ${styles.titleWarning}`}>
                      <Calendar size={20} />
                      สินค้าใกล้หมดอายุ ({expiringProducts.length})
                    </h2>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.notificationList}>
                      {expiringProducts.map((product) => {
                        const daysLeft = Math.ceil(
                          (new Date(product.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )
                        return (
                          <div key={product.id} className={styles.notificationItem}>
                            <div className={styles.notificationInfo}>
                              <p className={styles.notificationTitle}>{product.name}</p>
                              <p className={styles.notificationDescription}>
                                หมดอายุใน {daysLeft} วัน ({new Date(product.expirationDate).toLocaleDateString("th-TH")})
                              </p>
                            </div>
                            <span className={styles.badge}>{product.quantity} หน่วย</span>
                          </div>
                        )
                      })}
                    </div>
                    <Link to="/inventory">
                      <button className={`${styles.actionButton} ${styles.actionButtonOutline}`}>ไปที่คลังสินค้า</button>
                    </Link>
                  </div>
                </div>
              )}

              {lowStockProducts.length > 0 && (
                <div className={`${styles.card} ${styles.cardAlert}`}>
                  <div className={styles.cardHeader}>
                    <h2 className={`${styles.cardTitle} ${styles.titleAlert}`}>
                      <AlertTriangle size={20} />
                      สินค้าใกล้หมด ({lowStockProducts.length})
                    </h2>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.notificationList}>
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className={styles.notificationItem}>
                          <div className={styles.notificationInfo}>
                            <p className={styles.notificationTitle}>{product.name}</p>
                            <p className={styles.notificationDescription}>
                              เหลือ {product.quantity} หน่วย (ขั้นต่ำ {product.minStockLevel} หน่วย)
                            </p>
                          </div>
                          <span className={styles.badge}>{product.category}</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/purchase-orders">
                      <button className={`${styles.actionButton} ${styles.actionButtonOutline}`}>สร้างใบสั่งซื้อ</button>
                    </Link>
                  </div>
                </div>
              )}

              {pendingPurchaseOrders.length > 0 && (
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>
                      <ShoppingCart size={20} />
                      ใบสั่งซื้อรอดำเนินการ ({pendingPurchaseOrders.length})
                    </h2>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.notificationList}>
                      {pendingPurchaseOrders.map((order) => (
                        <div key={order.id} className={styles.notificationItem}>
                          <div className={styles.notificationInfo}>
                            <p className={styles.notificationTitle}>{order.orderNumber}</p>
                            <p className={styles.notificationDescription}>{order.supplier}</p>
                          </div>
                          <span className={styles.badge}>฿{order.totalAmount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/purchase-orders">
                      <button className={styles.actionButton}>ไปที่ใบสั่งซื้อ</button>
                    </Link>
                  </div>
                </div>
              )}

              {pendingWithdrawalOrders.length > 0 && (
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>
                      <FileText size={20} />
                      ใบเบิกสินค้ารอดำเนินการ ({pendingWithdrawalOrders.length})
                    </h2>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.notificationList}>
                      {pendingWithdrawalOrders.map((order) => (
                        <div key={order.id} className={styles.notificationItem}>
                          <div className={styles.notificationInfo}>
                            <p className={styles.notificationTitle}>{order.orderNumber}</p>
                            <p className={styles.notificationDescription}>{order.department}</p>
                          </div>
                          <span className={styles.badge}>{order.items.length} รายการ</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/withdrawal-orders">
                      <button className={styles.actionButton}>ไปที่ใบเบิกสินค้า</button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
