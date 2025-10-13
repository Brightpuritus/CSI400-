"use client"

import { Calendar, Package, Pencil, Trash2 } from "lucide-react"
import styles from "./product-card.module.css"
import { useInventory } from "../contexts/inventory-context"

export function ProductCard({ product, onClick, onEdit }) {
  const isLowStock = product.quantity <= product.minStock
  const isExpiringSoon = new Date(product.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const isExpired = new Date(product.expiryDate) < new Date()
  const { deleteProduct } = useInventory()

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageContainer}>
        {product.image ? (
          <img src={product.image || "/placeholder.svg"} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Package className={styles.placeholderIcon} />
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{product.name}</h3>
          {isLowStock && <span className={`${styles.badge} ${styles.badgeLowStock}`}>สต็อกต่ำ</span>}
        </div>

        <p className={styles.description}>{product.description}</p>

        <div className={styles.priceRow}>
          <div>
            <p className={styles.price}>฿{product.price.toLocaleString()}</p>
            <p className={styles.stock}>
              คงเหลือ: {product.quantity} {product.unit}
            </p>
          </div>
        </div>

        <div className={styles.expiryRow}>
          <Calendar className={styles.expiryIcon} />
          <span
            className={
              isExpired ? styles.expiryExpired : isExpiringSoon ? styles.expiryExpiringSoon : styles.expiryNormal
            }
          >
            {isExpired ? "หมดอายุแล้ว" : isExpiringSoon ? "ใกล้หมดอายุ" : "หมดอายุ"}:{" "}
            {new Date(product.expiryDate).toLocaleDateString("th-TH")}
          </span>
        </div>

        {/* เพิ่มปุ่มแก้ไข/ลบ */}
        <div className={styles.actionRow}>
          <button
            className={styles.editButton}
            onClick={e => {
              e.stopPropagation()
              if (onEdit) onEdit(product)
            }}
            title="แก้ไข"
          >
            <Pencil size={18} />
          </button>
          <button
            className={styles.deleteButton}
            onClick={e => {
              e.stopPropagation()
              if (window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) deleteProduct(product.id)
            }}
            title="ลบ"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
