/*================================================================================
  STORED PROCEDURES for BUSINESS LOGIC
  Execute this script FIFTH
================================================================================*/

-- Procedure 1: Add Fitness Log
CREATE OR REPLACE PROCEDURE sp_add_fitness_log(
    p_student_id NUMBER,
    p_activity_type VARCHAR2,
    p_duration_minutes NUMBER,
    p_calories_burned NUMBER,
    p_distance NUMBER,
    p_log_date DATE
) AS
BEGIN
    INSERT INTO FitnessLog (ActivityType, DurationMinutes, CaloriesBurned, Distance, LogDate, FK_StudentID)
    VALUES (p_activity_type, p_duration_minutes, p_calories_burned, p_distance, p_log_date, p_student_id);
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Fitness log added successfully for Student ID: ' || p_student_id);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error adding fitness log: ' || SQLERRM);
END sp_add_fitness_log;
/

-- Procedure 2: Alert on Health Threshold
CREATE OR REPLACE PROCEDURE sp_check_health_alerts(
    p_student_id NUMBER
) AS
    v_chronic_conditions VARCHAR2(255);
BEGIN
    SELECT ChronicConditions INTO v_chronic_conditions
    FROM HealthProfile
    WHERE FK_StudentID = p_student_id;
    
    IF v_chronic_conditions IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('ALERT: Student ' || p_student_id || ' has chronic conditions: ' || v_chronic_conditions);
    ELSE
        DBMS_OUTPUT.PUT_LINE('No health alerts for Student ' || p_student_id);
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No health profile found for Student ' || p_student_id);
END sp_check_health_alerts;
/

-- Procedure 3: Assign Student to Coach
CREATE OR REPLACE PROCEDURE sp_assign_student_to_coach(
    p_coach_id NUMBER,
    p_plan_name VARCHAR2,
    p_start_date DATE,
    p_end_date DATE
) AS
BEGIN
    INSERT INTO TrainingPlan (PlanName, Description, StartDate, EndDate, FK_CoachID)
    VALUES (p_plan_name, 'Training plan assigned by coach', p_start_date, p_end_date, p_coach_id);
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Training plan created for Coach ID: ' || p_coach_id);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error creating training plan: ' || SQLERRM);
END sp_assign_student_to_coach;
/

-- Procedure 4: Schedule Appointment
CREATE OR REPLACE PROCEDURE sp_schedule_appointment(
    p_student_id NUMBER,
    p_nurse_id NUMBER,
    p_appointment_date DATE,
    p_appointment_time VARCHAR2,
    p_reason VARCHAR2
) AS
BEGIN
    INSERT INTO Appointment (AppointmentDate, AppointmentTime, Reason, Status, FK_StudentID, FK_NurseID)
    VALUES (p_appointment_date, p_appointment_time, p_reason, 'Scheduled', p_student_id, p_nurse_id);
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Appointment scheduled successfully.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error scheduling appointment: ' || SQLERRM);
END sp_schedule_appointment;
/

-- Procedure 5: Update Goal Status
CREATE OR REPLACE PROCEDURE sp_update_goal_status(
    p_goal_id NUMBER,
    p_is_achieved VARCHAR2
) AS
BEGIN
    UPDATE Goal
    SET IsAchieved = p_is_achieved
    WHERE GoalID = p_goal_id;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Goal ' || p_goal_id || ' status updated to: ' || p_is_achieved);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error updating goal: ' || SQLERRM);
END sp_update_goal_status;
/

-- Procedure 6: Generate Monthly Activity Report
CREATE OR REPLACE PROCEDURE sp_monthly_activity_report(
    p_year NUMBER,
    p_month NUMBER
) AS
    CURSOR activity_cursor IS
    SELECT 
        s.StudentID,
        s.FirstName || ' ' || s.LastName AS StudentName,
        COUNT(fl.LogID) AS TotalActivities,
        SUM(fl.DurationMinutes) AS TotalMinutes,
        SUM(fl.CaloriesBurned) AS TotalCalories,
        SUM(fl.Distance) AS TotalDistance
    FROM Student s
    LEFT JOIN FitnessLog fl ON s.StudentID = fl.FK_StudentID
        AND EXTRACT(YEAR FROM fl.LogDate) = p_year
        AND EXTRACT(MONTH FROM fl.LogDate) = p_month
    GROUP BY s.StudentID, s.FirstName, s.LastName;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Monthly Activity Report for ' || p_month || '/' || p_year || ' ===');
    FOR rec IN activity_cursor LOOP
        DBMS_OUTPUT.PUT_LINE('Student: ' || rec.StudentName || ' | Activities: ' || NVL(rec.TotalActivities, 0) || 
                           ' | Minutes: ' || NVL(rec.TotalMinutes, 0) || ' | Calories: ' || NVL(rec.TotalCalories, 0));
    END LOOP;
END sp_monthly_activity_report;
/

-- Procedure 7: Find Low Activity Students
CREATE OR REPLACE PROCEDURE sp_low_activity_alert(
    p_days_threshold NUMBER DEFAULT 30
) AS
    CURSOR low_activity_cursor IS
    SELECT 
        s.StudentID,
        s.FirstName || ' ' || s.LastName AS StudentName,
        MAX(fl.LogDate) AS LastActivityDate,
        TRUNC(SYSDATE) - TRUNC(MAX(fl.LogDate)) AS DaysSinceActivity
    FROM Student s
    LEFT JOIN FitnessLog fl ON s.StudentID = fl.FK_StudentID
    GROUP BY s.StudentID, s.FirstName, s.LastName
    HAVING TRUNC(SYSDATE) - TRUNC(MAX(fl.LogDate)) > p_days_threshold
       OR MAX(fl.LogDate) IS NULL;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Students with Low Activity (Last ' || p_days_threshold || ' days) ===');
    FOR rec IN low_activity_cursor LOOP
        DBMS_OUTPUT.PUT_LINE('Student: ' || rec.StudentName || ' | Days Inactive: ' || NVL(rec.DaysSinceActivity, 9999));
    END LOOP;
END sp_low_activity_alert;
/

COMMIT;
