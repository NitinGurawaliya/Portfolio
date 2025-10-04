export interface ThemeConfig {
  id: string
  name: string
  description: string
  preview: string // Preview image URL
  category: 'professional' | 'creative' | 'minimal' | 'bold'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      muted: string
    }
    border: string
  }
  fonts: {
    heading: string
    body: string
  }
  layout: {
    heroStyle: 'centered' | 'split' | 'minimal' | 'card'
    skillsStyle: 'grid' | 'tags' | 'cards' | 'icons'
    projectsStyle: 'cards' | 'list' | 'grid' | 'masonry'
    socialsStyle: 'buttons' | 'icons' | 'cards'
  }
  animations: {
    enabled: boolean
    intensity: 'subtle' | 'medium' | 'high'
  }
}

export interface ThemeContextType {
  currentTheme: string
  themeConfig: ThemeConfig | null
  setTheme: (themeId: string) => void
  availableThemes: ThemeConfig[]
}
