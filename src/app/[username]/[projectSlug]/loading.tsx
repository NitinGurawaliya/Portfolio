'use client'

import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectSlugLoading() {
  return (
    <div
      className="min-h-screen bg-[#f6f7fb]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-9 w-44 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-7 w-48 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Skeleton className="h-10 w-36 rounded-full" />
              <Skeleton className="h-10 w-36 rounded-full" />
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[3fr,2fr]">
          <Skeleton className="h-64 rounded-3xl" />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="mt-4 h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}


