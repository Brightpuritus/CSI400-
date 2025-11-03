"use client"

import React, { useEffect, useState } from "react"
import "./Stock.css"

export default function Stock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ imageUrl: "", name: "", price: "", stock: "" })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editingProduct, setEditingProduct] = useState(null) // product being edited
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadProducts()
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

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError("")
    if (!form.name.trim()) return setError("กรุณากรอกชื่อสินค้า")
    try {
      setIsSubmitting(true)
      const body = {
        imageUrl: form.imageUrl.trim(),
        name: form.name.trim(),
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
      }
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "ไม่สามารถเพิ่มสินค้าได้")
      }
      setShowModal(false)
      setForm({ imageUrl: "", name: "", price: "", stock: "" })
      // โหลดข้อมูลใหม่จาก products.json เพื่อให้ตารางอัพเดต
      await loadProducts()
      alert("เพิ่มสินค้าเรียบร้อย")
    } catch (err) {
      console.error(err)
      setError(err.message || "ข้อผิดพลาด")
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditModal(product) {
    setEditingProduct(product)
    setForm({
      imageUrl: product.imageUrl || "",
      name: product.name || "",
      price: product.price || "",
      stock: product.stock || "",
    })
    setShowEditModal(true)
    setError("")
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    setError("")
    if (!editingProduct) return
    if (!form.name.trim()) return setError("กรุณากรอกชื่อสินค้า")
    try {
      setIsSubmitting(true)
      const body = {
        imageUrl: form.imageUrl.trim(),
        name: form.name.trim(),
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
      }
      const res = await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "ไม่สามารถอัปเดตสินค้าได้")
      }
      setShowEditModal(false)
      setEditingProduct(null)
      setForm({ imageUrl: "", name: "", price: "", stock: "" })
      await loadProducts()
      alert("อัปเดตข้อมูลสินค้าเรียบร้อย")
    } catch (err) {
      console.error(err)
      setError(err.message || "ข้อผิดพลาด")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="stock-page">
      <div className="stock-header">
        <h2>สินค้าคงคลัง</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>เพิ่มสินค้าใหม่</button>
      </div>

      {loading ? (
        <div>กำลังโหลด...</div>
      ) : (
        <div className="stock-table-wrap">
          <table className="stock-table">
            <thead>
              <tr><th>รูป</th><th>ชื่อ</th><th>ราคา</th><th>stock</th><th>จัดการ</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="cell-img">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <div className="placeholder">No image</div>}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn-edit" onClick={() => openEditModal(p)}>แก้ไข</button>
                      <button
                        className="btn-delete"
                        onClick={async () => {
                          if (!window.confirm(`ยืนยันการลบ "${p.name}" ?`)) return
                          try {
                            setIsSubmitting(true)
                            const res = await fetch(`http://localhost:5000/api/products/${p.id}`, {
                              method: "DELETE",
                            })
                            if (!res.ok) {
                              const err = await res.json().catch(()=>({}))
                              throw new Error(err.error || "ไม่สามารถลบสินค้าได้")
                            }
                            await loadProducts()
                          } catch (err) {
                            console.error(err)
                            setError(err.message || "ข้อผิดพลาด")
                          } finally {
                            setIsSubmitting(false)
                          }
                        }}
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* create modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>เพิ่มสินค้าใหม่</h3>
            <form onSubmit={handleCreate} className="modal-form">
              <label>รูปภาพ (URL)
                <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://..." />
              </label>
              <label>ชื่อ
                <input name="name" value={form.name} onChange={onChange} required />
              </label>
              <label>ราคา
                <input name="price" type="number" value={form.price} onChange={onChange} />
              </label>
              <label>stock
                <input name="stock" type="number" value={form.stock} onChange={onChange} />
              </label>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn-confirm" disabled={isSubmitting}>
                  {isSubmitting ? "กำลังเพิ่ม..." : "ยืนยันเพิ่ม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* edit modal */}
      {showEditModal && editingProduct && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>แก้ไขสินค้า</h3>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <label>รูปภาพ (URL)
                <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://..." />
              </label>
              <label>ชื่อ
                <input name="name" value={form.name} onChange={onChange} required />
              </label>
              <label>ราคา
                <input name="price" type="number" value={form.price} onChange={onChange} />
              </label>
              <label>stock
                <input name="stock" type="number" value={form.stock} onChange={onChange} />
              </label>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn-confirm" disabled={isSubmitting}>
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}