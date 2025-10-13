"use client"

import React, { useState, useEffect } from "react"
import { useInventory } from "../contexts/inventory-context"
import styles from "./product-dialog.module.css"

export function ProductDialog({ open, onClose, product, mode = "add" }) {
  const { addProduct, updateProduct, deleteProduct } = useInventory()
  const isEdit = mode === "edit"
  const isView = mode === "view"

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    unit: "",
    minStock: "",
    expiryDate: "",
    image: "",
  })

  useEffect(() => {
    if (product && (isEdit || isView)) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price?.toString() || "",
        quantity: product.quantity?.toString() || "",
        unit: product.unit || "",
        minStock: product.minStock?.toString() || "",
        expiryDate: product.expiryDate || "",
        image: product.image || "",
      })
    } else if (mode === "add") {
      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        quantity: "",
        unit: "",
        minStock: "",
        expiryDate: "",
        image: "",
      })
    }
  }, [product, mode, open])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const productData = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number.parseFloat(form.price),
      quantity: Number.parseInt(form.quantity),
      unit: form.unit,
      minStock: Number.parseInt(form.minStock),
      expiryDate: form.expiryDate,
      image: form.image,
    }
    if (mode === "add") {
      await addProduct(productData)
    } else if (isEdit && product) {
      await updateProduct(product.id, productData)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (product && window.confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) {
      await deleteProduct(product.id)
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className={styles.dialogBackdrop} onClick={onClose}>
      <form className={styles.dialogContent} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>
          {mode === "add"
            ? "เพิ่มสินค้าใหม่"
            : isEdit
            ? "แก้ไขสินค้า"
            : "รายละเอียดสินค้า"}
        </h2>
        <div className={styles.grid}>
          <div className={styles.colSpan2}>
            <label htmlFor="name">ชื่อสินค้า</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isView}
              required
            />
          </div>
          <div className={styles.colSpan2}>
            <label htmlFor="description">รายละเอียด</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={isView}
              rows={3}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category">หมวดหมู่</label>
            <input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={isView}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="price">ราคา (บาท)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              disabled={isView}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="quantity">จำนวน</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              disabled={isView}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="unit">หน่วย</label>
            <input
              id="unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              disabled={isView}
              placeholder="ชิ้น, กล่อง, ขวด"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="minStock">สต็อกขั้นต่ำ</label>
            <input
              id="minStock"
              name="minStock"
              type="number"
              value={form.minStock}
              onChange={handleChange}
              disabled={isView}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="expiryDate">วันหมดอายุ</label>
            <input
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={handleChange}
              disabled={isView}
              required
            />
          </div>
          <div className={styles.colSpan2}>
            <label htmlFor="image">URL รูปภาพ</label>
            <input
              id="image"
              name="image"
              value={form.image}
              onChange={handleChange}
              disabled={isView}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
        <div className={styles.footer}>
          {isView && (
            <>
              <button type="button" className={styles.deleteButton} onClick={handleDelete}>
                ลบสินค้า
              </button>
              <button type="button" onClick={onClose}>
                ปิด
              </button>
            </>
          )}
          {isEdit && (
            <>
              <button type="button" onClick={onClose}>
                ยกเลิก
              </button>
              <button type="submit" className={styles.saveButton}>
                บันทึก
              </button>
            </>
          )}
          {mode === "add" && (
            <>
              <button type="button" onClick={onClose}>
                ยกเลิก
              </button>
              <button type="submit" className={styles.saveButton}>
                เพิ่มสินค้า
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
