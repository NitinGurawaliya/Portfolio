import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS classes को merge करता है
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Toast configuration - Success toast के लिए default style
 */
export const successToastConfig = {
  duration: 3000,
  position: "top-left" as const,
  style: {
    background: "#f97316",
    color: "#fff",
    fontWeight: "500",
    border: "1px solid #ea580c",
    borderRadius: "8px",
  },
  iconTheme: {
    primary: "#fff",
    secondary: "#f97316",
  },
}

/**
 * Toast configuration - Error toast के लिए default style
 */
export const errorToastConfig = {
  duration: 3000,
  position: "top-left" as const,
  style: {
    background: "#dc2626",
    color: "#fff",
    fontWeight: "500",
    border: "1px solid #b91c1c",
    borderRadius: "8px",
  },
}
