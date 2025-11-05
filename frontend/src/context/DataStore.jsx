"use client"

import { createContext, useContext, useState, useEffect } from "react"

const DataStoreContext = createContext(null)

export function DataStoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // เพิ่ม state สำหรับ users

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

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

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

  // DataStore.jsx
  const FLOW = ["รอเริ่มผลิต", "กำลังผลิต", "บรรจุกระป๋อง", "พร้อมจัดส่ง"]

  async function updateProductionStatus(orderId, nextStatus) {
    try {
      console.log("Updating production status for order:", orderId, "to:", nextStatus);
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productionStatus: nextStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update production status");
      }

      const updatedOrder = await response.json();

      // เพิ่มสินค้าใน stock เมื่อเปลี่ยนเป็น "พร้อมจัดส่ง"
      if (nextStatus === "พร้อมจัดส่ง" && updatedOrder.productionStatus === "บรรจุกระป๋อง") {
        for (const item of updatedOrder.items) {
          await updateStock(item.productId, item.quantity);
        }
      }

      // อัปเดตคำสั่งซื้อใน Frontend
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );
    } catch (error) {
      console.error("Error updating production status:", error);
    }
  }

  async function updateStock(productId, quantity) {
    try {
      console.log("Updating stock for product:", productId, "with quantity:", quantity);
      const res = await fetch("http://localhost:5000/api/products/update-stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }), // ส่งข้อมูลในรูปแบบ JSON
      });

      if (!res.ok) {
        throw new Error("Failed to update stock");
      }

      const updatedProduct = await res.json();

      // อัปเดต stock ใน Frontend
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
    } catch (err) {
      console.error("Error updating stock:", err);
    }
  }

  async function decreaseStock(orderItems) {
    try {
      for (const item of orderItems) {
        console.log(`Decreasing stock for product: ${item.productId}, quantity: ${item.quantity}`);
        const res = await fetch("http://localhost:5000/api/products/update-stock", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId, quantity: -item.quantity }), // ใช้ค่าลบเพื่อลด stock
        });

        if (!res.ok) {
          throw new Error(`Failed to decrease stock for product ${item.productId}`);
        }

        const updatedProduct = await res.json();

        // อัปเดต stock ใน Frontend
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          )
        );
      }
    } catch (err) {
      console.error("Error decreasing stock:", err);
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

  const updatePaymentStatus = async (orderId, paymentStatus, paymentProof) => {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/payment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus, paymentProof }),
    })
    const updatedOrder = await response.json()
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
    )
  }

  const confirmPayment = async (orderId, paymentStatus) => {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/confirm-payment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    })
    const updatedOrder = await response.json()
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
    )
  }

  async function updateUserRole(email, newRole) {
    try {
      const res = await fetch("http://localhost:5000/api/users/update-role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to update user role");
      }
  
      const updatedUser = await res.json();
  
      // อัปเดต users ใน Frontend
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === updatedUser.email ? updatedUser : user
        )
      );
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  }


  async function deleteUser(email) {
    try {
      const res = await fetch(`http://localhost:5000/api/users/delete/${email}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      // อัปเดต users ใน Frontend
      setUsers((prevUsers) => prevUsers.filter((user) => user.email !== email));
    } catch (err) {
      console.error("Error deleting user:", err);
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
        updatePaymentStatus,
        confirmPayment,
        updateStock, // ตรวจสอบว่าถูกส่งออกใน Provider
        loadProducts,
        decreaseStock,
        updateUserRole,
        deleteUser,
        users,
        setUsers
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
