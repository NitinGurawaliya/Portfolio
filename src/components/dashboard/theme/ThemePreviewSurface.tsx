import type { ThemeConfig } from "@/lib/theme-config"

interface ThemePreviewSurfaceProps {
  themeConfig: ThemeConfig
  onOpenPreview: (imageUrl: string) => void
}

export function ThemePreviewSurface({ themeConfig, onOpenPreview }: ThemePreviewSurfaceProps) {
  if (themeConfig.previewImage) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-white">
        <img
          src={themeConfig.previewImage}
          alt={`${themeConfig.name} preview`}
          className="absolute inset-0 h-full w-full cursor-zoom-in object-cover"
          loading="lazy"
          onClick={(event) => {
            event.stopPropagation()
            onOpenPreview(themeConfig.previewImage)
          }}
        />
        <div className="absolute right-2 top-2">
          <div
            className="rounded-md px-2 py-1 text-[10px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: themeConfig.colors.accent }}
          >
            {themeConfig.name}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative h-20 w-full overflow-hidden rounded-lg border shadow-sm"
      style={{
        background: themeConfig.colors.background,
        borderColor: themeConfig.colors.border || `${themeConfig.colors.accent}30`,
      }}
    >
      <div className="absolute inset-0 p-2">
        <div className="mb-2 flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border-2"
            style={{
              borderColor: themeConfig.colors.accent,
              backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background,
            }}
          />
          <div className="flex-1">
            <div
              className="mb-1 h-1.5 rounded"
              style={{
                backgroundColor: themeConfig.colors.text,
                width: "70%",
              }}
            />
            <div
              className="h-1 rounded"
              style={{
                backgroundColor: themeConfig.colors.accent,
                width: "50%",
              }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div
            className="h-3 rounded border"
            style={{
              backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background,
              borderColor: themeConfig.colors.border || `${themeConfig.colors.accent}40`,
            }}
          />
          <div
            className="h-3 rounded border"
            style={{
              backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background,
              borderColor: themeConfig.colors.border || `${themeConfig.colors.accent}40`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
