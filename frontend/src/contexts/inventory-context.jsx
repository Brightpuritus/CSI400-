"use client"

import { createContext, useContext, useState, useEffect } from "react"

const InventoryContext = createContext(undefined)

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([])

  // โหลดข้อมูลสินค้าเมื่อ mount
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data)
        else setProducts([]) // fallback ถ้า error
      })
      .catch(() => setProducts([]))
  }, [])

  // เพิ่มสินค้า
  const addProduct = async (product) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
    const newProduct = await res.json()
    setProducts(prev => [...prev, newProduct])
  }

  // ลบสินค้า
  const deleteProduct = async (id) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  // แก้ไขสินค้า
  const updateProduct = async (id, updates) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    const updated = await res.json()
    setProducts(prev => prev.map(p => p.id === id ? updated : p))
  }

  // ฟังก์ชันช่วยเหลือ
  function getLowStockProducts(threshold = 10) {
    const safeProducts = Array.isArray(products) ? products : []
    return safeProducts.filter(product => product.quantity <= threshold)
  }
  function getExpiringProducts(days = 30) {
    const now = new Date()
    const thresholdDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    const safeProducts = Array.isArray(products) ? products : []
    return safeProducts.filter(product => {
      if (!product.expiryDate) return false
      const expiry = new Date(product.expiryDate)
      return expiry <= thresholdDate
    })
  }

  return (
    <InventoryContext.Provider value={{
      products,
      addProduct,
      deleteProduct,
      updateProduct,
      getLowStockProducts,
      getExpiringProducts,
    }}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  return useContext(InventoryContext)
}
