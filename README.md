# Another Read - Event Management

A modern event management application built with the T3 Stack, featuring a premium glassmorphism UI and PostgreSQL database persistence.

**Live Demo**: https://demo-8jbzhtyyv-jon-gednys-projects.vercel.app  
**Repository**: https://github.com/jongedny/another-read

## Features

- ✨ Create and manage events with a beautiful UI
- 💾 PostgreSQL database persistence with Drizzle ORM
- 🎨 Premium glassmorphism design with gradient effects
- ⚡ Real-time updates and smooth animations
- 🔒 Type-safe API with tRPC
- 🚀 Deployed on Vercel with automatic deployments from GitHub

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Database**: Neon Serverless Postgres
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **API**: [tRPC](https://trpc.io)
- **Deployment**: [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use Neon for development)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:3000`

### Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="your-postgres-connection-string"
```

## Deployment

This app is configured for automatic deployment on Vercel:

1. Push changes to the `main` branch on GitHub
2. Vercel automatically builds and deploys
3. Database migrations run automatically

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), check out the following resources:

- [T3 Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available)
