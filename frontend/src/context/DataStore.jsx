"use client"

import { createContext, useContext, useState, useEffect } from "react"

const DataStoreContext = createContext(null)

export function DataStoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])

  // ดึงข้อมูลสินค้าและคำสั่งซื้อจาก Backend
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("http://localhost:5000/api/products")
      const data = await response.json()
      setProducts(data)
    }

    const fetchOrders = async () => {
      const response = await fetch("http://localhost:5000/api/orders")
      const data = await response.json()
      setOrders(data)
    }

    fetchProducts()
    fetchOrders()
  }, [])

  const addOrder = async (order) => {
    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
    const newOrder = await response.json()
    setOrders((prevOrders) => [...prevOrders, newOrder])
    return newOrder
  }

  const updateOrderStatus = async (orderId, status) => {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const updatedOrder = await response.json()
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
    )
  }

  const updateProductionStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productionStatus: status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update production status")
      }

      const updatedOrder = await response.json()
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      )
    } catch (error) {
      console.error("Error updating production status:", error)
    }
  }

  const updateDeliveryInfo = async (orderId, trackingNumber, deliveryStatus) => {
    try {
      const response = await fetch("http://localhost:5000/api/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, trackingNumber, deliveryStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update delivery info")
      }

      const updatedOrder = await response.json()
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      )
    } catch (error) {
      console.error("Error updating delivery info:", error)
    }
  }

  return (
    <DataStoreContext.Provider
      value={{
        products,
        orders,
        addOrder,
        updateOrderStatus,
        updateProductionStatus,
        updateDeliveryInfo,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (!context) {
    throw new Error("useDataStore must be used within DataStoreProvider")
  }
  return context
}
