"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useData } from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, Bell, X } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"

export default function NotificationsPage() {
  const { notifications, clearNotification } = useData()

  const getNotificationIcon = (type) => {
    if (type === "error") return <AlertCircle className="h-5 w-5 text-destructive" />
    if (type === "warning") return <AlertTriangle className="h-5 w-5 text-warning" />
    return <Bell className="h-5 w-5 text-primary" />
  }

  const getNotificationVariant = (type) => {
    if (type === "error") return "destructive"
    if (type === "warning") return "warning"
    return "default"
  }

  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const errorCount = notifications.filter((n) => n.type === "error").length
  const warningCount = notifications.filter((n) => n.type === "warning").length

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">การแจ้งเตือน</h1>
          <p className="text-muted-foreground mt-1">ติดตามการแจ้งเตือนสำคัญของระบบ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">ทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">คำเตือน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{warningCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">ข้อผิดพลาด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{errorCount}</div>
            </CardContent>
          </Card>
        </div>

        {sortedNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ไม่มีการแจ้งเตือน</p>
              <p className="text-sm text-muted-foreground mt-1">ระบบจะแจ้งเตือนเมื่อมีสินค้าใกล้หมดอายุหรือสต็อกต่ำ</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedNotifications.map((notification) => (
              <Card key={notification.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        <Badge variant={getNotificationVariant(notification.type)} className="shrink-0">
                          {notification.type === "error" ? "ข้อผิดพลาด" : "คำเตือน"}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.timestamp), "d MMMM yyyy HH:mm", { locale: th })}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => clearNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
