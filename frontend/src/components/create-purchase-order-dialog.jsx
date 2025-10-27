"use client"

import { useState } from "react"
import { usePurchaseOrders } from "@/contexts/purchase-order-context"
import { useInventory } from "@/contexts/inventory-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"
import styles from "./create-purchase-order-dialog.module.css"

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onOpenChange
 */
export function CreatePurchaseOrderDialog({ open, onOpenChange }) {
  const { addPurchaseOrder } = usePurchaseOrders()
  const { products } = useInventory()
  const { toast } = useToast()

  const [supplier, setSupplier] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState([{ productId: "", quantity: "", pricePerUnit: "" }])

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: "", pricePerUnit: "" }])
  }

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const orderItems = items.map((item) => ({
      productId: item.productId,
      productName: products.find(p => String(p.id) === String(item.productId))?.name ?? "",
      quantity: Number(item.quantity),
      unitPrice: Number(item.pricePerUnit),
      totalPrice: Number(item.quantity) * Number(item.pricePerUnit)
    }))
    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    addPurchaseOrder({
      supplier,
      notes,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      confirmedBy: null,
      confirmedAt: null,
      totalAmount,
      items: orderItems
    })
    toast({
      title: "สร้างใบสั่งซื้อสำเร็จ",
      description: `สร้างใบสั่งซื้อกับ ${supplier} แล้ว`,
    })
    // Reset form
    setSupplier("")
    setNotes("")
    setItems([{ productId: "", quantity: "", pricePerUnit: "" }])
    onOpenChange(false)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const quantity = Number.parseFloat(item.quantity) || 0
      const price = Number.parseFloat(item.pricePerUnit) || 0
      return sum + quantity * price
    }, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้างใบสั่งซื้อสินค้า</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <Label htmlFor="supplier">ชื่อผู้จัดจำหน่าย</Label>
            <Input
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="บริษัท ABC จำกัด"
              required
            />
          </div>

          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <Label>รายการสินค้า</Label>
              <Button type="button" size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มสินค้า
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <div className={styles.itemProduct}>
                  <Label>สินค้า</Label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) => handleItemChange(index, "productId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสินค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={styles.itemQuantity}>
                  <Label>จำนวน</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <div className={styles.itemPrice}>
                  <Label>ราคา/หน่วย</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.pricePerUnit}
                    onChange={(e) => handleItemChange(index, "pricePerUnit", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                {items.length > 1 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.totalRow}>
            ยอดรวม: ฿{calculateTotal().toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม..."
              rows={3}
            />
          </div>

          <DialogFooter className={styles.footer}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit">สร้างใบสั่งซื้อ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
