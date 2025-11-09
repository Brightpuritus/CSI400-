"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDataStore } from "../context/DataStore";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import "./NewOrder.css";

const CASE_SIZE = 24; // 1 ลัง มีกี่กระป๋อง
const MIN_CASES = 10; // ขั้นต่ำเป็นจำนวน "ลัง"
const MIN_TOTAL_BAHT = 0; // หรือขั้นต่ำเป็นยอดเงิน (0 = ไม่ใช้)
const PICKUP_TEXT = "รับด้วยตนเอง";

function NewOrder() {
  const { user } = useAuth();
  const { addOrder } = useDataStore(); // เก็บ addOrder ไว้เหมือนเดิม
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  // store previous typed address so we can restore when unchecking pickup
  const [prevAddress, setPrevAddress] = useState("");
  // new: pickup checkbox state
  const [isPickup, setIsPickup] = useState(false);

  const [customerPhone, setCustomerPhone] = useState("");
  const [companyPhone, setCompanyPhone] = useState("02-000-0000"); // เปลี่ยนได้

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      setLoadingProducts(true);
      // พยายามเรียกแบบ relative ก่อน แล้ว fallback ไปที่พอร์ตที่เป็นไปได้
      const urls = [
        "/api/products",
        "http://localhost:5000/api/products",
        "http://localhost:4000/api/products",
      ];
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (mounted) {
            setProducts(Array.isArray(data) ? data : []);
            setLoadingProducts(false);
          }
          return;
        } catch (e) {
          // try next
        }
      }
      if (mounted) {
        setProducts([]);
        setLoadingProducts(false);
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          // ใช้หน่วย "ลัง" เสมอ และคิดราคา/ลัง
          unit: "ลัง",
          packSize: product.packSize || CASE_SIZE, // จำนวนกระป๋องต่อ 1 ลัง (ถ้ามีในสินค้า)
          pricePerCan: product.price || 0, // เก็บราคา/กระป๋องไว้ด้วย
          price: (product.price || 0) * (product.packSize || CASE_SIZE), // ราคา/ลัง
          quantity: 1, // เริ่มต้น 1 ลัง แล้วให้ผู้ใช้กรอกปรับทีหลังได้
        },
      ]);
    }
  };

  const updateQty = (productId, nextQty) => {
    const q = Math.max(0, Number.isFinite(nextQty) ? Math.floor(nextQty) : 0);
    // ถ้าใส่ 0 ให้ลบออกจากตะกร้า
    if (q === 0) {
      setCart(cart.filter((i) => i.productId !== productId));
      return;
    }
    setCart(
      cart.map((i) => (i.productId === productId ? { ...i, quantity: q } : i))
    );
  };

  const updateQuantity = (productId, change) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ); // ราคาเป็นต่อ "ลัง"
  const vat = subtotal * 0.07;
  const total = subtotal + vat;
  const deposit = total * 0.3; // มัดจำ 30%

  // when toggling pickup checkbox
  const handleTogglePickup = (checked) => {
    setIsPickup(checked);
    if (checked) {
      // save previous typed address and set deliveryAddress to pickup text
      setPrevAddress(deliveryAddress || "");
      setDeliveryAddress(PICKUP_TEXT);
    } else {
      // restore previous address
      setDeliveryAddress(prevAddress || "");
    }
  };

   const showPopupMessage = (msg) => {
   setPopupMessage(msg);
   setShowPopup(true);
   setTimeout(() => setShowPopup(false), 2500); // ปิดอัตโนมัติใน 2.5 วิ
 };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("กรุณาเพิ่มสินค้าลงตะกร้า");
      return;
    }
    // ตรวจขั้นต่ำ (แบบจำนวนลัง)
    const totalCases = cart.reduce((s, i) => s + i.quantity, 0);
    if (totalCases < MIN_CASES) {
      showPopupMessage(`ขั้นต่ำ ${MIN_CASES} ลัง (คุณเลือก ${totalCases} ลัง)`);
      return;
    }

    // ตรวจขั้นต่ำ (แบบยอดเงิน)
    if (MIN_TOTAL_BAHT > 0 && total < MIN_TOTAL_BAHT) {
      alert(`ยอดสั่งซื้อขั้นต่ำ ฿${MIN_TOTAL_BAHT.toLocaleString()}`);
      return;
    }
    if (!deliveryDate) {
      alert("กรุณาเลือกวันที่ต้องการรับสินค้า");
      return;
    }
    if (!deliveryAddress.trim()) {
      alert("กรุณากรอกที่อยู่จัดส่ง");
      return;
    }
    if (!customerPhone.trim()) {
      alert("กรุณากรอกเบอร์โทรลูกค้า");
      return;
    }

    // ensure deliveryAddress is pickup text when isPickup true
    const finalAddress = isPickup ? PICKUP_TEXT : deliveryAddress;

    addOrder({
      customerId: user?.id,
      customerName: user?.name,
      items: cart,
      subtotal,
      vat,
      totalWithVat: total,
      depositAmount: deposit,
      deliveryDate,
      deliveryAddress: finalAddress,
      customerPhone,
      companyPhone,
      paymentStatus: "ยังไม่ได้ชำระเงิน", // เพิ่มสถานะเริ่มต้น
      productionStatus: "รอเริ่มผลิต",
    });
    
    alert("สั่งซื้อสำเร็จ!");
    navigate("/customer/orders");
  };

  return (
    <div className="page-container">
      <button
        onClick={() => navigate("/customer/orders")}
        className="back-button"
      >
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
            {loadingProducts ? (
              <div>กำลังโหลดสินค้า...</div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="product-card">
                  <img
                    src={
                      product.imageUrl || product.image || "/placeholder.svg"
                    }
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-size">
                      1 ลัง = {product.packSize || CASE_SIZE} กระป๋อง
                    </p>
                    <div className="product-footer">
                      <span className="product-price">฿{product.price}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Plus size={16} />
                        เพิ่ม
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                        <div className="cart-item-price">
                          ฿{item.price} / ลัง
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            (1 ลัง = {item.packSize || CASE_SIZE} กระป๋อง, ฿
                            {item.pricePerCan}/กระป๋อง)
                          </div>
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <div
                          className="quantity-controls"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="quantity-btn"
                          >
                            <Minus size={14} />
                          </button>

                          <input
                            type="number"
                            min={1}
                            step={1}
                            value={item.quantity}
                            onChange={(e) =>
                              setCart((prev) =>
                                prev.map((p) =>
                                  p.productId === item.productId
                                    ? {
                                        ...p,
                                        quantity: Math.max(
                                          1,
                                          Number(e.target.value) || 1
                                        ),
                                      }
                                    : p
                                )
                              )
                            }
                            style={{
                              width: 70,
                              textAlign: "center",
                              padding: "4px 6px",
                              border: "1px solid #ccc",
                              borderRadius: 6,
                            }}
                          />

                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="quantity-btn"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="remove-btn"
                        >
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
                    <label className="form-label">เบอร์โทรลูกค้า</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="form-input"
                      placeholder="เช่น 08x-xxx-xxxx"
                      required
                    />
                  </div>
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

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isPickup}
                          onChange={(e) => handleTogglePickup(e.target.checked)}
                        />
                        รับด้วยตนเอง
                      </label>
                    </div>

                    <textarea
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        // keep prevAddress in sync when user types and not pickup
                        if (!isPickup) setPrevAddress(e.target.value);
                      }}
                      className="form-input"
                      rows={3}
                      placeholder="ชื่อผู้รับ, ที่อยู่, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์, เบอร์โทร"
                      required={!isPickup}
                      disabled={isPickup}
                    />
                  </div>

                  <div style={{ marginTop: 8, fontSize: 13 }}>
                    * หน่วยการสั่งซื้อเป็น “ลัง” — 1 ลัง = {CASE_SIZE} กระป๋อง
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13 }}>
                    เบอร์ติดต่อบริษัท: {companyPhone}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    style={{ marginTop: 12 }}
                  >
                    ยืนยันการสั่งซื้อ
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      {showPopup && (
  <div className="popup-overlay">
    <div className="popup-box">
      <p>{popupMessage}</p>
    </div>
  </div>
)}
    </div>
  );
}

export default NewOrder;
