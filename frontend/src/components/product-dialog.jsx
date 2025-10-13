"use client"

import { useState, useEffect } from "react"
import { useInventory } from "@/contexts/inventory-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import styles from "./product-dialog.module.css"

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onOpenChange
 * @param {Object|null} props.product
 * @param {'view'|'edit'|'add'} props.mode
 */
export function ProductDialog({ open, onOpenChange, product, mode = "view" }) {
  const { addProduct, updateProduct, deleteProduct } = useInventory()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    unit: "",
    minStock: "",
    expiryDate: "",
    image: "",
  })

  useEffect(() => {
    if (product && (mode === "view" || mode === "edit")) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        unit: product.unit,
        minStock: product.minStock.toString(),
        expiryDate: product.expiryDate,
        image: product.image || "",
      })
    } else if (mode === "add") {
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        quantity: "",
        unit: "",
        minStock: "",
        expiryDate: "",
        image: "",
      })
    }
  }, [product, mode, open])

  const handleSubmit = (e) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number.parseFloat(formData.price),
      quantity: Number.parseInt(formData.quantity),
      unit: formData.unit,
      minStock: Number.parseInt(formData.minStock),
      expiryDate: formData.expiryDate,
      image: formData.image,
    }

    if (mode === "add") {
      addProduct(productData)
      toast({
        title: "เพิ่มสินค้าสำเร็จ",
        description: `เพิ่ม ${productData.name} เข้าสู่คลังสินค้าแล้ว`,
      })
    } else if (mode === "edit" && product) {
      updateProduct(product.id, productData)
      toast({
        title: "แก้ไขสินค้าสำเร็จ",
        description: `แก้ไขข้อมูล ${productData.name} แล้ว`,
      })
    }

    onOpenChange(false)
  }

  const handleDelete = () => {
    if (product && window.confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) {
      deleteProduct(product.id)
      toast({
        title: "ลบสินค้าสำเร็จ",
        description: `ลบ ${product.name} ออกจากคลังสินค้าแล้ว`,
        variant: "destructive",
      })
      onOpenChange(false)
    }
  }

  const isViewMode = mode === "view"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "เพิ่มสินค้าใหม่" : mode === "edit" ? "แก้ไขสินค้า" : "รายละเอียดสินค้า"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.colSpan2}>
              <Label htmlFor="name">ชื่อสินค้า</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>

            <div className={styles.colSpan2}>
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isViewMode}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="category">หมวดหมู่</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="price">ราคา (บาท)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="quantity">จำนวน</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="unit">หน่วย</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                disabled={isViewMode}
                placeholder="ชิ้น, กล่อง, ขวด"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="minStock">สต็อกขั้นต่ำ</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="expiryDate">วันหมดอายุ</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>

            <div className={styles.colSpan2}>
              <Label htmlFor="image">URL รูปภาพ</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                disabled={isViewMode}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <DialogFooter className={styles.footer}>
            {mode === "view" && (
              <>
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  ลบสินค้า
                </Button>
                <Button type="button" onClick={() => onOpenChange(false)}>
                  ปิด
                </Button>
              </>
            )}
            {mode === "edit" && (
              <>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit">บันทึก</Button>
              </>
            )}
            {mode === "add" && (
              <>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit">เพิ่มสินค้า</Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
