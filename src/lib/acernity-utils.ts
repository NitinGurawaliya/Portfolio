/**
 * Acernity UI components के लिए utility functions
 * ये functions Acernity UI components में commonly use होते हैं
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind classes को merge करता है
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gradient background utilities
 */
export const gradients = {
  primary: "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500",
  secondary: "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500",
  accent: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
  dark: "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
};

/**
 * Border radius utilities
 */
export const borderRadius = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

/**
 * Animation delay utilities
 */
export const getAnimationDelay = (index: number, baseDelay: number = 0.1) => {
  return {
    animationDelay: `${index * baseDelay}s`,
  };
};

/**
 * Text gradient utility
 */
export const textGradient = (from: string, via: string, to: string) => {
  return `bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent`;
};

/**
 * Container utility for Acernity UI components
 */
export const containerClass = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/**
 * Section padding utility
 */
export const sectionPadding = "py-12 md:py-16 lg:py-20";

