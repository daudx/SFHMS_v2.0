/*================================================================================
  COMPREHENSIVE JOIN QUERIES TEST
  Testing all table relationships in SFHMS database
================================================================================*/

SET LINESIZE 200
SET PAGESIZE 50
SET FEEDBACK ON

PROMPT ========================================
PROMPT 1. USER-STUDENT JOIN
PROMPT ========================================
SELECT u.UserID, u.Username, u.Role, s.StudentID, s.FirstName, s.LastName
FROM "User" u
INNER JOIN Student s ON u.UserID = s.FK_UserID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 2. USER-COACH JOIN
PROMPT ========================================
SELECT u.UserID, u.Username, u.Role, c.CoachID, c.FirstName, c.LastName, c.Certification
FROM "User" u
INNER JOIN Coach c ON u.UserID = c.FK_UserID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 3. USER-NURSE JOIN
PROMPT ========================================
SELECT u.UserID, u.Username, u.Role, n.NurseID, n.FirstName, n.LastName, n.LicenseNumber
FROM "User" u
INNER JOIN Nurse n ON u.UserID = n.FK_UserID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 4. STUDENT-HEALTHPROFILE JOIN
PROMPT ========================================
SELECT s.StudentID, s.FirstName, s.LastName, 
       hp.Height, hp.BloodType, hp.Allergies, hp.ChronicConditions
FROM Student s
LEFT JOIN HealthProfile hp ON s.StudentID = hp.FK_StudentID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 5. STUDENT-FITNESSLOG JOIN
PROMPT ========================================
SELECT s.StudentID, s.FirstName, s.LastName,
       fl.LogID, fl.ActivityType, fl.DurationMinutes, fl.CaloriesBurned, fl.LogDate
FROM Student s
INNER JOIN FitnessLog fl ON s.StudentID = fl.FK_StudentID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 6. COACH-TRAININGPLAN JOIN
PROMPT ========================================
SELECT c.CoachID, c.FirstName || ' ' || c.LastName as CoachName,
       tp.PlanID, tp.PlanName, tp.StartDate, tp.EndDate
FROM Coach c
INNER JOIN TrainingPlan tp ON c.CoachID = tp.FK_CoachID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 7. TRAININGPLAN-PLANDETAIL JOIN
PROMPT ========================================
SELECT tp.PlanID, tp.PlanName,
       pd.DetailID, pd.DayOfWeek, pd.ExerciseName, pd.Sets, pd.Reps
FROM TrainingPlan tp
INNER JOIN PlanDetail pd ON tp.PlanID = pd.FK_PlanID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 8. COACH-FITNESSLOG-COACHFITNESSREVIEW (3-way JOIN)
PROMPT ========================================
SELECT c.FirstName || ' ' || c.LastName as CoachName,
       s.FirstName || ' ' || s.LastName as StudentName,
       fl.ActivityType, fl.LogDate,
       cfr.ReviewDate, cfr.ReviewNotes
FROM Coach c
INNER JOIN CoachFitnessReview cfr ON c.CoachID = cfr.FK_CoachID
INNER JOIN FitnessLog fl ON cfr.FK_LogID = fl.LogID
INNER JOIN Student s ON fl.FK_StudentID = s.StudentID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 9. NURSE-APPOINTMENT-STUDENT JOIN
PROMPT ========================================
SELECT n.FirstName || ' ' || n.LastName as NurseName,
       s.FirstName || ' ' || s.LastName as StudentName,
       a.AppointmentDate, a.AppointmentTime, a.Status, a.Reason
FROM Nurse n
INNER JOIN Appointment a ON n.NurseID = a.FK_NurseID
INNER JOIN Student s ON a.FK_StudentID = s.StudentID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 10. NURSE-MEDICALRECORD-STUDENT JOIN
PROMPT ========================================
SELECT n.FirstName || ' ' || n.LastName as NurseName,
       s.FirstName || ' ' || s.LastName as StudentName,
       mr.VisitDate, mr.Diagnosis, mr.Prescription
