# SFHMS - Student Fitness & Health Management System

A comprehensive web-based system for managing student fitness activities and health records, built with Next.js and Oracle Database.

## 📋 Overview

SFHMS is a full-stack application designed to help educational institutions manage student health records, fitness activities, and wellness programs. The system provides role-based access for administrators, students, coaches, and nurses.

## ✨ Features

### For Administrators
- Manage users (students, coaches, nurses)
- View and manage all health records
- Track fitness activities across the institution
- Generate analytics and reports
- Full CRUD operations on all data

### For Students
- View personal health records
- Track fitness activities
- Monitor wellness progress
- Access personalized health information

### For Coaches
- Manage fitness programs
- Track student activities
- Create workout plans
- Monitor student progress

### For Nurses
- Manage health records
- Update medical information
- Track health checkups
- Monitor student wellness

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 18, TypeScript
- **Styling:** Tailwind CSS, Radix UI Components
- **Database:** Oracle Database 21c XE
- **ORM:** node-oracledb
- **Authentication:** Session-based with bcrypt
- **Forms:** React Hook Form with Zod validation

## 📁 Project Structure

```
SFHMS/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   └── db/               # Database connection and queries
├── scripts/              # Database setup scripts
│   └── core/            # Core SQL scripts
├── docs/                 # Documentation
└── public/              # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Windows OS
- Oracle Database 21c XE
- Node.js 18+ 
- PNPM package manager

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/daudx/SFHMS.git
   cd SFHMS
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Oracle Database**
   - Install Oracle Database 21c XE
   - Create database user:
     ```sql
     sqlplus sys/oracle123@localhost:1521/XE as sysdba
     CREATE USER sfhms_user IDENTIFIED BY sfhms_password;
     GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE PROCEDURE TO sfhms_user;
     GRANT UNLIMITED TABLESPACE TO sfhms_user;
     ```

4. **Run database scripts**
   ```bash
   cd scripts/core
   sqlplus sfhms_user/sfhms_password@localhost:1521/XEPDB1
   @01_init_schema.sql
   @02_sequences_triggers.sql
   @03_sample_data.sql
   @04_views.sql
   @05_stored_procedures.sql
   ```

5. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   DB_USER=sfhms_user
   DB_PASSWORD=sfhms_password
   DB_CONNECTION_STRING=localhost:1521/XEPDB1
   SESSION_SECRET=your-secret-key-change-this-in-production
   ```

6. **Run the application**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Accounts

### Administrator
- Username: `daudx`
- Password: `admin123`

### Students
- Username: `bob_m` | Password: `student123`
- Username: `emma_student` | Password: `student123`
- Username: `alex_student` | Password: `student123`

### Coaches
- Username: `mike_coach` | Password: `coach123`
- Username: `sarah_coach` | Password: `coach123`

### Nurses
- Username: `robert_nurse` | Password: `nurse123`
- Username: `linda_nurse` | Password: `nurse123`

## 📖 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Complete step-by-step setup instructions
- **[Project Structure](PROJECT_STRUCTURE.md)** - Detailed project organization
- **[API Reference](docs/API_REFERENCE.md)** - API endpoints documentation
- **[Database Setup](docs/DATABASE_SETUP.md)** - Database configuration guide
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🗄️ Database Schema

The system uses the following main tables:
- **Users** - User authentication and roles
- **Students** - Student information
- **Coaches** - Coach profiles
- **Nurses** - Nurse profiles
- **HealthRecords** - Medical records
- **FitnessActivities** - Activity tracking
- **Appointments** - Appointment scheduling
- **Medications** - Medication tracking
- **Vaccinations** - Vaccination records
- **FitnessGoals** - Student fitness goals
- **WorkoutPlans** - Exercise routines
- **NutritionalPlans** - Diet planning

## 🔐 Security

- Password hashing with bcrypt
- Session-based authentication
- Environment variables for sensitive data
- SQL injection prevention with parameterized queries
- Role-based access control (RBAC)

## 🤝 Contributing

This is a university project. For contributions:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is created for educational purposes as part of a Database Management Systems course.

## 👥 Team

- **Developer:** Dawood Sajid (daudx)
- **Institution:** [Your University Name]
- **Course:** Database Management Systems
- **Year:** 2025

## 🐛 Known Issues

- None currently reported

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Contact: [Your Email]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Oracle for the database system
- Radix UI for component primitives
- All contributors and team members

---

**Last Updated:** December 4, 2025  
**Version:** 1.0.0
