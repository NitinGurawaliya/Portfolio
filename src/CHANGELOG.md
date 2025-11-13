# Changelog

## v1.0.0 · Initial Release

Welcome to the first public release of DevFolio! This version focuses on giving builders a full-stack portfolio experience with social discovery, contribution tracking, and a polished onboarding journey.

### 🎯 Core Experience
- **Personal Portfolio Sites** – Every authenticated user can generate a feature-rich public profile under `[username]/` with projects, shiplogs, and smart metadata.
- **Dashboard Workspace** – A centralized dashboard (`/app/dashboard/`) for managing portfolio content, skills, social links, and repository imports.
- **Guided Onboarding** – A multi-step modal flow (`/app/onbaording/`) that helps new users sign in with GitHub, claim usernames, add projects, and publish in minutes.

### 🚀 Social & Community Feeds
- **Projects Feed** – Browse and sort community projects (`/app/feed/projects/`) with upvotes, filtering, and responsive layouts.
- **Shiplog Feed** – Track build-in-public updates (`/app/feed/shiplog/`) with reactions, follow prompts, sticky navigation, and smooth infinite scrolling.
- **Public Shiplog Cards** – Consistent card presentation across feeds and public profiles with responsive truncation, centered media, and optional full-screen previews.

### 🤝 Collaboration & Contribution Tools
- **Open Source Explorer** – Discover repositories by stack, difficulty, and activity (`/app/open-source/`) with server-side filtering, skeleton states, and guide counts.
- **Contribution Guides** – Deep dives for highlighted repositories (`/app/opensource/[slug]/guide/`) featuring timelines, prerequisites, and resource cards.

### 🔐 Accounts & Auth
- **GitHub Sign-In** – Secure authentication plus GitHub repository sync used throughout dashboard and onboarding flows.
- **Session Handling** – Graceful fallbacks when unauthenticated, including contextual toast prompts to sign in.

### 🧩 API Surface & Services
- Comprehensive REST routes under `/app/api/` for feeds, portfolios, shiplogs, analytics, and user interactions.
- Service helpers in `src/lib/services/` provide normalized fetch wrappers, null-safe session handling, and GitHub data ingestion.

### 🧱 UI & Accessibility
- **Component Library** – Reusable cards, dialogs, badges, buttons, skeletons, and toast helpers under `src/components/ui/`.
- **Accessibility Pass** – Dialogs include hidden titles/descriptions, list truncation prevents overflow, and toasts surface next-step CTAs.

### 🛠 Utilities & Types
- Normalizers and transformers in `src/lib/portfolio-utils.ts`, `src/lib/open-source-repos.ts`, and related helpers keep data contracts clean.
- Global type definitions in `src/interface/` and hooks under `src/hooks/` provide strong typing for sessions, portfolios, and feed state.

---

Thanks for trying DevFolio! We’d love your feedback as we plan the next release. 🎉

