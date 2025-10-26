"use client"

import { useState } from "react"
import { ProtectedRoute } from "../components/protected-route"
import { AppLayout } from "../components/app-layout"
import { useInventory } from "../contexts/inventory-context"
import { ProductCard } from "../components/product-card"
import { ProductDialog } from "../components/product-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Search } from "lucide-react"
import styles from "./InventoryPage.module.css"

export default function InventoryPage() {
  const { products } = useInventory()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [dialogMode, setDialogMode] = useState("add")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // หมวดหมู่ทั้งหมด
  const safeProducts = Array.isArray(products) ? products : []
  const categories = ["all", ...new Set((safeProducts ?? []).map((p) => p.category))]

  // ฟิลเตอร์สินค้า
  const filteredProducts = (safeProducts ?? []).filter((product) => {
    const name = product?.name ?? ""
    const description = product?.description ?? ""
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // เปิด dialog เพิ่มสินค้า
  const handleAddProduct = () => {
    setSelectedProduct(null)
    setDialogMode("add")
    setDialogOpen(true)
  }

  // เปิด dialog แก้ไขสินค้า
  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setDialogMode("edit")
    setDialogOpen(true)
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerText}>
              <h1 className="text-3xl font-bold">คลังสินค้า</h1>
              <p className="text-muted-foreground">จัดการสินค้าในคลัง</p>
            </div>
            <button className={styles.addButton} onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มสินค้า
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.categorySelect}>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="หมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {categories
                    .filter((c) => c !== "all")
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className="text-muted-foreground">ไม่พบสินค้า</p>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                />
              ))}
            </div>
          )}

          <ProductDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            product={selectedProduct}
            mode={dialogMode}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
