"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useDataStore } from "../context/DataStore"
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react"
import "./NewOrder.css"

function NewOrder() {
  const { user } = useAuth()
  const { products, addOrder } = useDataStore()
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("") // เพิ่ม state ที่อยู่

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.productId === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          size: product.size,
          price: product.price,
          quantity: 1,
        },
      ])
    }
  }

  const updateQuantity = (productId, change) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const vat = subtotal * 0.07
  const total = subtotal + vat

  const handleSubmit = (e) => {
    e.preventDefault()
    if (cart.length === 0) {
      alert("กรุณาเพิ่มสินค้าลงตะกร้า")
      return
    }
    if (!deliveryDate) {
      alert("กรุณาเลือกวันที่ต้องการรับสินค้า")
      return
    }
    if (!deliveryAddress.trim()) {
      alert("กรุณากรอกที่อยู่จัดส่ง")
      return
    }

    addOrder({
      customerId: user.id,
      customerName: user.name,
      items: cart,
      subtotal,
      vat,
      totalWithVat: total,
      deliveryDate,
      deliveryAddress, // ส่งที่อยู่ไปด้วย
      productionStatus: "รอเริ่มผลิต",
    })

    alert("สั่งซื้อสำเร็จ!")
    navigate("/customer/orders")
  }

  return (
    <div className="page-container">
      <button onClick={() => navigate("/customer/orders")} className="back-button">
        <ArrowLeft size={20} />
        กลับ
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">สั่งซื้อสินค้าใหม่</h1>
          <p className="page-subtitle">เลือกสินค้าที่ต้องการสั่งซื้อ</p>
        </div>
      </div>

      <div className="new-order-layout">
        <div className="products-section">
          <h2 className="section-title">สินค้าทั้งหมด</h2>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image || "/placeholder.svg"} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-size">{product.size}</p>
                  <div className="product-footer">
                    <span className="product-price">฿{product.price}</span>
                    <button onClick={() => addToCart(product)} className="btn btn-secondary btn-sm">
                      <Plus size={16} />
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <div className="cart-sticky">
            <h2 className="section-title">
              <ShoppingCart size={24} />
              ตะกร้าสินค้า
            </h2>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <p>ยังไม่มีสินค้าในตะกร้า</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.productId} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.productName}</div>
                        <div className="cart-item-size">{item.size}</div>
                        <div className="cart-item-price">฿{item.price}</div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="quantity-btn">
                            <Minus size={14} />
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} className="quantity-btn">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="remove-btn">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="summary-row">
                    <span>ยอดรวม</span>
                    <span>฿{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>VAT 7%</span>
                    <span>฿{vat.toLocaleString()}</span>
                  </div>
                  <div className="summary-row summary-total">
                    <span>รวมทั้งสิ้น</span>
                    <span>฿{total.toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="order-form">
                  <div className="form-group">
                    <label htmlFor="deliveryDate" className="form-label">
                      วันที่ต้องการรับสินค้า
                    </label>
                    <input
                      id="deliveryDate"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="form-input"
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="deliveryAddress" className="form-label">
                      ที่อยู่จัดส่ง
                    </label>
                    <textarea
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="form-input"
                      rows={3}
                      placeholder="ชื่อผู้รับ, ที่อยู่, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์, เบอร์โทร"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full">
                    ยืนยันการสั่งซื้อ
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewOrder
