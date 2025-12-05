"use client"

import { lazy } from 'react'

// Lazy load the layout components to avoid SSR issues
const LayoutLight = lazy(() => import('@/components/themes/light/LayoutLight'))
const LayoutModern = lazy(() => import('@/components/themes/modern/LayoutModern'))
const LayoutAcernity = lazy(() => import('@/components/themes/acernity/LayoutAcernity'))

// Layout components mapping (client-side only)
export const layouts = {
  LayoutLight,
  LayoutModern,
  LayoutAcernity,
} as const

// Helper function to get layout component (client-side only)
export function getLayoutComponent(layoutName: string) {
  return layouts[layoutName as keyof typeof layouts] || LayoutLight
}