FROM Nurse n
INNER JOIN MedicalRecord mr ON n.NurseID = mr.FK_NurseID
INNER JOIN Student s ON mr.FK_StudentID = s.StudentID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 11. STUDENT-GOAL JOIN
PROMPT ========================================
SELECT s.StudentID, s.FirstName, s.LastName,
       g.GoalID, g.GoalType, g.TargetValue, g.StartDate, g.EndDate, g.IsAchieved
FROM Student s
INNER JOIN Goal g ON s.StudentID = g.FK_StudentID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 12. STUDENT-HEALTHPROFILE-FITNESSLOG (3-way JOIN)
PROMPT ========================================
SELECT s.FirstName || ' ' || s.LastName as StudentName,
       hp.BloodType, hp.Height,
       fl.ActivityType, fl.CaloriesBurned, fl.LogDate
FROM Student s
INNER JOIN HealthProfile hp ON s.StudentID = hp.FK_StudentID
INNER JOIN FitnessLog fl ON s.StudentID = fl.FK_StudentID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 13. COMPLEX: STUDENT WITH ALL RELATIONSHIPS (LEFT JOINS)
PROMPT ========================================
SELECT StudentID, FirstName, LastName, BloodType,
       FitnessLogs, Goals, Appointments, MedicalRecords
FROM (
  SELECT s.StudentID, s.FirstName, s.LastName,
         hp.BloodType,
         COUNT(DISTINCT fl.LogID) as FitnessLogs,
         COUNT(DISTINCT g.GoalID) as Goals,
         COUNT(DISTINCT a.AppointmentID) as Appointments,
         COUNT(DISTINCT mr.RecordID) as MedicalRecords
  FROM Student s
  LEFT JOIN HealthProfile hp ON s.StudentID = hp.FK_StudentID
  LEFT JOIN FitnessLog fl ON s.StudentID = fl.FK_StudentID
  LEFT JOIN Goal g ON s.StudentID = g.FK_StudentID
  LEFT JOIN Appointment a ON s.StudentID = a.FK_StudentID
  LEFT JOIN MedicalRecord mr ON s.StudentID = mr.FK_StudentID
  GROUP BY s.StudentID, s.FirstName, s.LastName, hp.BloodType
  ORDER BY s.StudentID
)
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 14. USER-STUDENT-FITNESSLOG-COACH-REVIEW (Complex 5-way JOIN)
PROMPT ========================================
SELECT u.Username,
       s.FirstName || ' ' || s.LastName as StudentName,
       fl.ActivityType,
       c.FirstName || ' ' || c.LastName as CoachName,
       cfr.ReviewNotes
FROM "User" u
INNER JOIN Student s ON u.UserID = s.FK_UserID
INNER JOIN FitnessLog fl ON s.StudentID = fl.FK_StudentID
INNER JOIN CoachFitnessReview cfr ON fl.LogID = cfr.FK_LogID
INNER JOIN Coach c ON cfr.FK_CoachID = c.CoachID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT 15. FULL HEALTHCARE CHAIN: STUDENT-APPOINTMENT-NURSE-MEDICALRECORD
PROMPT ========================================
SELECT s.FirstName || ' ' || s.LastName as StudentName,
       a.AppointmentDate, a.Status as AppointmentStatus,
       n.FirstName || ' ' || n.LastName as NurseName,
       mr.Diagnosis, mr.Prescription
FROM Student s
INNER JOIN Appointment a ON s.StudentID = a.FK_StudentID
INNER JOIN Nurse n ON a.FK_NurseID = n.NurseID
LEFT JOIN MedicalRecord mr ON s.StudentID = mr.FK_StudentID AND n.NurseID = mr.FK_NurseID
WHERE ROWNUM <= 5;

PROMPT
PROMPT ========================================
PROMPT ALL JOIN QUERIES COMPLETED!
PROMPT ========================================

EXIT;
