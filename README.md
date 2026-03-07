# IMC Project Scheduler

A multi-client project scheduling web application for Image Marketing Consultants (IMC). Features admin project creation, client-facing schedule views, and a master portfolio Gantt chart.

## Features

- **Admin Dashboard**: Create and manage projects, templates, and clients
- **Gantt Timeline**: Visual project schedule with property grouping and deliverable shapes
- **Client Share Pages**: View-only schedules with subtle IMC branding
- **Portfolio View**: All active projects at a glance with filters
- **Business Day Logic**: Schedule calculations that skip weekends
- **Milestone Templates**: Reusable patterns for brochures, microsites, etc.
- **Role-Based Access**: Admin, internal, and client_viewer roles

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS with IMC brand tokens
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth with RLS policies

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
cd "IMAGE Creative Project MGMT"
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

Run the SQL migrations in your Supabase SQL Editor in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates tables and types
2. `supabase/migrations/002_rls_policies.sql` - Sets up Row Level Security
3. `supabase/migrations/003_seed_data.sql` - Adds sample "Second Horizon Capital" project

### 4. Add Custom Font (Optional)

To use the Chelon font for headings:

1. Place font files in `/public/fonts/`:
   - `Chelon-Regular.woff2`
   - `Chelon-Regular.woff`
   - `Chelon-Bold.woff2`
   - `Chelon-Bold.woff`

2. Uncomment the `@font-face` declarations in `/src/app/globals.css`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login/signup pages
│   ├── (protected)/      # Admin dashboard, projects, portfolio, templates
│   └── share/[token]/    # Client share pages (public)
├── components/
│   ├── layout/           # Sidebar, Header, ClientHeader/Footer
│   └── schedule/         # GanttTimeline, DeliverableShape, etc.
├── lib/
│   ├── scheduling/       # Business day logic, templates
│   └── supabase/         # Client and server utilities
└── types/
    └── database.ts       # TypeScript types for all tables
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## IMC Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#FCF7FE` | Page backgrounds |
| Pale Pink | `#F69BC9` | Subtle accents |
| Fuchsia | `#E52E7D` | Primary brand |
| Bubblegum | `#EB609D` | Secondary accent |
| Poppy Red | `#E40224` | Alerts, emphasis |
| Orange | `#FF4A29` | CTAs, highlights |

## License

Private - Image Marketing Consultants
