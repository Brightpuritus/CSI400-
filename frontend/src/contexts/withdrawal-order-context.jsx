"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from 'axios'

const WithdrawalOrderContext = createContext(undefined)

export function WithdrawalOrderProvider({ children }) {
  const [withdrawalOrders, setWithdrawalOrders] = useState([])
  const [products, setProducts] = useState({})

  useEffect(() => {
    loadProducts()
    loadWithdrawalOrders()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products')
      const productsMap = {}
      response.data.forEach(product => {
        productsMap[product.id] = product.name
      })
      setProducts(productsMap)
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const loadWithdrawalOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/withdrawal-orders')
      if (response.data && response.data.withdrawalOrders) {
        setWithdrawalOrders(response.data.withdrawalOrders)
      }
    } catch (error) {
      console.error('Failed to load withdrawal orders:', error)
    }
  }

  const createWithdrawalOrder = async (orderData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/withdrawal-orders', {
        ...orderData,
        items: orderData.items.map(item => ({
          productId: item.productId,
          productName: products[item.productId], // Add product name
          quantity: parseInt(item.quantity)
        }))
      })
      
      if (response.data) {
        setWithdrawalOrders(prev => [...prev, response.data])
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to create withdrawal order:', error)
      return false
    }
  }

  const confirmWithdrawalOrder = async (orderId, confirmedBy) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/withdrawal-orders/${orderId}/confirm`, {
        confirmedBy
      })
      
      if (response.data) {
        setWithdrawalOrders(prev => 
          prev.map(order => order.id === orderId ? response.data : order)
        )
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to confirm withdrawal order:', error)
      return false
    }
  }

  return (
    <WithdrawalOrderContext.Provider value={{
      withdrawalOrders,
      createWithdrawalOrder,
      confirmWithdrawalOrder,
      products // Add products to context
    }}>
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
