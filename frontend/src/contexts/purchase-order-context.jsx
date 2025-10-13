"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useInventory } from "./inventory-context"

const PurchaseOrderContext = createContext(undefined)

const INITIAL_ORDERS = [
  {
    id: "1",
    orderNumber: "PO-2025-001",
    supplier: "บริษัท ABC จำกัด",
    status: "pending",
    items: [{ productId: "1", productName: "ขวดน้ำรีไซเคิล", quantity: 100, unitPrice: 250, totalPrice: 25000 }],
    totalAmount: 25000,
    notes: "สั่งซื้อเพิ่มเติมสำหรับเดือนหน้า",
    createdBy: "ผู้ดูแลระบบ",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function PurchaseOrderProvider({ children }) {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const { updateProduct, getProduct } = useInventory()

  useEffect(() => {
    const stored = localStorage.getItem("purchaseOrders")
    if (stored) {
      setPurchaseOrders(JSON.parse(stored))
    } else {
      setPurchaseOrders(INITIAL_ORDERS)
      localStorage.setItem("purchaseOrders", JSON.stringify(INITIAL_ORDERS))
    }
  }, [])

  useEffect(() => {
    if (purchaseOrders.length > 0) {
      localStorage.setItem("purchaseOrders", JSON.stringify(purchaseOrders))
    }
  }, [purchaseOrders])

  const addPurchaseOrder = (order) => {
    const orderNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, "0")}`
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      orderNumber,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPurchaseOrders((prev) => [...prev, newOrder])
  }

  const confirmPurchaseOrder = (id, confirmedBy) => {
    const order = purchaseOrders.find((o) => o.id === id)
    if (!order) return

    // Update inventory quantities
    order.items.forEach((item) => {
      const product = getProduct(item.productId)
      if (product) {
        updateProduct(item.productId, {
          quantity: product.quantity + item.quantity,
        })
      }
    })

    setPurchaseOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: "confirmed",
              confirmedBy,
              confirmedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : o,
      ),
    )
  }

  const cancelPurchaseOrder = (id) => {
    setPurchaseOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "cancelled", updatedAt: new Date().toISOString() } : o)),
    )
  }

  const getPurchaseOrder = (id) => {
    return purchaseOrders.find((o) => o.id === id)
  }

  return (
    <PurchaseOrderContext.Provider
      value={{
        purchaseOrders,
        addPurchaseOrder,
        confirmPurchaseOrder,
        cancelPurchaseOrder,
        getPurchaseOrder,
      }}
    >
      {children}
    </PurchaseOrderContext.Provider>
  )
}

export function usePurchaseOrders() {
  const context = useContext(PurchaseOrderContext)
  if (!context) {
    throw new Error("usePurchaseOrders must be used within PurchaseOrderProvider")
  }
  return context
}
