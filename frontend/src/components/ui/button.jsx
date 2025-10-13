import * as React from "react"
import styles from "./button.module.css"

const Button = React.forwardRef(({ className = "", variant = "default", size = "default", ...props }, ref) => {
  const variantClass = styles[variant] || styles.default
  const sizeClass = size === "default" ? styles["default-size"] : styles[size]

  return <button className={`${styles.button} ${variantClass} ${sizeClass} ${className}`} ref={ref} {...props} />
})
Button.displayName = "Button"

export { Button }
