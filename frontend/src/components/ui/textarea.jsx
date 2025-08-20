
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles
        "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm",
        // Border and background
        "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
        // Text and placeholder
        "text-gray-900 placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400",
        // Focus state (replacing default yellow)
        "focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }