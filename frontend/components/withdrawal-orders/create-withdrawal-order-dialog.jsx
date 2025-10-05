"use client"

import { useState } from "react"
import { useData } from "@/lib/data-store"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateWithdrawalOrderDialog({ open, onOpenChange }) {
  const { products, addWithdrawalOrder } = useData()
  const { user } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState([{ productId: "", quantity: 1 }])
  const [purpose, setPurpose] = useState("")
  const [notes, setNotes] = useState("")

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1 }])
  }

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const getAvailableStock = (productId) => {
    const product = products.find((p) => p.id === Number.parseInt(productId))
    return product ? product.stock : 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validItems = items.filter((item) => item.productId && item.quantity > 0)

    if (validItems.length === 0) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ",
        variant: "destructive",
      })
      return
    }

    // Check if quantities are available
    for (const item of validItems) {
      const availableStock = getAvailableStock(item.productId)
      if (Number.parseInt(item.quantity) > availableStock) {
        const product = products.find((p) => p.id === Number.parseInt(item.productId))
        toast({
          title: "ข้อผิดพลาด",
          description: `${product.name} มีสต็อกไม่เพียงพอ (เหลือ ${availableStock} ชิ้น)`,
          variant: "destructive",
        })
        return
      }
    }

    if (!purpose.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาระบุวัตถุประสงค์ในการเบิกสินค้า",
        variant: "destructive",
      })
      return
    }

    const orderItems = validItems.map((item) => {
      const product = products.find((p) => p.id === Number.parseInt(item.productId))
      return {
        productId: product.id,
        productName: product.name,
        quantity: Number.parseInt(item.quantity),
      }
    })

    addWithdrawalOrder({
      items: orderItems,
      purpose,
      notes,
      requestedBy: user.name,
    })

    toast({
      title: "สำเร็จ",
      description: "สร้างใบเบิกสินค้าเรียบร้อยแล้ว",
    })

    // Reset form
    setItems([{ productId: "", quantity: 1 }])
    setPurpose("")
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้างใบเบิกสินค้า</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>รายการสินค้า</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" />
                เพิ่มสินค้า
              </Button>
            </div>

            {items.map((item, index) => {
              const availableStock = item.productId ? getAvailableStock(item.productId) : 0
              const isOverStock = Number.parseInt(item.quantity) > availableStock

              return (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>สินค้า</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => handleItemChange(index, "productId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสินค้า" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} (คงเหลือ: {product.stock} ชิ้น)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-32">
                      <Label>จำนวน</Label>
                      <Input
                        type="number"
                        min="1"
                        max={availableStock}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      />
                    </div>

                    {items.length > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {item.productId && isOverStock && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>สต็อกไม่เพียงพอ (เหลือ {availableStock} ชิ้น)</AlertDescription>
                    </Alert>
                  )}
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">
              วัตถุประสงค์ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="เช่น ส่งให้ลูกค้า, ใช้ภายในบริษัท, ฯลฯ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ (ถ้ามี)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เพิ่มหมายเหตุเกี่ยวกับการเบิกสินค้า..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit">สร้างใบเบิก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
