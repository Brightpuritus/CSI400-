"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useData } from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, AlertTriangle, Package, Plus, Edit } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { AddProductDialog } from "@/components/stock/add-product-dialog"
import { EditProductDialog } from "@/components/stock/edit-product-dialog"

export default function StockPage() {
  const { products } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStockStatus = (product) => {
    if (product.stock === 0) return { label: "หมด", variant: "destructive" }
    if (product.stock <= product.minStock) return { label: "ต่ำ", variant: "warning" }
    return { label: "ปกติ", variant: "default" }
  }

  const getExpiryStatus = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { label: "หมดอายุแล้ว", variant: "destructive" }
    if (daysUntilExpiry <= 30) return { label: `เหลือ ${daysUntilExpiry} วัน`, variant: "warning" }
    return { label: `เหลือ ${daysUntilExpiry} วัน`, variant: "default" }
  }

  const handleEditClick = (product) => {
    setSelectedProduct(product)
    setEditDialogOpen(true)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">สต็อกสินค้า</h1>
          <p className="text-muted-foreground mt-1">ตรวจสอบและจัดการสินค้าในคลัง</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มสินค้า
          </Button>
        </div>

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ไม่พบสินค้า</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product)
              const expiryStatus = getExpiryStatus(product.expiryDate)

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square relative bg-muted">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">ราคา</p>
                        <p className="font-semibold">{product.price} บาท</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">สต็อก</p>
                        <p className="font-semibold">{product.stock} ชิ้น</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">หมวดหมู่</p>
                        <p className="font-medium">{product.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ผู้จัดจำหน่าย</p>
                        <p className="font-medium text-xs">{product.supplier}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">วันหมดอายุ</p>
                        <Badge variant={expiryStatus.variant} className="text-xs">
                          {expiryStatus.label}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mt-1">{product.expiryDate}</p>
                    </div>

                    {(stockStatus.variant === "warning" || stockStatus.variant === "destructive") && (
                      <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <p className="text-xs text-warning">ต้องสั่งซื้อเพิ่ม</p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleEditClick(product)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      แก้ไขสินค้า
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <AddProductDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditProductDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} product={selectedProduct} />
    </MainLayout>
  )
}
