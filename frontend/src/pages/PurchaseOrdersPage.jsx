"use client"

import { useState } from "react"
import { ProtectedRoute } from "../components/protected-route"
import { AppLayout } from "../components/app-layout"
import { usePurchaseOrders } from "../contexts/purchase-order-context"
import { useAuth } from "../contexts/auth-context"
import { CreatePurchaseOrderDialog } from "../components/create-purchase-order-dialog"
import { Plus, CheckCircle, XCircle, Package } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import styles from "./PurchaseOrdersPage.module.css"

export default function PurchaseOrdersPage() {
  const { purchaseOrders, confirmPurchaseOrder, cancelPurchaseOrder } = usePurchaseOrders()
  const { user } = useAuth()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const handleConfirmOrder = (order) => {
    setSelectedOrder(order)
    setConfirmDialogOpen(true)
  }

  const handleConfirmSubmit = () => {
    if (selectedOrder && user) {
      confirmPurchaseOrder(selectedOrder.id, user.name)
      toast({
        title: "ยืนยันใบสั่งซื้อสำเร็จ",
        description: `ใบสั่งซื้อ ${selectedOrder.orderNumber} ได้รับการยืนยันแล้ว`,
      })
      setConfirmDialogOpen(false)
      setSelectedOrder(null)
    }
  }

  const handleCancelOrder = (orderId) => {
    cancelPurchaseOrder(orderId)
    toast({
      title: "ยกเลิกใบสั่งซื้อสำเร็จ",
      description: "ใบสั่งซื้อถูกยกเลิกแล้ว",
      variant: "destructive",
    })
  }

  const getStatusBadge = (status) => {
    const badgeClass =
      status === "pending"
        ? styles.badgeSecondary
        : status === "confirmed"
          ? styles.badgeDefault
          : styles.badgeDestructive
    const text = status === "pending" ? "รอดำเนินการ" : status === "confirmed" ? "ยืนยันแล้ว" : "ยกเลิก"
    return <span className={`${styles.badge} ${badgeClass}`}>{text}</span>
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerText}>
              <h1>ใบสั่งซื้อสินค้า</h1>
              <p>จัดการใบสั่งซื้อสินค้า</p>
            </div>
            <button className={styles.addButton} onClick={() => setDialogOpen(true)}>
              <Plus size={16} />
              สร้างใบสั่งซื้อ
            </button>
          </div>

          <div className={styles.ordersGrid}>
            {purchaseOrders.length === 0 ? (
              <div className={styles.card}>
                <div className={styles.emptyState}>
                  <Package className={styles.emptyIcon} />
                  <p className={styles.emptyText}>ยังไม่มีใบสั่งซื้อ</p>
                </div>
              </div>
            ) : (
              purchaseOrders.map((order) => (
                <div key={order.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderContent}>
                      <div className={styles.orderInfo}>
                        <div className={styles.orderTitle}>
                          {order.orderNumber}
                          {getStatusBadge(order.status)}
                        </div>
                        <p className={styles.orderSupplier}>ผู้จัดจำหน่าย: {order.supplier}</p>
                      </div>
                      <div className={styles.orderAmount}>
                        <p>฿{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.itemsList}>
                      <p className={styles.itemsTitle}>รายการสินค้า:</p>
                      {order.items.map((item, index) => (
                        <div key={index} className={styles.item}>
                          <span>{item.productName}</span>
                          <span className={styles.itemQuantity}>
                            {item.quantity} x ฿{item.unitPrice.toLocaleString()} = ฿{item.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className={styles.notesSection}>
                        <p className={styles.notesTitle}>หมายเหตุ:</p>
                        <p className={styles.notesText}>{order.notes}</p>
                      </div>
                    )}

                    <div className={styles.metadata}>
                      <span>สร้างโดย: {order.createdBy}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString("th-TH")}</span>
                    </div>

                    {order.status === "pending" && (
                      <div className={styles.actions}>
                        <button className={styles.confirmButton} onClick={() => handleConfirmOrder(order)}>
                          <CheckCircle size={16} />
                          ยืนยันใบสั่งซื้อ
                        </button>
                        <button className={styles.cancelButton} onClick={() => handleCancelOrder(order.id)}>
                          <XCircle size={16} />
                          ยกเลิก
                        </button>
                      </div>
                    )}

                    {order.status === "confirmed" && (
                      <div className={styles.confirmedInfo}>
                        ยืนยันโดย: {order.confirmedBy} • {new Date(order.confirmedAt).toLocaleDateString("th-TH")}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <CreatePurchaseOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />

          {confirmDialogOpen && (
            <div className="dialog-overlay" onClick={() => setConfirmDialogOpen(false)}>
              <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <h2>ยืนยันใบสั่งซื้อ</h2>
                <p>
                  คุณต้องการยืนยันใบสั่งซื้อ {selectedOrder?.orderNumber} หรือไม่?
                  <br />
                  สินค้าจะถูกเพิ่มเข้าสู่คลังสินค้าทันที
                </p>
                <div className="dialog-actions">
                  <button onClick={() => setConfirmDialogOpen(false)}>ยกเลิก</button>
                  <button className="primary" onClick={handleConfirmSubmit}>
                    ยืนยัน
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
