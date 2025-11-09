"use client"

import { lazy } from 'react'

// Lazy load the layout components to avoid SSR issues
const LayoutDark = lazy(() => import('@/components/themes/dark/LayoutDark'))
const LayoutLight = lazy(() => import('@/components/themes/light/LayoutLight'))
const LayoutModern = lazy(() => import('@/components/themes/modern/LayoutModern'))
const LayoutNocturne = lazy(() => import('@/components/themes/nocturne/LayoutNocturne'))

// Layout components mapping (client-side only)
export const layouts = {
  LayoutDark,
  LayoutLight,
  LayoutModern,
  LayoutNocturne,
} as const

// Helper function to get layout component (client-side only)
export function getLayoutComponent(layoutName: string) {
  return layouts[layoutName as keyof typeof layouts] || LayoutDark
}
