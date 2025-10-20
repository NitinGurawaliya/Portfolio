# 🎨 Theme Implementation Guide

This guide provides step-by-step instructions for implementing the theme customization system in DevFolio.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: Basic Theme System](#phase-1-basic-theme-system)
3. [Creating New Themes](#creating-new-themes)
4. [Theme Customization UI](#theme-customization-ui)
5. [Advanced Features](#advanced-features)
6. [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

### Theme System Components

```
┌─────────────────────────────────────────────────────────┐
│                    User Dashboard                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Theme Selector Component                   │  │
│  │  • Preview Cards  • Color Picker  • Font Selector │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Theme Context Provider                      │
│  • Current Theme State  • Theme Switching  • Persistence│
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│  • GET /api/themes        • POST /api/portfolio/theme   │
│  • GET /api/themes/:id    • POST /api/custom-theme      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                Database (Prisma)                         │
│  • Portfolio.theme  • Portfolio.customTheme            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Public Portfolio Page                       │
│  • Dynamic Theme Loading  • CSS Variable Injection      │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Phase 1: Basic Theme System

### Step 1: Update Database Schema

```prisma
// prisma/schema.prisma

model Portfolio {
  // ... existing fields
  
  // Theme fields
  theme              String   @default("dark")
  customTheme        Json?
  useCustomTheme     Boolean  @default(false)
  
  // Relations
  layout             PortfolioLayout?
  customStyles       CustomStyles?
}

model PortfolioLayout {
  id              String   @id @default(cuid())
  portfolioId     String   @unique
  portfolio       Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  sections        Json     // Array of section configurations
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_theme_customization
```

### Step 2: Create Theme Type Definitions

Create `src/types/theme.ts`:

```typescript
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  text: string;
  textSecondary: string;
  accent: string;
  border: string;
  card: string;
  cardHover: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeTypography {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeLayout {
  maxWidth: string;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ThemeComponents {
  projectCard: {
    style: 'card' | 'minimal' | 'bordered' | 'glass';
    hoverEffect: 'lift' | 'scale' | 'glow' | 'none';
    imageRatio: '16:9' | '4:3' | '1:1';
    showOverlay: boolean;
  };
  navigation: {
    style: 'sticky' | 'fixed' | 'static';
    blur: boolean;
  };
  skills: {
    display: 'badges' | 'pills' | 'grid' | 'minimal';
    showIcons: boolean;
    columns: number;
  };
  hero: {
    layout: 'centered' | 'split' | 'minimal';
    showParticles: boolean;
    showTypingEffect: boolean;
  };
}

export interface ThemeAnimation {
  enabled: boolean;
  speed: 'slow' | 'normal' | 'fast';
  transitions: {
    pageTransition: boolean;
    cardHover: boolean;
    scrollReveal: boolean;
  };
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'minimal' | 'bold';
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  components: ThemeComponents;
  animation: ThemeAnimation;
  preview?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: Theme;
  isPopular?: boolean;
  isPremium?: boolean;
}
```

### Step 3: Create Theme Presets

Create `src/lib/themes/presets.ts`:

```typescript
import { Theme } from '@/types/theme';

export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark Professional',
  description: 'Modern dark theme with clean typography',
  category: 'professional',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#0a0a0a',
    foreground: '#ffffff',
    text: '#e5e5e5',
    textSecondary: '#a3a3a3',
    accent: '#06b6d4',
    border: '#262626',
    card: '#171717',
    cardHover: '#1f1f1f',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  typography: {
    fontFamily: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  layout: {
    maxWidth: '1200px',
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
  },
  components: {
    projectCard: {
      style: 'card',
      hoverEffect: 'lift',
      imageRatio: '16:9',
      showOverlay: true,
    },
    navigation: {
      style: 'sticky',
      blur: true,
    },
    skills: {
      display: 'badges',
      showIcons: true,
      columns: 4,
    },
    hero: {
      layout: 'centered',
      showParticles: false,
      showTypingEffect: true,
    },
  },
  animation: {
    enabled: true,
    speed: 'normal',
    transitions: {
      pageTransition: true,
      cardHover: true,
      scrollReveal: true,
    },
  },
};

export const lightTheme: Theme = {
  id: 'light',
  name: 'Light Professional',
  description: 'Clean light theme with excellent readability',
  category: 'professional',
  colors: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    background: '#ffffff',
    foreground: '#0a0a0a',
    text: '#171717',
    textSecondary: '#525252',
    accent: '#0891b2',
    border: '#e5e5e5',
    card: '#f9fafb',
    cardHover: '#f3f4f6',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },
  // ... same structure as darkTheme
  typography: darkTheme.typography,
  layout: darkTheme.layout,
  components: darkTheme.components,
  animation: darkTheme.animation,
};

// Add more themes...
export const minimalistTheme: Theme = {
  id: 'minimalist',
  name: 'Minimalist',
  description: 'Less is more - ultra-clean design',
  category: 'minimal',
  // ... configuration
};

export const cyberpunkTheme: Theme = {
  id: 'cyberpunk',
  name: 'Cyberpunk Neon',
  description: 'Futuristic with neon accents',
  category: 'bold',
  colors: {
    primary: '#00ff9f',
    secondary: '#ff00ff',
    background: '#0d0221',
    foreground: '#ffffff',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    accent: '#00d9ff',
    border: '#2d1b69',
    card: '#1a0b3d',
    cardHover: '#2d1b69',
    success: '#00ff9f',
    warning: '#ffbd00',
    error: '#ff0055',
  },
  // ... rest of configuration
};

export const allThemes: Theme[] = [
  darkTheme,
  lightTheme,
  minimalistTheme,
  cyberpunkTheme,
  // Add more themes here
];

export const getThemeById = (id: string): Theme | undefined => {
  return allThemes.find(theme => theme.id === id);
};
```

### Step 4: Create Theme Context

Create `src/contexts/ThemeContext.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '@/types/theme';
import { darkTheme } from '@/lib/themes/presets';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  applyTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = darkTheme,
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme);

  const applyTheme = (theme: Theme) => {
    // Apply CSS variables to root
    const root = document.documentElement;
    
    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Typography
    root.style.setProperty('--font-heading', theme.typography.fontFamily.heading);
    root.style.setProperty('--font-body', theme.typography.fontFamily.body);
    root.style.setProperty('--font-mono', theme.typography.fontFamily.mono);
    
    // Layout
    root.style.setProperty('--max-width', theme.layout.maxWidth);
    Object.entries(theme.layout.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    Object.entries(theme.layout.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    setCurrentTheme(theme);
  };

  useEffect(() => {
    applyTheme(initialTheme);
  }, [initialTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: applyTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Step 5: Create API Endpoints

Create `src/app/api/themes/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { allThemes } from '@/lib/themes/presets';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      themes: allThemes,
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/portfolio/theme/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { themeId, customTheme, useCustomTheme } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { portfolio: true },
    });

    if (!user?.portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: user.portfolio.id },
      data: {
        theme: themeId || user.portfolio.theme,
        customTheme: customTheme || user.portfolio.customTheme,
        useCustomTheme: useCustomTheme ?? user.portfolio.useCustomTheme,
      },
    });

    return NextResponse.json({
      success: true,
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Creating New Themes

### Theme Creation Checklist

1. **Define Color Palette**
   - Use color theory principles
   - Ensure sufficient contrast (WCAG AA)
   - Test in both light and dark modes
   - Create harmony with 60-30-10 rule

2. **Typography Pairing**
   - Choose complementary fonts
   - Ensure readability at all sizes
   - Consider loading performance
   - Test on mobile devices

3. **Component Styling**
   - Define card styles
   - Configure hover effects
   - Set border radius consistency
   - Plan shadow usage

4. **Test Thoroughly**
   - Check all breakpoints
   - Verify color contrast
   - Test animations
   - Validate accessibility

### Example: Creating a "Sunset" Theme

```typescript
export const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'Sunset Orange',
  description: 'Warm and welcoming with sunset-inspired colors',
  category: 'creative',
  colors: {
    primary: '#ff6b35',      // Sunset orange
    secondary: '#f7931e',    // Golden hour
    background: '#fff5eb',   // Warm cream
    foreground: '#1a1a1a',   // Almost black
    text: '#2d2d2d',         // Dark gray
    textSecondary: '#6b6b6b', // Medium gray
    accent: '#ff9500',       // Bright orange
    border: '#ffe4c4',       // Peach
    card: '#ffffff',         // Pure white
    cardHover: '#fff8f0',    // Light peach
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
  },
  typography: {
    fontFamily: {
      heading: 'Poppins, sans-serif',
      body: 'Open Sans, sans-serif',
      mono: 'Source Code Pro, monospace',
    },
    // ... rest of typography config
  },
  components: {
    projectCard: {
      style: 'bordered',
      hoverEffect: 'scale',
      imageRatio: '16:9',
      showOverlay: false,
    },
    // ... rest of component config
  },
  // ... rest of theme config
};
```

---

## 🎯 Theme Customization UI

### Theme Selector Component

Create `src/components/dashboard/ThemeSelector.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Theme } from '@/types/theme';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeSelector() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const { applyTheme } = useTheme();

  useEffect(() => {
    // Fetch available themes
    fetch('/api/themes')
      .then(res => res.json())
      .then(data => setThemes(data.themes));
  }, []);

  const handleThemeSelect = async (theme: Theme) => {
    setSelectedTheme(theme);
    applyTheme(theme);

    // Save to database
    await fetch('/api/portfolio/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeId: theme.id }),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Choose Your Theme</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map(theme => (
          <div
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            className={`
              cursor-pointer rounded-lg border-2 p-4 transition-all
              ${selectedTheme?.id === theme.id 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            {/* Theme preview */}
            <div className="aspect-video rounded mb-3 overflow-hidden">
              <ThemePreview theme={theme} />
            </div>
            
            <h3 className="font-semibold">{theme.name}</h3>
            <p className="text-sm text-gray-600">{theme.description}</p>
            
            {/* Color swatches */}
            <div className="flex gap-2 mt-3">
              {Object.entries(theme.colors)
                .slice(0, 5)
                .map(([key, color]) => (
                  <div
                    key={key}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📚 Best Practices

### 1. Performance
- Use CSS variables for theming
- Lazy load theme assets
- Optimize font loading
- Cache theme configurations

### 2. Accessibility
- Maintain WCAG AA contrast ratios
- Test with screen readers
- Ensure keyboard navigation
- Provide high contrast mode

### 3. Maintainability
- Use consistent naming conventions
- Document theme structure
- Create theme templates
- Version control themes

### 4. User Experience
- Provide theme previews
- Allow real-time customization
- Save theme preferences
- Enable theme export/import

---

**Ready to implement? Start with Phase 1 and gradually add more features!**

*For questions or contributions, see the main README.md*

