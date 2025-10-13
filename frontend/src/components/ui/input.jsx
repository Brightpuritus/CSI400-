import * as React from "react"
import styles from "./input.module.css"

const Input = React.forwardRef(({ className = "", type, ...props }, ref) => {
  return <input type={type} className={`${styles.input} ${className}`} ref={ref} {...props} />
})
Input.displayName = "Input"

export { Input }
