"use client";

import React, { useEffect, useState } from "react";
import "./Stock.css";
import { useDataStore } from "../context/DataStore";

export default function Stock() {
  const { products, loadProducts, createProduct, updateProduct, deleteProduct } = useDataStore();
  const [form, setForm] = useState({ imageUrl: "", name: "", price: "", stock: "", packSize: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts(); // โหลดสินค้าทั้งหมดเมื่อหน้าโหลด
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setIsSubmitting(true);
      await createProduct(form); // เรียกใช้ฟังก์ชันจาก DataStore
      setShowModal(false);
      setForm({ imageUrl: "", name: "", price: "", stock: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "ข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!editingProduct) return;
    try {
      setIsSubmitting(true);
      await updateProduct(editingProduct.id, form); // เรียกใช้ฟังก์ชันจาก DataStore
      setShowEditModal(false);
      setEditingProduct(null);
      setForm({ imageUrl: "", name: "", price: "", stock: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "ข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("ยืนยันการลบสินค้านี้หรือไม่?")) return;
    try {
      setIsSubmitting(true);
      await deleteProduct(productId); // เรียกใช้ฟังก์ชันจาก DataStore
    } catch (err) {
      console.error(err);
      setError(err.message || "ข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stock-page">
      <div className="stock-header">
        <h2>สินค้าคงคลัง</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>เพิ่มสินค้าใหม่</button>
      </div>

      {products.length === 0 ? (
        <div>ไม่มีสินค้าในระบบ</div>
      ) : (
        <div className="stock-table-wrap">
          <table className="stock-table">
            <thead>
              <tr>
                <th>รูป</th>
                <th>ชื่อ</th>
                <th>ราคา</th>
                <th>stock</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="cell-img">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <div className="placeholder">No image</div>}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-edit" onClick={() => {
                        setEditingProduct(p);
                        setForm({ ...p, stock: p.stock }); // ensure stock present
                        setShowEditModal(true);
                      }}>แก้ไข</button>
                      <button className="btn-delete" onClick={() => handleDelete(p.id)}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal สำหรับเพิ่มสินค้า */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>เพิ่มสินค้าใหม่</h3>
            <form onSubmit={handleCreate}>
              <label>ชื่อสินค้า</label>
              <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <label>ราคา</label>
              <input name="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <label>จำนวนในสต็อก</label>
              <input name="stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
              <label>จำนวนต่อ 1 ลัง (กระป๋อง)</label>
              <input name="packSize" type="number" value={form.packSize} onChange={(e) => setForm({ ...form, packSize: e.target.value })} placeholder="เช่น 24" />
              <label>URL รูปภาพ</label>
              <input name="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <button type="submit" disabled={isSubmitting}>ยืนยัน</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal สำหรับแก้ไขสินค้า */}
      {showEditModal && editingProduct && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>แก้ไขสินค้า</h3>
            <form onSubmit={handleEditSubmit}>
              <label>ชื่อสินค้า</label>
              <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <label>ราคา</label>
              <input name="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <label>จำนวนในสต็อก</label>
              <input name="stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
              <label>จำนวนต่อ 1 ลัง (กระป๋อง)</label>
              <input name="packSize" type="number" value={form.packSize} onChange={(e) => setForm({ ...form, packSize: e.target.value })} placeholder="เช่น 24" />
              <label>URL รูปภาพ</label>
              <input name="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <button type="submit" disabled={isSubmitting}>ยืนยัน</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}