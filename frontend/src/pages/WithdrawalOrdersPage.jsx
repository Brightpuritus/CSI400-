"use client"

import { useState } from "react"
import { ProtectedRoute } from "../components/protected-route"
import { AppLayout } from "../components/app-layout"
import { useWithdrawalOrders } from "../contexts/withdrawal-order-context"
import { useAuth } from "../contexts/auth-context"
import { CreateWithdrawalOrderDialog } from "../components/create-withdrawal-order-dialog"
import { Plus, CheckCircle, XCircle, FileText } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import styles from "./WithdrawalOrdersPage.module.css"

export default function WithdrawalOrdersPage() {
  const { withdrawalOrders, confirmWithdrawalOrder, cancelWithdrawalOrder } = useWithdrawalOrders()
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
      const success = confirmWithdrawalOrder(selectedOrder.id, user.name)
      if (success) {
        toast({
          title: "ยืนยันใบเบิกสินค้าสำเร็จ",
          description: `ใบเบิกสินค้า ${selectedOrder.orderNumber} ได้รับการยืนยันแล้ว`,
        })
        setConfirmDialogOpen(false)
        setSelectedOrder(null)
      } else {
        toast({
          title: "ไม่สามารถยืนยันได้",
          description: "สินค้าในคลังไม่เพียงพอ",
          variant: "destructive",
        })
      }
    }
  }

  const handleCancelOrder = (orderId) => {
    cancelWithdrawalOrder(orderId)
    toast({
      title: "ยกเลิกใบเบิกสินค้าสำเร็จ",
      description: "ใบเบิกสินค้าถูกยกเลิกแล้ว",
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
              <h1>ใบเบิกสินค้า</h1>
              <p>จัดการใบเบิกสินค้า</p>
            </div>
            <button className={styles.addButton} onClick={() => setDialogOpen(true)}>
              <Plus size={16} />
              สร้างใบเบิก
            </button>
          </div>

          <div className={styles.ordersGrid}>
            {withdrawalOrders.length === 0 ? (
              <div className={styles.card}>
                <div className={styles.emptyState}>
                  <FileText className={styles.emptyIcon} />
                  <p className={styles.emptyText}>ยังไม่มีใบเบิกสินค้า</p>
                </div>
              </div>
            ) : (
              withdrawalOrders.map((order) => (
                <div key={order.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderContent}>
                      <div className={styles.orderInfo}>
                        <div className={styles.orderTitle}>
                          {order.orderNumber}
                          {getStatusBadge(order.status)}
                        </div>
                        <p className={styles.orderDetails}>แผนก: {order.department}</p>
                        <p className={styles.orderDetails}>วัตถุประสงค์: {order.purpose}</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.itemsList}>
                      <p className={styles.itemsTitle}>รายการสินค้า:</p>
                      {order.items.map((item, index) => (
                        <div key={index} className={styles.item}>
                          <span>{item.productName}</span>
                          <span className={styles.itemQuantity}>{item.quantity} หน่วย</span>
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
                      <span>ผู้ขอเบิก: {order.requestedBy}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString("th-TH")}</span>
                    </div>

                    {order.status === "pending" && (
                      <div className={styles.actions}>
                        <button className={styles.confirmButton} onClick={() => handleConfirmOrder(order)}>
                          <CheckCircle size={16} />
                          ยืนยันใบเบิก
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

          <CreateWithdrawalOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />

          {confirmDialogOpen && (
            <div className="dialog-overlay" onClick={() => setConfirmDialogOpen(false)}>
              <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <h2>ยืนยันใบเบิกสินค้า</h2>
                <p>
                  คุณต้องการยืนยันใบเบิกสินค้า {selectedOrder?.orderNumber} หรือไม่?
                  <br />
                  สินค้าจะถูกหักออกจากคลังสินค้าทันที
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
