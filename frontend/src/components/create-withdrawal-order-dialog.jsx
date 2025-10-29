"use client"

import { useState } from "react"
import { useWithdrawalOrders } from "@/contexts/withdrawal-order-context"
import { useInventory } from "@/contexts/inventory-context"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import styles from "./create-withdrawal-order-dialog.module.css"

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onOpenChange
 */
export function CreateWithdrawalOrderDialog({ open, onOpenChange }) {
  const { createWithdrawalOrder } = useWithdrawalOrders()
  const { products } = useInventory()
  const { user } = useAuth()
  const { toast } = useToast()

  const [department, setDepartment] = useState("")
  const [purpose, setPurpose] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState([{ productId: "", quantity: "" }])
  const [branch, setBranch] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: "" }])
  }

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const getProductStock = (productId) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.quantity : 0
  }

  const isQuantityValid = (productId, quantity) => {
    const stock = getProductStock(productId)
    return Number.parseInt(quantity) <= stock
  }

  const hasInvalidQuantities = () => {
    return items.some((item) => {
      if (!item.productId || !item.quantity) return false
      return !isQuantityValid(item.productId, item.quantity)
    })
  }

  const hasEnoughQuantity = () => {
    return items.every(item => {
      const product = products.find(p => p.id === item.productId)
      return product && product.quantity >= parseInt(item.quantity)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!hasEnoughQuantity()) {
      toast({
        title: "ไม่สามารถสร้างใบเบิกได้",
        description: "จำนวนสินค้าที่เบิกเกินกว่าสต็อกที่มี",
        variant: "destructive",
      })
      return
    }

    const orderItems = items.map((item) => ({
      productId: item.productId,
      quantity: Number.parseInt(item.quantity),
    }))

    createWithdrawalOrder({
      branch,
      shippingAddress,
      items: orderItems,
      notes,
      requestedBy: user?.username || "Unknown",
    })

    toast({
      title: "สร้างใบเบิกสินค้าสำเร็จ",
      description: `สร้างใบเบิกสำหรับแผนก ${department} แล้ว`,
    })

    // Reset form
    setDepartment("")
    setPurpose("")
    setNotes("")
    setItems([{ productId: "", quantity: "" }])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้างใบเบิกสินค้า</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            
            <div className={styles.formGroup}>
              <Label htmlFor="branch">สาขา</Label>
              <Input
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="เช่น สาขาเชียงใหม่"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="shippingAddress">ที่อยู่จัดส่ง</Label>
              <Textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="กรอกที่อยู่จัดส่ง"
                rows={3}
                required
              />
            </div>
          </div>

          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <Label>รายการสินค้า</Label>
              <Button type="button" size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มสินค้า
              </Button>
            </div>

            {items.map((item, index) => {
              const stock = getProductStock(item.productId)
              const isInvalid = item.productId && item.quantity && !isQuantityValid(item.productId, item.quantity)

              return (
                <div key={index} className={styles.itemContainer}>
                  <div className={styles.itemRow}>
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
                              {product.name} (คงเหลือ: {product.quantity})
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
                        max={stock}
                        required
                      />
                    </div>

                    {items.length > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {isInvalid && (
                    <div className={styles.alert}>
                      <AlertCircle className="h-4 w-4" />
                      <span>จำนวนที่เบิกเกินกว่าสต็อกที่มี (คงเหลือ: {stock})</span>
                    </div>
                  )}
                </div>
              )
            })}
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
            <Button type="submit" disabled={hasInvalidQuantities()}>
              สร้างใบเบิก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
