# Dental Clinic Management SaaS

A production-ready, multi-tenant dental clinic management platform built with Next.js 15, Supabase, and TypeScript.

## Features

- **Multi-Tenancy** — Complete clinic isolation via Row Level Security (RLS)
- **Role-Based Access Control** — Super Admin, Dentist, Nurse/Receptionist roles
- **Patient Management** — Full patient records with medical history, timeline, and file numbers
- **Interactive Odontogram** — Professional dental charting with FDI notation, per-surface tracking, and condition color coding
- **Appointments** — Calendar, daily, and weekly views with drag-based scheduling
- **Treatment Plans** — Tooth-level treatment tracking with cost management
- **Billing & Invoices** — Invoice generation, payment tracking, automatic balance updates
- **Clinical Images** — Before/after photos, X-rays, with comparison slider
- **PDF Generation** — Invoices, receipts, treatment plans, and patient reports
- **Bilingual (EN/AR)** — Full Arabic and English support with RTL layout
- **Audit Logging** — Track all data changes
- **Soft Delete** — No data is permanently deleted

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query |
| i18n | next-intl |
| PDF | @react-pdf/renderer |
| State | Zustand (auth) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project ([supabase.com](https://supabase.com))

### 1. Clone and Install

```bash
git clone <repository-url>
cd dental-clinic
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and API keys
3. Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Database Migration

Execute the SQL migration in your Supabase SQL Editor:

```
supabase/migrations/00001_initial_schema.sql
```

This creates all tables, indexes, RLS policies, triggers, and helper functions.

### 4. Set Up Storage

In your Supabase dashboard, create a storage bucket:
- Name: `patient-files`
- Public: No (private)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (auth)/           # Login, Register pages
│   │   ├── (dashboard)/      # Protected dashboard pages
│   │   │   ├── admin/        # Super Admin panel
│   │   │   ├── appointments/ # Calendar & scheduling
│   │   │   ├── billing/      # Invoices & payments
│   │   │   ├── dashboard/    # Home dashboard
│   │   │   ├── patients/     # Patient management
│   │   │   │   └── [id]/     # Patient detail
│   │   │   │       ├── billing/
│   │   │   │       ├── images/
│   │   │   │       ├── odontogram/
│   │   │   │       ├── treatments/
│   │   │   │       └── visits/
│   │   │   └── settings/     # Clinic & user settings
│   │   └── layout.tsx        # Locale layout (RTL/LTR)
│   └── api/auth/callback/    # Supabase auth callback
├── components/
│   ├── admin/                # Admin components
│   ├── appointments/         # Calendar, daily, weekly views
│   ├── billing/              # Invoice & payment forms
│   ├── images/               # Gallery, upload, lightbox, compare
│   ├── layout/               # Sidebar, header
│   ├── odontogram/           # Dental chart, tooth SVG, detail panel
│   ├── patients/             # Patient form, timeline
│   ├── shared/               # Reusable components
│   ├── treatments/           # Treatment form, cards
│   ├── ui/                   # shadcn/ui primitives
│   └── visits/               # Visit form, detail
├── hooks/                    # TanStack Query hooks
├── lib/
│   ├── pdf/                  # PDF document templates
│   ├── supabase/             # Supabase client configurations
│   ├── validations/          # Zod schemas
│   ├── i18n.ts               # Internationalization config
│   └── utils.ts              # Utility functions
├── messages/                 # Translation files (en.json, ar.json)
├── providers/                # React context providers
└── types/                    # TypeScript type definitions
```

## Database Schema

17 tables with full RLS policies:

| Table | Purpose |
|-------|---------|
| `clinics` | Tenant/clinic records |
| `profiles` | User profiles (extends auth.users) |
| `patients` | Patient records |
| `appointments` | Scheduling |
| `visits` | Clinical visits |
| `dental_charts` | Odontogram charts |
| `tooth_records` | Per-tooth conditions |
| `surface_records` | Per-surface conditions |
| `treatment_plans` | Treatment tracking |
| `treatment_catalog` | Treatment type catalog |
| `invoices` | Billing invoices |
| `invoice_items` | Invoice line items |
| `payments` | Payment records |
| `patient_images` | Clinical photos & X-rays |
| `consent_forms` | Electronic consent |
| `patient_timeline` | Activity timeline |
| `audit_logs` | Audit trail |

## User Roles

| Role | Access Level |
|------|-------------|
| **Super Admin** | Platform management, clinic creation, subscriptions |
| **Dentist** | Full clinical + billing access within their clinic |
| **Nurse** | Patient creation, appointments, view-only for treatments |
| **Receptionist** | Patient creation, appointments, basic info only |

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

Set environment variables in Vercel dashboard.

### Docker

```bash
docker build -t dental-clinic .
docker run -p 3000:3000 dental-clinic
```

## License

MIT
