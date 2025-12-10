/*================================================================================
  VIEWS for REPORTING AND DASHBOARD (Demonstrates various JOIN types)
  Execute this script FOURTH
  
  This file demonstrates:
  - INNER JOIN: View 1 (vw_student_full_profile)
  - LEFT JOIN: View 2, 5, 7 (vw_coach_student_overview, vw_recent_fitness_activity, vw_nurse_dashboard)
  - INNER JOIN with aggregation: View 4, 6 (vw_upcoming_appointments, vw_student_goal_progress)
  - Advanced WHERE with JOIN: View 3 (vw_health_risk_alerts)
  - FULL OUTER JOIN: View 8 (vw_students_coaches_complete)
================================================================================*/

-- =============================================================================
-- View 1: Complete Student Profile
-- JOIN TYPE: INNER JOIN (3-way join)
-- PURPOSE: Shows only students with health profiles and user accounts
-- =============================================================================
create or replace view vw_student_full_profile as
   select s.studentid,
          s.firstname
          || ' '
          || s.lastname as fullname,
          s.dateofbirth,
          s.gender,
          s.emergencycontactphone,
          hp.height,
          hp.bloodtype,
          hp.allergies,
          hp.chronicconditions,
          u.email,
          u.username,
          s.createddate
     from student s
     join healthprofile hp
   on s.studentid = hp.fk_studentid
     join "User" u
   on s.fk_userid = u.userid;

-- =============================================================================
-- View 2: Coach Student Overview  
-- JOIN TYPE: LEFT JOIN (2 levels)
-- PURPOSE: Shows all coaches even if they don't have training plans or exercises
-- =============================================================================
create or replace view vw_coach_student_overview as
   select c.coachid,
          c.firstname
          || ' '
          || c.lastname as coachname,
          c.certification,
          tp.planid,
          tp.planname,
          tp.description,
          tp.startdate,
          tp.enddate,
          count(distinct pd.detailid) as exercisecount
     from coach c
     left join trainingplan tp
   on c.coachid = tp.fk_coachid
     left join plandetail pd
   on tp.planid = pd.fk_planid
    group by c.coachid,
             c.firstname,
             c.lastname,
             c.certification,
             tp.planid,
             tp.planname,
             tp.description,
             tp.startdate,
             tp.enddate;

-- View 3: Health Risk Alerts (BMI-based)
create or replace view vw_health_risk_alerts as
   select s.studentid,
          s.firstname
          || ' '
          || s.lastname as studentname,
          hp.height,
          hp.bloodtype,
          hp.allergies,
          hp.chronicconditions,
          case
             when hp.chronicconditions is not null then
                'High Risk'
             when hp.allergies is not null then
                'Medium Risk'
             else
                'Low Risk'
          end as healthrisklevel,
          case
             when hp.chronicconditions like '%Diabetes%' then
                'Requires Blood Sugar Monitoring'
             when hp.chronicconditions like '%Asthma%' then
                'Avoid High Intensity Cardio'
             when hp.allergies is not null then
                'Check Medication Interactions'
             else
                'No Special Precautions'
          end as recommendation
     from student s
     join healthprofile hp
   on s.studentid = hp.fk_studentid;

-- View 4: Upcoming Appointments
create or replace view vw_upcoming_appointments as
   select a.appointmentid,
          s.firstname
          || ' '
          || s.lastname as studentname,
          n.firstname
          || ' '
          || n.lastname as nursename,
          a.appointmentdate,
          a.appointmenttime,
          a.reason,
          a.status,
          trunc(a.appointmentdate) - trunc(sysdate) as daysuntilappointment
     from appointment a
     join student s
   on a.fk_studentid = s.studentid
     join nurse n
   on a.fk_nurseid = n.nurseid
    where a.appointmentdate >= trunc(sysdate)
    order by a.appointmentdate,
             a.appointmenttime;

-- View 5: Recent Fitness Activity
create or replace view vw_recent_fitness_activity as
   select s.studentid,
          s.firstname
          || ' '
          || s.lastname as studentname,
          fl.logid,
          fl.activitytype,
          fl.durationminutes,
          fl.caloriesburned,
          fl.distance,
          fl.logdate,
          trunc(sysdate) - trunc(fl.logdate) as daysago
     from fitnesslog fl
     join student s
   on fl.fk_studentid = s.studentid
    where fl.logdate >= trunc(sysdate) - 30
    order by fl.logdate desc;

-- View 6: Student Goal Progress
create or replace view vw_student_goal_progress as
   select s.studentid,
          s.firstname
          || ' '
          || s.lastname as studentname,
          g.goalid,
          g.goaltype,
          g.targetvalue,
          g.startdate,
          g.enddate,
          g.isachieved,
          trunc(sysdate) - trunc(g.startdate) as dayselapsed,
          case
             when g.enddate is not null then
                trunc(g.enddate) - trunc(sysdate)
             else
                null
          end as daysremaining
     from goal g
     join student s
   on g.fk_studentid = s.studentid
    order by g.enddate;

-- View 7: Nurse Dashboard
create or replace view vw_nurse_dashboard as
   select n.nurseid,
          n.firstname
          || ' '
          || n.lastname as nursename,
          n.licensenumber,
          count(distinct mr.recordid) as totalmedicalrecords,
          count(distinct a.appointmentid) as totalappointments,
          count(distinct
             case
                when a.status = 'Scheduled' then
                   a.appointmentid
             end
          ) as scheduledappointments,
          count(distinct
             case
                when a.status = 'Completed' then
                   a.appointmentid
             end
          ) as completedappointments
     from nurse n
     left join medicalrecord mr
   on n.nurseid = mr.fk_nurseid
     left join appointment a
   on n.nurseid = a.fk_nurseid
    group by n.nurseid,
             n.firstname,
             n.lastname,
             n.licensenumber;

commit;