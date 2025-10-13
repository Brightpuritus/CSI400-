"use client"

import { createContext, useContext, useState, useEffect } from "react"

const InventoryContext = createContext(undefined)

const INITIAL_PRODUCTS = [
  {
    id: "1",
    name: "ขวดน้ำรีไซเคิล",
    description: "ขวดน้ำที่เป็นมิตรกับสิ่งแวดล้อม",
    category: "เครื่องใช้",
    quantity: 150,
    minStockLevel: 50,
    price: 250,
    unit: "ชิ้น",
    expirationDate: "2026-12-31",
    imageUrl: "/reusable-water-bottle.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "ขนมปังโฮลวีท",
    description: "ขนมปังโฮลวีทสดใหม่",
    category: "อาหาร",
    quantity: 30,
    minStockLevel: 20,
    price: 45,
    unit: "ก้อน",
    expirationDate: "2025-02-15",
    imageUrl: "/rustic-bread-loaf.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "นมสด",
    description: "นมสดพาสเจอร์ไรส์",
    category: "อาหาร",
    quantity: 45,
    minStockLevel: 30,
    price: 52,
    unit: "กล่อง",
    expirationDate: "2025-01-25",
    imageUrl: "/milk-carton.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([])

  // Load products from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("products")
    if (stored) {
      setProducts(JSON.parse(stored))
    } else {
      setProducts(INITIAL_PRODUCTS)
      localStorage.setItem("products", JSON.stringify(INITIAL_PRODUCTS))
    }
  }, [])

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("products", JSON.stringify(products))
    }
  }, [products])

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
    )
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const getProduct = (id) => {
    return products.find((p) => p.id === id)
  }

  const getLowStockProducts = () => {
    return products.filter((p) => p.quantity <= p.minStockLevel)
  }

  const getExpiringProducts = (days) => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return products.filter((p) => {
      const expDate = new Date(p.expirationDate)
      return expDate <= futureDate && expDate > new Date()
    })
  }

  return (
    <InventoryContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        getLowStockProducts,
        getExpiringProducts,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider")
  }
  return context
}
