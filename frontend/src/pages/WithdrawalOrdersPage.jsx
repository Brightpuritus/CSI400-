"use client"

import { useState } from "react"
import { useWithdrawalOrders } from "../contexts/withdrawal-order-context"
import { useAuth } from "../contexts/auth-context"
import { useToast } from "../hooks/use-toast"
import { Button } from "../components/ui/button"
import { CreateWithdrawalOrderDialog } from "../components/create-withdrawal-order-dialog"
import { AppLayout } from "../components/app-layout"
import styles from "./WithdrawalOrdersPage.module.css"

export default function WithdrawalOrdersPage() {
  const { withdrawalOrders, confirmWithdrawalOrder, products } = useWithdrawalOrders()
  const { user } = useAuth()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleConfirm = async (orderId) => {
    try {
      const success = await confirmWithdrawalOrder(orderId, user.username)
      if (success) {
        toast({
          title: "ยืนยันใบเบิกสำเร็จ",
          description: "ใบเบิกถูกยืนยันแล้ว",
        })
      } else {
        throw new Error("Failed to confirm order")
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยืนยันใบเบิกได้",
        variant: "destructive",
      })
    }
  }

  return (
    <AppLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>ใบเบิกสินค้า</h1>
          <Button onClick={() => setDialogOpen(true)}>สร้างใบเบิก</Button>
        </div>

        <div className={styles.orders}>
          {withdrawalOrders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <h3>ใบเบิกเลขที่ {order.orderNumber}</h3>
                <span className={styles.status}>{order.status}</span>
              </div>
              <div className={styles.orderDetails}>
                <p>แผนก: {order.department}</p>
                <p>วัตถุประสงค์: {order.purpose}</p>
                <p>ผู้เบิก: {order.requestedBy}</p>
                <p>วันที่: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={styles.items}>
                <h4>รายการสินค้า</h4>
                {order.items.map((item, index) => (
                  <div key={index} className={styles.item}>
                    <span>{products[item.productId] || item.productName || "กำลังโหลด..."}</span>
                    <span>จำนวน: {item.quantity}</span>
                  </div>
                ))}
              </div>
              {order.status === "pending" && user?.role === "admin" && (
                <Button
                  onClick={() => handleConfirm(order.id)}
                  className={styles.confirmButton}
                >
                  ยืนยันใบเบิก
                </Button>
              )}
            </div>
          ))}
        </div>

        <CreateWithdrawalOrderDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </AppLayout>
  )
}
