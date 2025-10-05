"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useData } from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle, Clock, Package } from "lucide-react"
import { useState } from "react"
import { CreatePurchaseOrderDialog } from "@/components/purchase-orders/create-purchase-order-dialog"
import { format } from "date-fns"
import { th } from "date-fns/locale"

export default function PurchaseOrdersPage() {
  const { purchaseOrders, confirmPurchaseOrder } = useData()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const getStatusBadge = (status) => {
    if (status === "confirmed") {
      return (
        <Badge variant="default" className="bg-green-500 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          ยืนยันแล้ว
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        รอยืนยัน
      </Badge>
    )
  }

  const handleConfirmOrder = (orderId) => {
    if (confirm("ยืนยันการรับสินค้าเข้าคลัง?")) {
      confirmPurchaseOrder(orderId)
    }
  }

  return (
    <MainLayout requiredRole="manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ใบสั่งซื้อสินค้า</h1>
            <p className="text-muted-foreground mt-1">จัดการคำสั่งซื้อสินค้าเข้าคลัง</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            สร้างใบสั่งซื้อ
          </Button>
        </div>

        {purchaseOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ยังไม่มีใบสั่งซื้อ</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                สร้างใบสั่งซื้อแรก
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchaseOrders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">ใบสั่งซื้อ #{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          สร้างเมื่อ: {format(new Date(order.createdAt), "d MMMM yyyy HH:mm", { locale: th })}
                        </p>
                        {order.confirmedAt && (
                          <p className="text-sm text-muted-foreground">
                            ยืนยันเมื่อ: {format(new Date(order.confirmedAt), "d MMMM yyyy HH:mm", { locale: th })}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">รายการสินค้า:</p>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">จำนวน: {item.quantity} ชิ้น</p>
                            </div>
                            <p className="font-semibold">{(item.price * item.quantity).toLocaleString()} บาท</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">ยอดรวมทั้งหมด</p>
                        <p className="text-2xl font-bold">{order.totalAmount.toLocaleString()} บาท</p>
                      </div>
                      {order.status === "pending" && (
                        <Button onClick={() => handleConfirmOrder(order.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          ยืนยันรับสินค้า
                        </Button>
                      )}
                    </div>

                    {order.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">หมายเหตุ:</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        <CreatePurchaseOrderDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </div>
    </MainLayout>
  )
}
