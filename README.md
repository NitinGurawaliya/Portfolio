# DevFolio - Developer Portfolio Builder

**DevFolio** is a powerful Next.js application that helps developers create stunning portfolios in minutes by connecting their GitHub account. The app automatically fetches GitHub profile data, repositories, and other public information to create a comprehensive, professional portfolio.

## ✨ Features

- 🔐 **GitHub OAuth Authentication** - Secure login with your GitHub account
- 📊 **Automatic Data Import** - Fetch GitHub profile, repositories, and stats
- 🎨 **Beautiful Templates** - Modern, responsive UI with dark theme
- 🗂️ **Project Showcase** - Display repositories with language, stars, forks, and more
- 💼 **Skills Management** - Add and organize your technical skills
- 🔗 **Social Integration** - Link all your social profiles
- 🌐 **Custom URLs** - Share your portfolio with a personalized URL
- 📱 **Mobile Responsive** - Perfect on all devices
- 💾 **Data Persistence** - PostgreSQL database with Prisma ORM
- 🚀 **SEO Optimized** - Built-in SEO best practices for better discoverability
- ⚡ **Fast Performance** - Optimized for speed and user experience

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with GitHub Provider
- **Database**: PostgreSQL with Prisma ORM
- **API**: Next.js API Routes
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- GitHub OAuth App

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd devfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Database
DATABASE_URL=your_postgresql_database_url

# SEO & Public URL (for production)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 4. Set up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: DevFolio
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github`
4. Copy the Client ID and Client Secret to your `.env.local` file

### 5. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Authentication**: Visit `/auth` to connect your GitHub account
2. **Dashboard**: After authentication, you'll be redirected to `/dashboard` where you can see:
   - Your GitHub profile information
   - Profile picture, bio, location, company
   - Social links (Twitter, website)
   - Repository count, followers, following
   - List of all your repositories with details

## API Endpoints

- `GET/POST /api/auth/*` - NextAuth.js authentication routes
- `GET /api/github` - Fetch and store GitHub user data and repositories

## Database Schema

### User Model
- Basic profile information (name, email)
- GitHub-specific data (username, avatar, bio, location, etc.)
- Social links and statistics

### Repository Model
- Repository details (name, description, language)
- Statistics (stars, forks, size)
- Metadata (creation date, last update, etc.)

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth.js routes
│   │   └── github/        # GitHub data API
│   ├── auth/              # Authentication page
│   ├── dashboard/         # Dashboard page
│   └── layout.tsx         # Root layout with providers
├── components/
│   └── Providers.tsx      # Session provider wrapper
└── lib/
    ├── auth.ts           # NextAuth configuration
    └── prisma.ts         # Prisma client
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🚀 SEO Features

DevFolio comes with built-in SEO optimization:

- **Meta Tags**: Comprehensive meta tags for search engines
- **Open Graph**: Social media sharing optimization for Facebook, LinkedIn
- **Twitter Cards**: Enhanced Twitter sharing experience
- **Structured Data**: JSON-LD schema markup for rich search results
- **Dynamic Sitemap**: Auto-generated XML sitemap with all published portfolios
- **Robots.txt**: Proper crawler directives for search engines
- **Dynamic Metadata**: Per-user custom SEO for each portfolio page
- **PWA Support**: Progressive Web App manifest for app-like experience
- **Custom Titles**: SEO-friendly page titles (e.g., "John Doe - Full Stack Developer | DevFolio")
- **Rich Snippets**: Enhanced search results with profile information

## 🎨 Customization

DevFolio supports multiple themes and customization options:
- Customize colors, fonts, and layouts
- Add your own branding
- Choose from pre-built themes
- Create your unique developer identity

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💬 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ by developers, for developers.
