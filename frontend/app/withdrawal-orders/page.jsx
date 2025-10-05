"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useData } from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, FileText, CheckCircle } from "lucide-react"
import { useState } from "react"
import { CreateWithdrawalOrderDialog } from "@/components/withdrawal-orders/create-withdrawal-order-dialog"
import { format } from "date-fns"
import { th } from "date-fns/locale"

export default function WithdrawalOrdersPage() {
  const { withdrawalOrders, confirmWithdrawalOrder } = useData()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleConfirm = (orderId) => {
    confirmWithdrawalOrder(orderId)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ใบเบิกสินค้า</h1>
            <p className="text-muted-foreground mt-1">จัดการการเบิกสินค้าออกจากคลัง</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            สร้างใบเบิก
          </Button>
        </div>

        {withdrawalOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ยังไม่มีใบเบิกสินค้า</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                สร้างใบเบิกแรก
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {withdrawalOrders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">ใบเบิก #{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          สร้างเมื่อ: {format(new Date(order.createdAt), "d MMMM yyyy HH:mm", { locale: th })}
                        </p>
                        {order.confirmedAt && (
                          <p className="text-sm text-muted-foreground">
                            ยืนยันเมื่อ: {format(new Date(order.confirmedAt), "d MMMM yyyy HH:mm", { locale: th })}
                          </p>
                        )}
                      </div>
                      <Badge variant={order.status === "confirmed" ? "default" : "secondary"}>
                        <Package className="h-3 w-3 mr-1" />
                        {order.status === "confirmed" ? "ยืนยันแล้ว" : "รอยืนยัน"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">รายการสินค้า:</p>
                        <p className="text-sm text-muted-foreground">ผู้เบิก: {order.requestedBy}</p>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">จำนวน: {item.quantity} ชิ้น</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.purpose && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">วัตถุประสงค์:</p>
                        <p className="text-sm text-muted-foreground">{order.purpose}</p>
                      </div>
                    )}

                    {order.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">หมายเหตุ:</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}

                    {order.status === "pending" && (
                      <Button onClick={() => handleConfirm(order.id)} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ยืนยันใบเบิก
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        <CreateWithdrawalOrderDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </div>
    </MainLayout>
  )
}
