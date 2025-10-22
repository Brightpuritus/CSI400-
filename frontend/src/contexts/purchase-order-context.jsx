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
  const { updateProduct, products } = useInventory()

  useEffect(() => {
    // Try to load from backend first, fallback to localStorage
    fetch("/api/purchase-orders")
      .then((res) => res.json())
      .then((data) => setPurchaseOrders(Array.isArray(data) ? data : INITIAL_ORDERS))
      .catch(() => {
        const stored = localStorage.getItem("purchaseOrders")
        if (stored) {
          setPurchaseOrders(JSON.parse(stored))
        } else {
          setPurchaseOrders(INITIAL_ORDERS)
          localStorage.setItem("purchaseOrders", JSON.stringify(INITIAL_ORDERS))
        }
      })
  }, [])

  useEffect(() => {
    // keep a local copy as well for offline/fallback
    try {
      localStorage.setItem("purchaseOrders", JSON.stringify(purchaseOrders))
    } catch (e) {
      // ignore
    }
  }, [purchaseOrders])

  const addPurchaseOrder = async (order) => {
    // POST to backend
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
      const created = await res.json()
      setPurchaseOrders((prev) => [created, ...prev])

    } catch (e) {
      // fallback: create locally
      const orderNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, "0")}`
      const enrichedItems = (order.items || []).map((item) => {
        const quantity = Number(item.quantity) || 0
        const unitPrice = Number(item.pricePerUnit ?? item.unitPrice) || 0
        const product = products.find((p) => p.id === item.productId) || {}
        const productName = product.name || item.productName || ""
        return {
          productId: item.productId,
          productName,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        }
      })
      const totalAmount = enrichedItems.reduce((sum, it) => sum + (it.totalPrice || 0), 0)
      const newOrder = {
        ...order,
        id: Date.now().toString(),
        orderNumber,
        items: enrichedItems,
        totalAmount,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setPurchaseOrders((prev) => [newOrder, ...prev])

    }
  }

  const confirmPurchaseOrder = async (id, confirmedBy) => {
    const order = purchaseOrders.find((o) => o.id === id)
    if (!order) return

    // Update inventory quantities locally
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        updateProduct(item.productId, {
          quantity: (product.quantity || 0) + (item.quantity || 0),
        })
      }
    })

    const updated = {
      ...order,
      status: "confirmed",
      confirmedBy,
      confirmedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Try to persist to backend
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      const serverUpdated = await res.json()
      setPurchaseOrders((prev) => prev.map((o) => (o.id === id ? serverUpdated : o)))
    } catch (e) {
      setPurchaseOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
    }
  }

  const cancelPurchaseOrder = async (id) => {
    const updated = { ...(getPurchaseOrder(id) || {}), status: "cancelled", updatedAt: new Date().toISOString() }
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      const serverUpdated = await res.json()
      setPurchaseOrders((prev) => prev.map((o) => (o.id === id ? serverUpdated : o)))
    } catch (e) {
      setPurchaseOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
    }
  }

  const deletePurchaseOrder = async (id) => {
    try {
      await fetch(`/api/purchase-orders/${id}`, { method: "DELETE" })
      setPurchaseOrders((prev) => prev.filter((o) => o.id !== id))
    } catch (e) {
      // fallback local delete
      setPurchaseOrders((prev) => prev.filter((o) => o.id !== id))
    }
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
        deletePurchaseOrder,
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
