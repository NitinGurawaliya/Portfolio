"use client"

import { lazy } from 'react'

// Lazy load the layout components to avoid SSR issues
const LayoutDark = lazy(() => import('@/components/themes/dark/LayoutDark'))
const LayoutLight = lazy(() => import('@/components/themes/light/LayoutLight'))

// Layout components mapping (client-side only)
export const layouts = {
  LayoutDark,
  LayoutLight
} as const

// Helper function to get layout component (client-side only)
export function getLayoutComponent(layoutName: string) {
  return layouts[layoutName as keyof typeof layouts] || LayoutDark
}
