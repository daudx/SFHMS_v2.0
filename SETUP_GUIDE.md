# Complete Setup Guide for SFHMS Project

This guide will help you set up and run the Student Fitness & Health Management System (SFHMS) on your Windows computer. Follow each step carefully.

---

## Table of Contents
1. [What You Need to Install](#what-you-need-to-install)
2. [Step 1: Install Oracle Database](#step-1-install-oracle-database)
3. [Step 2: Set Up the Database](#step-2-set-up-the-database)
4. [Step 3: Install Node.js](#step-3-install-nodejs)
5. [Step 4: Install PNPM](#step-4-install-pnpm)
6. [Step 5: Get the Project Files](#step-5-get-the-project-files)
7. [Step 6: Install Project Dependencies](#step-6-install-project-dependencies)
8. [Step 7: Configure Environment Variables](#step-7-configure-environment-variables)
9. [Step 8: Run the Application](#step-8-run-the-application)
10. [How to Login](#how-to-login)
11. [Troubleshooting](#troubleshooting)

---

## What You Need to Install

Before starting, you need to install these software programs:
- **Oracle Database 21c XE** (for storing data)
- **Node.js** (to run the website)
- **PNPM** (to manage project packages)

---

## Step 1: Install Oracle Database

### Download Oracle Database
1. Go to Oracle website: https://www.oracle.com/database/technologies/xe-downloads.html
2. Download **Oracle Database 21c Express Edition (XE)** for Windows
3. The file will be around 2-3 GB in size

### Install Oracle Database
1. Run the installer file you downloaded
2. Click **Next** through the installation wizard
3. When asked for a password, enter: `oracle123` (remember this password!)
4. Continue clicking **Next** until installation finishes
5. Wait for installation to complete (this may take 10-15 minutes)
6. Click **Finish** when done

### Verify Oracle is Running
1. Press `Windows Key + R`
2. Type: `services.msc` and press Enter
3. Look for **OracleServiceXE** in the list
4. Make sure it says "Running" - if not, right-click and select **Start**

---

## Step 2: Set Up the Database

### Open SQL Plus
1. Press `Windows Key + R`
2. Type: `cmd` and press Enter
3. In the black window (Command Prompt), type:
```
sqlplus sys/oracle123@localhost:1521/XE as sysdba
```
4. Press Enter

### Create Database User
Copy and paste these commands **one at a time** (press Enter after each):

```sql
CREATE USER sfhms_user IDENTIFIED BY sfhms_password;
```

```sql
GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE PROCEDURE TO sfhms_user;
```

```sql
GRANT UNLIMITED TABLESPACE TO sfhms_user;
```

```sql
exit
```

### Run Database Setup Scripts
1. Open the project folder in File Explorer
2. Find the `scripts\core` folder
3. Right-click in the folder and select **Open in Terminal** or **Open Command Prompt here**
4. Type this command to connect to the database:
```
sqlplus sfhms_user/sfhms_password@localhost:1521/XEPDB1
```

5. Run each script file in order by typing:
```sql
@01_init_schema.sql
```
Wait for it to finish, then run:
```sql
@02_sequences_triggers.sql
```
Then:
```sql
@03_sample_data.sql
```
Then:
```sql
@04_views.sql
```
Then:
```sql
@05_stored_procedures.sql
```

6. When all scripts finish, type:
```sql
exit
```

**Note:** If you see any errors, don't worry! Most errors are normal (like "table already exists"). Just continue to the next script.

---

## Step 3: Install Node.js

### Download Node.js
1. Go to: https://nodejs.org/
2. Download the **LTS version** (recommended for most users)
3. The version should be 18.x or higher

### Install Node.js
1. Run the downloaded installer
2. Click **Next** through all the steps
3. Make sure to check the box that says "Automatically install necessary tools"
4. Click **Install**
5. Wait for installation to finish
6. Click **Finish**

### Verify Node.js Installation
1. Press `Windows Key + R`
2. Type: `cmd` and press Enter
3. Type this command:
```
node --version
```
4. You should see something like `v18.17.0` or higher
5. Type this command:
```
npm --version
```
6. You should see a version number like `9.6.7`

If you see version numbers, Node.js is installed correctly!

---

## Step 4: Install PNPM

PNPM is a package manager (like NPM but faster).

### Install PNPM
1. Open Command Prompt (press `Windows Key + R`, type `cmd`, press Enter)
2. Type this command:
```
npm install -g pnpm
```
3. Press Enter and wait for it to finish

### Verify PNPM Installation
Type this command:
```
pnpm --version
```
You should see a version number like `8.15.0`

---

## Step 5: Get the Project Files

### Option A: If You Have a ZIP File
1. Right-click the ZIP file
2. Select **Extract All**
3. Choose where to extract (like `Documents` or `Desktop`)
4. Remember this location!

### Option B: If You Have Git
1. Open Command Prompt
2. Navigate to where you want the project (example):
```
cd C:\Users\YourName\Documents
```
3. Clone the repository:
```
git clone [repository-url]
```
4. Go into the project folder:
```
cd SFHMS
```

---

## Step 6: Install Project Dependencies

Dependencies are the packages and libraries this project needs to work.

### Install All Packages
1. Open Command Prompt
2. Navigate to the project folder:
```
cd C:\Users\YourName\Documents\SFHMS
```
(Replace the path with where your project actually is)

3. Type this command:
```
pnpm install
```
4. Press Enter and wait (this might take 5-10 minutes)
5. You'll see a lot of text scrolling - this is normal!
6. When you see "Done" or back to the command prompt, it's finished

---

## Step 7: Configure Environment Variables

Environment variables tell the application how to connect to the database.

### Create Environment File
1. Open the project folder in File Explorer
2. Find the file named `.env.local` (it might be hidden)
   - If you don't see it, create a new file called `.env.local`
3. Open the file with Notepad
4. Make sure it has these exact lines:

```
# Database Connection
DB_USER=sfhms_user
DB_PASSWORD=sfhms_password
DB_CONNECTION_STRING=localhost:1521/XEPDB1

# Session Secret (keep this secret!)
SESSION_SECRET=your-secret-key-change-this-in-production-12345
```

5. Save the file (press `Ctrl + S`)
6. Close Notepad

**Important:** Make sure the file is named exactly `.env.local` (with the dot at the beginning)

---

## Step 8: Run the Application

### Start the Development Server
1. Open Command Prompt
2. Navigate to the project folder (if not already there):
```
cd C:\Users\YourName\Documents\SFHMS
```

3. Type this command:
```
pnpm dev
```

4. Press Enter
5. Wait until you see:
```
✓ Ready in 3.5s
○ Local: http://localhost:3000
```

### Open the Website
1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Type this in the address bar:
```
http://localhost:3000
```
3. Press Enter

You should now see the SFHMS website!

---

## How to Login

The database has sample accounts you can use to test the system.

### Login Credentials

#### Admin Account
- **Username:** `daudx`
- **Password:** `admin123`
- **Use this to:** Manage all students, coaches, and nurses

#### Student Accounts
Choose any of these:
- **Username:** `bob_m` | **Password:** `student123`
- **Username:** `emma_student` | **Password:** `student123`
- **Username:** `alex_student` | **Password:** `student123`
- **Use these to:** View your health records and fitness activities

#### Coach Accounts
Choose any of these:
- **Username:** `mike_coach` | **Password:** `coach123`
- **Username:** `sarah_coach` | **Password:** `coach123`
- **Use these to:** Manage fitness activities and training plans

#### Nurse Accounts
Choose any of these:
- **Username:** `robert_nurse` | **Password:** `nurse123`
- **Username:** `linda_nurse` | **Password:** `nurse123`
- **Use these to:** Manage health records and medical information

### Login Steps
1. Go to: http://localhost:3000
2. Click the **Login** button
3. Enter a username and password from the list above
4. Click **Sign In**
5. You'll be taken to your dashboard

---

## Troubleshooting

### Problem: "Cannot connect to database"
**Solution:**
1. Make sure Oracle Database is running:
   - Press `Windows Key + R`
   - Type: `services.msc`
   - Find **OracleServiceXE** and make sure it's "Running"
2. Check your `.env.local` file has the correct credentials
3. Try restarting Oracle service:
   - Right-click **OracleServiceXE**
   - Click **Restart**

### Problem: "Port 3000 is already in use"
**Solution:**
1. Another program is using port 3000
2. Close any other development servers
3. Or change the port in `package.json`:
   - Find `"dev": "next dev"`
   - Change to `"dev": "next dev -p 3001"`
   - Then use http://localhost:3001 instead

### Problem: "Command not found" errors
**Solution:**
1. Make sure you installed everything correctly
2. Restart Command Prompt
3. Try running as Administrator:
   - Right-click Command Prompt
   - Select "Run as administrator"

### Problem: "PNPM install" fails
**Solution:**
1. Delete the `node_modules` folder (if it exists)
2. Delete the `pnpm-lock.yaml` file
3. Run `pnpm install` again

### Problem: Scripts fail to run in Oracle
**Solution:**
1. Make sure you're connected as `sfhms_user`:
   ```
   sqlplus sfhms_user/sfhms_password@localhost:1521/XEPDB1
   ```
2. Run scripts one at a time (don't skip any)
3. If you see "table already exists" errors, that's okay
4. Check the `docs/TROUBLESHOOTING.md` file for more help

### Problem: "Cannot find module" errors
**Solution:**
1. Make sure you ran `pnpm install`
2. Try deleting `node_modules` and running `pnpm install` again
3. Check that you're in the correct project folder

### Problem: Website shows blank page
**Solution:**
1. Check the Command Prompt where you ran `pnpm dev` for errors
2. Try refreshing the browser (press `F5`)
3. Clear browser cache (press `Ctrl + Shift + Delete`)
4. Try a different browser

---

## Additional Help

### Useful Commands

**Stop the server:**
- Press `Ctrl + C` in the Command Prompt where the server is running

**Restart the server:**
1. Stop it with `Ctrl + C`
2. Run `pnpm dev` again

**Check database connection:**
```
sqlplus sfhms_user/sfhms_password@localhost:1521/XEPDB1
```
Then type:
```sql
SELECT COUNT(*) FROM Student;
```
If you see a number, database is working!

### Important Files to Know

- **Login Credentials:** `docs/credentials/LOGIN_CREDENTIALS.md`
- **Database Setup Scripts:** `scripts/core/` folder
- **Environment Config:** `.env.local` file (in project root)
- **Detailed Troubleshooting:** `docs/TROUBLESHOOTING.md`
- **Database Viewing Guide:** `docs/VIEWING_DATA_IN_ORACLE.md`

### Getting More Help

If you're still stuck:
1. Read the `TROUBLESHOOTING.md` file in the `docs` folder
2. Check error messages carefully - they often tell you what's wrong
3. Make sure all previous steps were completed successfully
4. Ask your group members or instructor for help

---

## Summary: Quick Start Checklist

Once everything is set up, here's what you do each time:

1. ✅ Make sure Oracle Database is running
2. ✅ Open Command Prompt
3. ✅ Navigate to project folder: `cd C:\Users\YourName\Documents\SFHMS`
4. ✅ Start the server: `pnpm dev`
5. ✅ Open browser: http://localhost:3000
6. ✅ Login with any account from the credentials list
7. ✅ When done, press `Ctrl + C` to stop the server

---

## Notes for Group Members

- **Don't delete** the `.env.local` file
- **Don't modify** database scripts unless you know what you're doing
- **Don't share** the admin password outside your group
- **Always stop** the server (`Ctrl + C`) before closing Command Prompt
- **Keep backup** of the database by exporting it regularly

---

**Project Version:** 1.0  
**Last Updated:** December 3, 2025  
**Database:** Oracle 21c XE  
**Framework:** Next.js 15 + React 18  

Good luck with your project! 🚀
