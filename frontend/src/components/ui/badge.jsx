import styles from "./badge.module.css"

function Badge({ className = "", variant = "default", ...props }) {
  const variantClass = styles[variant] || styles.default
  return <div className={`${styles.badge} ${variantClass} ${className}`} {...props} />
}

export { Badge }

