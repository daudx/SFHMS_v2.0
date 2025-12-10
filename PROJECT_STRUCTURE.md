# SFHMS Project Structure

## 📁 Directory Organization

```
SFHMS/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   └── register/
│   │   ├── fitness-activities/   # Student fitness data
│   │   ├── health-records/       # Student health data
│   │   └── admin/                # Admin CRUD endpoints
│   │       ├── users/
│   │       ├── students/
│   │       ├── coaches/
│   │       ├── nurses/
│   │       ├── health-profiles/
│   │       └── fitness-logs/
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   └── dashboard/                # Dashboard pages
│       ├── page.tsx              # Student dashboard
│       ├── admin/                # Admin dashboard
│       ├── coach/                # Coach dashboard
│       ├── nurse/                # Nurse dashboard
│       ├── analytics/
│       ├── fitness-activities/
│       └── health-records/
│
├── components/                   # React Components
│   ├── ui/                       # Shadcn UI components
│   ├── admin/                    # Admin-specific components
│   │   ├── users-table.tsx
│   │   ├── students-table.tsx
│   │   ├── coaches-table.tsx
│   │   ├── nurses-table.tsx
│   │   ├── health-profiles-table.tsx
│   │   └── fitness-logs-table.tsx
│   ├── header.tsx                # Navigation header
│   └── theme-provider.tsx
│
├── lib/                          # Utilities & Libraries
│   ├── db/
│   │   ├── oracle.ts             # Oracle DB connection
│   │   └── queries.ts            # Database queries
│   └── utils.ts                  # Helper functions
│
├── scripts/                      # Database Scripts
│   └── core/                     # Core database setup
│       ├── 00_run_all.sql        # Master execution script
│       ├── 01_schema_create.sql  # Create all tables
│       ├── 02_sequences_triggers.sql
│       ├── 03_sample_data.sql    # Insert sample data
│       ├── 04_views.sql          # Create database views
│       ├── 05_stored_procedures.sql
│       ├── 06_analytics_queries.sql
│       └── 10_add_demo_users.sql # Demo user accounts
│
├── docs/                         # Documentation
│   └── credentials/              # Login credentials
│       ├── CREDENTIALS.md
│       └── LOGIN_CREDENTIALS.md
│
├── hooks/                        # Custom React Hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── public/                       # Static assets
├── styles/                       # Global styles
│
└── Configuration Files
    ├── .env.local                # Environment variables
    ├── next.config.mjs           # Next.js config
    ├── tsconfig.json             # TypeScript config
    ├── components.json           # Shadcn config
    └── package.json              # Dependencies

```

## 🔑 Key Files

### Database Connection
- `lib/db/oracle.ts` - Oracle database connection management

### Authentication
- `app/api/auth/login/route.ts` - Login API
- `app/auth/login/page.tsx` - Login UI

### Admin Panel
- `app/dashboard/admin/page.tsx` - Admin dashboard
- `components/admin/*-table.tsx` - CRUD tables for each entity

### Credentials
- `docs/credentials/LOGIN_CREDENTIALS.md` - All user login credentials

## 🚀 Quick Start

1. **Database Setup**: Run scripts in `scripts/core/` in order (00-10)
2. **Start Server**: `pnpm dev`
3. **Login**: Use credentials from `docs/credentials/LOGIN_CREDENTIALS.md`
4. **Access**: http://localhost:3000

## 📊 Database

- **Database**: Oracle 21c XE
- **Schema**: sfhms_user
- **Tables**: 12 tables with relationships
- **Sample Data**: Pre-loaded with demo users

## 👥 User Roles

- **Admin**: Full system access (daudx/admin123)
- **Student**: 3 accounts (password: student123)
- **Coach**: 2 accounts (password: coach123)
- **Nurse**: 2 accounts (password: nurse123)
