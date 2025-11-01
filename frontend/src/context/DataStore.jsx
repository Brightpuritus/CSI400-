"use client"

import { createContext, useContext, useState, useEffect } from "react"

const DataStoreContext = createContext(null)

const initialProducts = [
  { id: 1, name: "ปลาทูน่าในน้ำมัน", size: "185g", price: 45, image: "/tuna-can.jpg" },
  { id: 2, name: "ปลาซาร์ดีนในซอสมะเขือเทศ", size: "155g", price: 35, image: "/sardine-can.jpg" },
  { id: 3, name: "ปลาแมคเคอเรลในซอสมะเขือเทศ", size: "155g", price: 30, image: "/mackerel-can.jpg" },
  { id: 4, name: "ปลาทูน่าสไลด์", size: "185g", price: 50, image: "/tuna-slice-can.jpg" },
  { id: 5, name: "ปลาซาร์ดีนในน้ำมัน", size: "125g", price: 32, image: "/sardine-oil-can.jpg" },
  { id: 6, name: "ปลาทูน่าชิ้นใหญ่", size: "185g", price: 55, image: "/tuna-chunk-can.jpg" },
]

export function DataStoreProvider({ children }) {
  const [products] = useState(initialProducts)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const storedOrders = localStorage.getItem("orders")
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }
  }, [])

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: orders.length + 1,
      orderDate: new Date().toISOString(),
      status: "รอดำเนินการ",
      productionStatus: "รอเริ่มผลิต",
      deliveryStatus: null,
      trackingNumber: null,
      subtotal: order.subtotal, // Ensure subtotal is stored
      vat: order.vat,         // Ensure VAT is stored
      totalWithVat: order.totalWithVat, // Ensure total with VAT is stored
    }
    const updatedOrders = [...orders, newOrder]
    setOrders(updatedOrders)
    localStorage.setItem("orders", JSON.stringify(updatedOrders))
    return newOrder
  }

  const updateOrderStatus = (orderId, status) => {
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status } : order))
    setOrders(updatedOrders)
    localStorage.setItem("orders", JSON.stringify(updatedOrders))
  }

  const updateProductionStatus = (orderId, productionStatus) => {
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, productionStatus } : order))
    setOrders(updatedOrders)
    localStorage.setItem("orders", JSON.stringify(updatedOrders))
  }

  const updateDeliveryInfo = (orderId, trackingNumber, deliveryStatus) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        // If delivery is successful, also update the main order status to completed
        const newStatus = deliveryStatus === "จัดส่งสำเร็จ" ? "เสร็จสิ้น" : order.status
        return {
          ...order,
          trackingNumber,
          deliveryStatus,
          status: newStatus,
        }
      }
      return order
    })
    setOrders(updatedOrders)
    localStorage.setItem("orders", JSON.stringify(updatedOrders))
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
