# SFHMS - Student Fitness & Health Management System

A comprehensive web-based system for managing student fitness activities and health records, built with Next.js and Oracle Database.

## 📋 Overview

SFHMS is a full-stack application designed to help educational institutions manage student health records, fitness activities, and wellness programs. The system provides role-based access for administrators, students, coaches, and nurses.

## ✨ Features

### For Administrators
- **User Management**: Complete CRUD operations for students, coaches, and nurses
- **System Settings**: Configure system-wide parameters
- **Activity Logs**: Monitor all system activities
- **Database Joins Viewer**: Interactive demonstration of SQL JOIN operations
- **Assignments**: Manage student-coach and student-nurse relationships
- **Analytics**: View system-wide statistics and reports

### For Students
- **Health Profile**: View personal health information (read-only)
- **Fitness Activities**: Log and track workout sessions
- **Training Plans**: View assigned fitness plans from coaches
- **Medical Records**: Access medical history (read-only)
- **Appointments**: View scheduled medical appointments
- **Dashboard**: Personalized overview with key health metrics

### For Coaches
- **My Students**: View and manage assigned students
- **Training Plans**: Create and assign workout plans
- **Fitness Logs**: Review student activity logs
- **Assessments**: Conduct and track fitness assessments
- **Progress Tracking**: Monitor student fitness progress

### For Nurses
- **My Students**: View assigned students
- **Clinical Profiles**: Create and update student health data
- **Medical Records**: Full CRUD operations on medical records
- **Appointments**: Schedule and manage medical appointments
- **Health Monitoring**: Track student wellness metrics

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui Components
- **Database:** Oracle Database 21c XE
- **ORM:** node-oracledb
- **Authentication:** Session-based with cookies
- **UI Components:** Radix UI primitives
- **Notifications:** Sonner for toast messages

## 📁 Project Structure

```
SFHMS/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── admin/        # Admin APIs
│   │   ├── coach/        # Coach APIs
│   │   ├── nurse/        # Nurse APIs
│   │   ├── student/      # Student APIs
│   │   └── views/        # Database views API
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── admin/        # Admin dashboard
│   │   ├── coach/        # Coach dashboard
│   │   ├── nurse/        # Nurse dashboard
│   │   └── database-joins/ # JOIN demonstrations
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   └── db/               # Database connection and queries
├── scripts/              # Database setup scripts
│   ├── core/            # Core SQL scripts
│   └── migrations/      # Database migrations
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
   git clone https://github.com/daudx/SFHMS_v2.0.git
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
     sqlplus sys/oracle@localhost:1521/XE as sysdba
     CREATE USER SFHMS IDENTIFIED BY Dawood;
     GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE PROCEDURE TO SFHMS;
     GRANT UNLIMITED TABLESPACE TO SFHMS;
     ```

4. **Run database scripts**
   ```bash
   cd scripts/core
   sqlplus SFHMS/Dawood@localhost:1521/XE
   @01_schema_create.sql
   @02_sequences_triggers.sql
   @03_sample_data.sql
   @04_views.sql
   @05_stored_procedures.sql
   @06_analytics_queries.sql
   ```

5. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   DB_USER=SFHMS
   DB_PASSWORD=Dawood
   DB_CONNECTION_STRING=localhost:1521/XE
   ```

6. **Run the application**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Accounts

The login page features **Quick Login** buttons for easy access:

### Administrator
- Email: `daudx@university.edu`
- Password: `admin123`

### Students
- **Student 1 (Ali)**: `ali@university.edu` / `student123`
- **Student 2 (John)**: `john@university.edu` / `student123`

### Coaches
- **Coach 1**: `james@university.edu` / `coach123`
- **Coach 2**: `lisa@university.edu` / `coach123`

### Nurses
- **Nurse 1**: `robert.nurse@university.edu` / `nurse123`
- **Nurse 2**: `linda.nurse@university.edu` / `nurse123`

## 📖 Key Features Explained

### Database Joins Viewer
Access via Admin Dashboard → "Database Joins" button
- Interactive demonstration of 7 different SQL JOIN types
- Live data from database views
- Visual representation of table relationships
- Educational tool for understanding database operations

### Role-Based Dashboards
Each role has a customized dashboard with relevant features:
- **Admin**: Full system control and monitoring
- **Coach**: Student management and fitness planning
- **Nurse**: Medical records and appointments
- **Student**: Personal health and fitness tracking

### Medical Records System
- Nurses can create, update, and delete medical records
- Students have read-only access to their records
- Secure data handling with role-based permissions

### Training Plans
- Coaches create reusable training plan templates
- Plans can be assigned to multiple students
- Detailed exercise schedules with sets and reps

## 🗄️ Database Schema

The system uses the following main tables:
- **User** - Authentication and role management
- **Student** - Student profiles and information
- **Coach** - Coach profiles and certifications
- **Nurse** - Nurse profiles and licenses
- **HealthProfile** - Student health data
- **MedicalRecord** - Medical history and diagnoses
- **Appointment** - Medical appointments scheduling
- **FitnessLog** - Activity and workout tracking
- **TrainingPlan** - Workout plan templates
- **PlanDetail** - Exercise details for plans
- **Goal** - Student fitness goals
- **Assessment** - Fitness assessments by coaches

### Database Views (JOIN Demonstrations)
1. `vw_student_full_profile` - INNER JOIN (3-way)
2. `vw_coach_student_overview` - LEFT JOIN (2 levels)
3. `vw_health_risk_alerts` - INNER JOIN + CASE
4. `vw_upcoming_appointments` - INNER JOIN (3-way)
5. `vw_recent_fitness_activity` - INNER JOIN + WHERE
6. `vw_student_goal_progress` - INNER JOIN + Calculations
7. `vw_nurse_dashboard` - LEFT JOIN + GROUP BY

## 🔐 Security

- Session-based authentication with HTTP-only cookies
- Role-based access control (RBAC)
- SQL injection prevention with parameterized queries
- Environment variables for sensitive data
- Secure password handling (stored in database)

## 🎨 UI/UX Features

- Modern, responsive design with Tailwind CSS
- Dark mode support
- Interactive components with Radix UI
- Toast notifications for user feedback
- Loading states and error handling
- Mobile-friendly navigation

## 🐛 Known Issues

- CSS lint warnings for Tailwind directives (cosmetic only)
- Database migration for clinical profile columns pending (optional feature)

## 📝 Recent Updates

- ✅ Fixed student dashboard logout issues
- ✅ Simplified Nurse Dashboard (removed non-working stats)
- ✅ Added Database Joins viewer to Admin Dashboard
- ✅ Fixed Training Plan creation API
- ✅ Updated quick login credentials
- ✅ Improved error handling across all dashboards

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
- **Repository:** [SFHMS_v2.0](https://github.com/daudx/SFHMS_v2.0)
- **Course:** Database Management Systems
- **Year:** 2025

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting guide

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Oracle for the database system
- shadcn/ui for beautiful components
- Radix UI for accessible primitives
- All contributors and team members

---

**Last Updated:** December 12, 2025  
**Version:** 2.0.0
