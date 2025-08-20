
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800", // Base styling
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styling
      "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
      // Inactive state
      "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
      // Active state
      "data-[state=active]:bg-white data-[state=active]:text-gray-900",
      "data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900",
      // Focus state
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }