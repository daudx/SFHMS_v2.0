/*================================================================================
  UPDATE DEMO USER PASSWORDS WITH BCRYPT HASHES
  
  This script updates all demo user passwords to use bcrypt hashed passwords
  instead of plain text passwords.
  
  Run this script after fixing the authentication system to ensure all demo
  users can login successfully.
================================================================================*/

PROMPT Updating demo user passwords with bcrypt hashes...

-- Admin user (daudx / admin123)
UPDATE "User" 
SET PasswordHash = '$2b$10$5OUAtIhzJo80PoGpB7696.rZy6AOsRrich/HSXfxwVIy.N0MXbRwO'
WHERE Username = 'daudx';

-- Student users (password: student123)
UPDATE "User" 
SET PasswordHash = '$2b$10$WjCUmKmtLw09Tr1AyXbNOO406dG2GyGu0FVqIbKxqju579OR6Pu9a'
WHERE Username IN ('alice_j', 'bob_m', 'emma_student', 'alex_student');

-- Coach users (password: coach123)
UPDATE "User" 
SET PasswordHash = '$2b$10$jaLifiFJpi5TwliSqOsGw.t3p35Z.SlWeEPlPSqqLmlxDW6Q/LQ9G'
WHERE Username IN ('mike_coach', 'sarah_coach');

-- Nurse users (password: nurse123)
UPDATE "User" 
SET PasswordHash = '$2b$10$nn01uttUunY6LfNN0MmIveK8fyO5yuWUurGjzHmVlVR5yv2CAmQ3O'
WHERE Username IN ('robert_nurse', 'linda_nurse');

COMMIT;

PROMPT ============================================================
PROMPT Demo user passwords updated successfully!
PROMPT ============================================================
PROMPT 
PROMPT You can now login with these credentials:
PROMPT   - Admin:   daudx / admin123
PROMPT   - Student: bob_m / student123  
PROMPT   - Coach:   mike_coach / coach123
PROMPT   - Nurse:   robert_nurse / nurse123
PROMPT ============================================================

-- Display updated users
SELECT Username, Role, Email, 
       SUBSTR(PasswordHash, 1, 20) || '...' AS PasswordHash_Preview
FROM "User"
WHERE Username IN ('daudx', 'bob_m', 'mike_coach', 'robert_nurse')
ORDER BY Role, Username;

EXIT;
