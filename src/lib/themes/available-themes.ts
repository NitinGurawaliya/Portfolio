import { ThemeConfig } from './types'

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Sleek dark theme with orange accents',
    preview: '/theme-previews/modern-dark.jpg',
    category: 'professional',
    colors: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#f97316',
      background: '#000000',
      surface: '#111111',
      text: {
        primary: '#ffffff',
        secondary: '#e5e5e5',
        muted: '#a3a3a3'
      },
      border: '#374151'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    layout: {
      heroStyle: 'centered',
      skillsStyle: 'icons',
      projectsStyle: 'cards',
      socialsStyle: 'buttons'
    },
    animations: {
      enabled: true,
      intensity: 'medium'
    }
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean, minimal design with light colors',
    preview: '/theme-previews/minimal-light.jpg',
    category: 'minimal',
    colors: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#f1f5f9',
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#64748b'
      },
      border: '#e2e8f0'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    layout: {
      heroStyle: 'minimal',
      skillsStyle: 'tags',
      projectsStyle: 'list',
      socialsStyle: 'icons'
    },
    animations: {
      enabled: true,
      intensity: 'subtle'
    }
  },
  {
    id: 'gradient-pro',
    name: 'Gradient Professional',
    description: 'Professional with subtle gradients',
    preview: '/theme-previews/gradient-pro.jpg',
    category: 'professional',
    colors: {
      primary: '#1e1b4b',
      secondary: '#312e81',
      accent: '#8b5cf6',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255,255,255,0.1)',
      text: {
        primary: '#ffffff',
        secondary: '#e0e7ff',
        muted: '#c7d2fe'
      },
      border: 'rgba(255,255,255,0.2)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    layout: {
      heroStyle: 'split',
      skillsStyle: 'cards',
      projectsStyle: 'grid',
      socialsStyle: 'cards'
    },
    animations: {
      enabled: true,
      intensity: 'high'
    }
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    description: 'Vibrant colors for creative professionals',
    preview: '/theme-previews/creative-bold.jpg',
    category: 'creative',
    colors: {
      primary: '#ec4899',
      secondary: '#f59e0b',
      accent: '#10b981',
      background: '#1f2937',
      surface: '#374151',
      text: {
        primary: '#ffffff',
        secondary: '#f3f4f6',
        muted: '#d1d5db'
      },
      border: '#6b7280'
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter'
    },
    layout: {
      heroStyle: 'card',
      skillsStyle: 'grid',
      projectsStyle: 'masonry',
      socialsStyle: 'buttons'
    },
    animations: {
      enabled: true,
      intensity: 'high'
    }
  },
  {
    id: 'glass-modern',
    name: 'Glassmorphism',
    description: 'Modern glass effect design',
    preview: '/theme-previews/glass-modern.jpg',
    category: 'bold',
    colors: {
      primary: 'rgba(255,255,255,0.25)',
      secondary: 'rgba(255,255,255,0.18)',
      accent: '#06b6d4',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255,255,255,0.25)',
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255,255,255,0.9)',
        muted: 'rgba(255,255,255,0.7)'
      },
      border: 'rgba(255,255,255,0.18)'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    layout: {
      heroStyle: 'centered',
      skillsStyle: 'cards',
      projectsStyle: 'cards',
      socialsStyle: 'cards'
    },
    animations: {
      enabled: true,
      intensity: 'medium'
    }
  }
]

export const getThemeById = (id: string): ThemeConfig | null => {
  return AVAILABLE_THEMES.find(theme => theme.id === id) || null
}

export const getDefaultTheme = (): ThemeConfig => {
  return AVAILABLE_THEMES[0] // modern-dark
}
