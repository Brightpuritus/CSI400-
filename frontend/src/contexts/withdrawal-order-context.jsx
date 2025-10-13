"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useInventory } from "./inventory-context"

const WithdrawalOrderContext = createContext(undefined)

const INITIAL_ORDERS = [
  {
    id: "1",
    orderNumber: "WO-2025-001",
    department: "แผนกขาย",
    purpose: "ใช้สำหรับงานอีเวนท์",
    status: "pending",
    items: [{ productId: "1", productName: "ขวดน้ำรีไซเคิล", quantity: 20 }],
    notes: "ต้องการภายในสัปดาห์นี้",
    requestedBy: "พนักงาน",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function WithdrawalOrderProvider({ children }) {
  const [withdrawalOrders, setWithdrawalOrders] = useState([])
  const { updateProduct, getProduct } = useInventory()

  useEffect(() => {
    const stored = localStorage.getItem("withdrawalOrders")
    if (stored) {
      setWithdrawalOrders(JSON.parse(stored))
    } else {
      setWithdrawalOrders(INITIAL_ORDERS)
      localStorage.setItem("withdrawalOrders", JSON.stringify(INITIAL_ORDERS))
    }
  }, [])

  useEffect(() => {
    if (withdrawalOrders.length > 0) {
      localStorage.setItem("withdrawalOrders", JSON.stringify(withdrawalOrders))
    }
  }, [withdrawalOrders])

  const addWithdrawalOrder = (order) => {
    const orderNumber = `WO-${new Date().getFullYear()}-${String(withdrawalOrders.length + 1).padStart(3, "0")}`
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      orderNumber,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setWithdrawalOrders((prev) => [...prev, newOrder])
  }

  const confirmWithdrawalOrder = (id, confirmedBy) => {
    const order = withdrawalOrders.find((o) => o.id === id)
    if (!order) return false

    // Check if all items have sufficient stock
    for (const item of order.items) {
      const product = getProduct(item.productId)
      if (!product || product.quantity < item.quantity) {
        return false
      }
    }

    // Update inventory quantities
    order.items.forEach((item) => {
      const product = getProduct(item.productId)
      if (product) {
        updateProduct(item.productId, {
          quantity: product.quantity - item.quantity,
        })
      }
    })

    setWithdrawalOrders((prev) =>
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

    return true
  }

  const cancelWithdrawalOrder = (id) => {
    setWithdrawalOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "cancelled", updatedAt: new Date().toISOString() } : o)),
    )
  }

  const getWithdrawalOrder = (id) => {
    return withdrawalOrders.find((o) => o.id === id)
  }

  return (
    <WithdrawalOrderContext.Provider
      value={{
        withdrawalOrders,
        addWithdrawalOrder,
        confirmWithdrawalOrder,
        cancelWithdrawalOrder,
        getWithdrawalOrder,
      }}
    >
      {children}
    </WithdrawalOrderContext.Provider>
  )
}

export function useWithdrawalOrders() {
  const context = useContext(WithdrawalOrderContext)
  if (!context) {
    throw new Error("useWithdrawalOrders must be used within WithdrawalOrderProvider")
  }
  return context
}
