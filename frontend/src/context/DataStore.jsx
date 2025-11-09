"use client"

import { createContext, useContext, useState, useEffect } from "react"

const DataStoreContext = createContext(null)

export function DataStoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]); // เพิ่ม state สำหรับ users
  const [deliveries, setDeliveries] = useState([]);

  // ดึงข้อมูลสินค้าและคำสั่งซื้อจาก Backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/orders");
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    const fetchDeliveries = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/delivery");
        const data = await response.json();
        setDeliveries(data);
      } catch (err) {
        console.error("Error fetching deliveries:", err);
      }
    };

    fetchProducts();
    fetchOrders();
    fetchDeliveries();
  }, []);

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

  const createProduct = async (product) => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("Failed to create product");
      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
    } catch (err) {
      console.error("Error creating product:", err);
      throw err;
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Failed to update product");
      const updatedProduct = await res.json();
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? updatedProduct : product))
      );
    } catch (err) {
      console.error("Error updating product:", err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      throw err;
    }
  };

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

  // อัปเดต productionStatus + deliveryStatus + stock
  const updateOrderStatus = async (orderId, productionStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productionStatus: "พร้อมจัดส่ง" }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      const updatedOrder = await res.json();

      // อัปเดต frontend state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );

      return updatedOrder;
    } catch (err) {
      console.error("Error updating order status:", err);
      throw err;
    }
  };

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

  const updateStock = async (items) => {
    try {
      const res = await fetch("http://localhost:5000/api/products/update-stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }), // ส่งรายการสินค้าที่ต้องการอัปเดต stock
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update stock");
      }

      const updatedProducts = await res.json();
      setProducts(updatedProducts); // อัปเดตข้อมูลสินค้าใน Frontend
    } catch (err) {
      console.error("Error updating stock:", err);
      throw err;
    }
  };

  const decreaseStock = async (items) => {
    try {
      const res = await fetch("http://localhost:5000/api/products/update-stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }), // ส่งรายการสินค้าที่ต้องการลด stock
      });
  
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to decrease stock");
      }
  
      const updatedProducts = await res.json();
      setProducts(updatedProducts); // อัปเดตข้อมูลสินค้าใน Frontend
    } catch (err) {
      console.error("Error decreasing stock:", err);
      throw err;
    }
  };

  const updateDeliveryInfo = async (orderId, trackingNumber, deliveryStatus) => {
    try {
      const response = await fetch("http://localhost:5000/api/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, trackingNumber, deliveryStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update delivery info");
      }

      const updatedOrder = await response.json();

      // ดึงข้อมูลใหม่จาก Backend เพื่ออัปเดต State
      const ordersResponse = await fetch("http://localhost:5000/api/orders");
      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch updated orders");
      }
      const updatedOrders = await ordersResponse.json();
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error updating delivery info:", error);
      throw error;
    }
  };

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
        setUsers,
        createProduct,
        updateProduct,
        deleteProduct,
        setOrders, // เพิ่ม setOrders ใน Provider
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
