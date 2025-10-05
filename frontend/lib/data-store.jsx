"use client"

import { createContext, useContext, useState, useEffect } from "react"

const DataContext = createContext(null)

// Mock initial data
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "น้ำดื่ม 600ml",
    image: "/reusable-water-bottle.png",
    price: 10,
    stock: 500,
    expiryDate: "2025-12-31",
    category: "เครื่องดื่ม",
    supplier: "บริษัท น้ำดื่มใส จำกัด",
    minStock: 100,
  },
  {
    id: 2,
    name: "ขนมปัง",
    image: "/rustic-bread-loaf.png",
    price: 35,
    stock: 150,
    expiryDate: "2025-03-15",
    category: "อาหาร",
    supplier: "โรงงานขนมปัง ABC",
    minStock: 50,
  },
  {
    id: 3,
    name: "นม UHT 1 ลิตร",
    image: "/milk-carton.png",
    price: 45,
    stock: 80,
    expiryDate: "2025-04-20",
    category: "เครื่องดื่ม",
    supplier: "ฟาร์มนมสด",
    minStock: 30,
  },
  {
    id: 4,
    name: "ข้าวสาร 5 กก.",
    image: "/rice-bag.png",
    price: 180,
    stock: 200,
    expiryDate: "2026-01-30",
    category: "อาหารแห้ง",
    supplier: "สหกรณ์ข้าวไทย",
    minStock: 50,
  },
]

export function DataProvider({ children }) {
  const [products, setProducts] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [withdrawalOrders, setWithdrawalOrders] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Load data from localStorage
    const savedProducts = localStorage.getItem("warehouse_products")
    const savedPurchaseOrders = localStorage.getItem("warehouse_purchase_orders")
    const savedWithdrawalOrders = localStorage.getItem("warehouse_withdrawal_orders")
    const savedNotifications = localStorage.getItem("warehouse_notifications")

    setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS)
    setPurchaseOrders(savedPurchaseOrders ? JSON.parse(savedPurchaseOrders) : [])
    setWithdrawalOrders(savedWithdrawalOrders ? JSON.parse(savedWithdrawalOrders) : [])
    setNotifications(savedNotifications ? JSON.parse(savedNotifications) : [])
  }, [])

  useEffect(() => {
    // Save to localStorage whenever data changes
    localStorage.setItem("warehouse_products", JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem("warehouse_purchase_orders", JSON.stringify(purchaseOrders))
  }, [purchaseOrders])

  useEffect(() => {
    localStorage.setItem("warehouse_withdrawal_orders", JSON.stringify(withdrawalOrders))
  }, [withdrawalOrders])

  useEffect(() => {
    localStorage.setItem("warehouse_notifications", JSON.stringify(notifications))
  }, [notifications])

  // Check for expiring products and low stock
  useEffect(() => {
    const checkAlerts = () => {
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      const newNotifications = []

      products.forEach((product) => {
        const expiryDate = new Date(product.expiryDate)

        // Check expiring soon
        if (expiryDate <= thirtyDaysFromNow && expiryDate > today) {
          newNotifications.push({
            id: `expiry-${product.id}-${Date.now()}`,
            type: "warning",
            title: "สินค้าใกล้หมดอายุ",
            message: `${product.name} จะหมดอายุในวันที่ ${product.expiryDate}`,
            productId: product.id,
            timestamp: new Date().toISOString(),
          })
        }

        // Check expired
        if (expiryDate <= today) {
          newNotifications.push({
            id: `expired-${product.id}-${Date.now()}`,
            type: "error",
            title: "สินค้าหมดอายุ",
            message: `${product.name} หมดอายุแล้ว`,
            productId: product.id,
            timestamp: new Date().toISOString(),
          })
        }

        // Check low stock
        if (product.stock <= product.minStock) {
          newNotifications.push({
            id: `lowstock-${product.id}-${Date.now()}`,
            type: "warning",
            title: "สต็อกสินค้าต่ำ",
            message: `${product.name} เหลือเพียง ${product.stock} ชิ้น`,
            productId: product.id,
            timestamp: new Date().toISOString(),
          })
        }
      })

      if (newNotifications.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id))
          const uniqueNew = newNotifications.filter((n) => !existingIds.has(n.id))
          return [...prev, ...uniqueNew]
        })
      }
    }

    if (products.length > 0) {
      checkAlerts()
    }
  }, [products])

  const addPurchaseOrder = (order) => {
    const newOrder = {
      ...order,
      id: Date.now(),
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    setPurchaseOrders((prev) => [...prev, newOrder])
    return newOrder
  }

  const confirmPurchaseOrder = (orderId) => {
    const order = purchaseOrders.find((o) => o.id === orderId)
    if (!order) return

    // Update product stock
    setProducts((prev) =>
      prev.map((product) => {
        const orderItem = order.items.find((item) => item.productId === product.id)
        if (orderItem) {
          return { ...product, stock: product.stock + orderItem.quantity }
        }
        return product
      }),
    )

    // Update order status
    setPurchaseOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "confirmed", confirmedAt: new Date().toISOString() } : o)),
    )
  }

  const addWithdrawalOrder = (order) => {
    const newOrder = {
      ...order,
      id: Date.now(),
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    setWithdrawalOrders((prev) => [...prev, newOrder])
    return newOrder
  }

  const clearNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      stock: Number.parseInt(product.stock) || 0,
      price: Number.parseFloat(product.price) || 0,
      minStock: Number.parseInt(product.minStock) || 10,
    }
    setProducts((prev) => [...prev, newProduct])
    return newProduct
  }

  const editProduct = (productId, updatedData) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              ...updatedData,
              stock: Number.parseInt(updatedData.stock) || product.stock,
              price: Number.parseFloat(updatedData.price) || product.price,
              minStock: Number.parseInt(updatedData.minStock) || product.minStock,
            }
          : product,
      ),
    )
  }

  const confirmWithdrawalOrder = (orderId) => {
    const order = withdrawalOrders.find((o) => o.id === orderId)
    if (!order) return

    setProducts((prev) =>
      prev.map((product) => {
        const orderItem = order.items.find((item) => item.productId === product.id)
        if (orderItem) {
          return { ...product, stock: Math.max(0, product.stock - orderItem.quantity) }
        }
        return product
      }),
    )

    setWithdrawalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "confirmed", confirmedAt: new Date().toISOString() } : o)),
    )
  }

  return (
    <DataContext.Provider
      value={{
        products,
        purchaseOrders,
        withdrawalOrders,
        notifications,
        addPurchaseOrder,
        confirmPurchaseOrder,
        addWithdrawalOrder,
        clearNotification,
        addProduct,
        editProduct,
        confirmWithdrawalOrder,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
