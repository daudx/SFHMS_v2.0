/*================================================================================
  ANALYTICS QUERIES for INSIGHTS AND REPORTING
  Execute this script SIXTH
  
  Advanced SQL Features Demonstrated:
  - LIKE operator with wildcards (%)
  - Aggregate functions with HAVING clause
  - Subqueries (scalar, inline views)
  - Window functions (ROW_NUMBER, RANK)
  - Complex JOINs with multiple tables
  - Date arithmetic and functions
  - CASE expressions
  - Set operations (UNION, INTERSECT)
================================================================================*/

-- Query 1: Monthly Student Activity Summary
select extract(month from fl.logdate) as month,
       extract(year from fl.logdate) as year,
       s.firstname
       || ' '
       || s.lastname as studentname,
       fl.activitytype,
       count(fl.logid) as activitycount,
       sum(fl.durationminutes) as totalminutes,
       sum(fl.caloriesburned) as totalcalories
  from fitnesslog fl
  join student s
on fl.fk_studentid = s.studentid
 where fl.logdate >= trunc(sysdate) - 90
 group by extract(month from fl.logdate),
          extract(year from fl.logdate),
          s.firstname,
          s.lastname,
          fl.activitytype
 order by year desc,
          month desc,
          studentname;

-- Query 2: Students with Low Fitness Activity (Last 30 Days)
select s.studentid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       count(fl.logid) as activitycount,
       max(fl.logdate) as lastactivitydate,
       trunc(sysdate) - trunc(max(fl.logdate)) as dayssincelastactivity
  from student s
  left join fitnesslog fl
on s.studentid = fl.fk_studentid
   and fl.logdate >= trunc(sysdate) - 30
 group by s.studentid,
          s.firstname,
          s.lastname
having count(fl.logid) < 3
    or max(fl.logdate) is null
 order by dayssincelastactivity desc;

-- Query 3: Coach Training Plan Progress
select c.coachid,
       c.firstname
       || ' '
       || c.lastname as coachname,
       count(distinct tp.planid) as totalplans,
       count(distinct pd.detailid) as totalexercises,
       min(tp.startdate) as earliestplanstart,
       max(tp.enddate) as latestplanend
  from coach c
  left join trainingplan tp
on c.coachid = tp.fk_coachid
  left join plandetail pd
on tp.planid = pd.fk_planid
 group by c.coachid,
          c.firstname,
          c.lastname;

-- Query 4: Students Nearing Their Fitness Goals
select s.studentid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       g.goalid,
       g.goaltype,
       g.targetvalue,
       g.enddate,
       trunc(g.enddate) - trunc(sysdate) as daysremaining,
       case
          when trunc(g.enddate) - trunc(sysdate) <= 30 then
             'Due Soon'
          when trunc(g.enddate) - trunc(sysdate) <= 60 then
             'Coming Up'
          else
             'On Track'
       end as goalstatus
  from goal g
  join student s
on g.fk_studentid = s.studentid
 where g.isachieved = 'N'
   and g.enddate is not null
   and g.enddate >= trunc(sysdate)
 order by g.enddate;

-- Query 5: Nurse Workload Dashboard
select n.nurseid,
       n.firstname
       || ' '
       || n.lastname as nursename,
       count(distinct mr.recordid) as totalmedicalrecords,
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
       ) as completedappointments,
       count(distinct
          case
             when a.status = 'Cancelled' then
                a.appointmentid
          end
       ) as cancelledappointments
  from nurse n
  left join medicalrecord mr
on n.nurseid = mr.fk_nurseid
  left join appointment a
on n.nurseid = a.fk_nurseid
 group by n.nurseid,
          n.firstname,
          n.lastname;

-- Query 6: Top Fitness Activities
select fl.activitytype,
       count(fl.logid) as frequency,
       avg(fl.durationminutes) as avgduration,
       avg(fl.caloriesburned) as avgcalories,
       max(fl.caloriesburned) as maxcalories,
       min(fl.caloriesburned) as mincalories
  from fitnesslog fl
 group by fl.activitytype
 order by frequency desc;

-- =============================================================================
-- ADVANCED SQL FEATURES DEMONSTRATIONS
-- =============================================================================

-- Query 11: LIKE Operator with Wildcards - Find Students with Specific Conditions
-- Demonstrates: LIKE, wildcards (%), UPPER for case-insensitive search
select s.studentid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       hp.chronicconditions,
       hp.allergies
  from student s
  join healthprofile hp
on s.studentid = hp.fk_studentid
 where upper(hp.chronicconditions) like '%DIABETES%'
    or upper(hp.chronicconditions) like '%ASTHMA%'
    or upper(hp.allergies) like '%PEANUT%'
 order by s.lastname;

-- Query 12: Aggregate with HAVING - High-Activity Students
-- Demonstrates: GROUP BY, HAVING with aggregate conditions
select s.studentid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       count(fl.logid) as totalactivities,
       sum(fl.caloriesburned) as totalcalories,
       avg(fl.durationminutes) as avgduration
  from student s
  join fitnesslog fl
on s.studentid = fl.fk_studentid
 group by s.studentid,
          s.firstname,
          s.lastname
having count(fl.logid) >= 5
   and sum(fl.caloriesburned) > 1000
 order by totalcalories desc;

-- Query 13: Subquery - Students with Above Average Activity
-- Demonstrates: Scalar subquery in WHERE clause
select s.studentid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       count(fl.logid) as activitycount
  from student s
  join fitnesslog fl
on s.studentid = fl.fk_studentid
 group by s.studentid,
          s.firstname,
          s.lastname
having count(fl.logid) > (
   select avg(activitycount)
     from (
      select count(*) as activitycount
        from fitnesslog
       group by fk_studentid
   )
)
 order by activitycount desc;

-- Query 14: Correlated Subquery - Students Without Recent Activity
-- Demonstrates: EXISTS, NOT EXISTS, correlated subquery
select s.studentid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       s.email
  from student s
  join "User" u
on s.fk_userid = u.userid
 where not exists (
   select 1
     from fitnesslog fl
    where fl.fk_studentid = s.studentid
      and fl.logdate >= trunc(sysdate) - 30
);

-- Query 15: Window Functions - Rank Students by Activity
-- Demonstrates: ROW_NUMBER(), RANK(), DENSE_RANK()
select studentname,
       totalactivities,
       totalcalories,
       row_number()
       over(
           order by totalcalories desc
       ) as rownum,
       rank()
       over(
           order by totalcalories desc
       ) as rank,
       dense_rank()
       over(
           order by totalcalories desc
       ) as denserank
  from (
   select s.firstname
          || ' '
          || s.lastname as studentname,
          count(fl.logid) as totalactivities,
          sum(fl.caloriesburned) as totalcalories
     from student s
     join fitnesslog fl
   on s.studentid = fl.fk_studentid
    group by s.firstname,
             s.lastname
)
 where totalactivities > 0;

-- Query 16: Set Operations - Students in Both Fitness and Medical Programs
-- Demonstrates: INTERSECT
select fk_studentid as studentid,
       'Has Fitness Activity' as program
  from fitnesslog
intersect
select fk_studentid,
       'Has Medical Records' as program
  from medicalrecord;

-- Query 17: Complex Join with Multiple Aggregations
-- Demonstrates: Multiple LEFT JOINs, COUNT DISTINCT, complex aggregations
select s.studentid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       count(distinct fl.logid) as fitnesslogs,
       count(distinct g.goalid) as goals,
       count(distinct a.appointmentid) as appointments,
       count(distinct mr.recordid) as medicalrecords,
       case
          when count(distinct fl.logid) > 10 then
             'High Activity'
          when count(distinct fl.logid) > 5  then
             'Medium Activity'
          else
             'Low Activity'
       end as activitylevel
  from student s
  left join fitnesslog fl
on s.studentid = fl.fk_studentid
  left join goal g
on s.studentid = g.fk_studentid
  left join appointment a
on s.studentid = a.fk_studentid
  left join medicalrecord mr
on s.studentid = mr.fk_studentid
 group by s.studentid,
          s.firstname,
          s.lastname
 order by fitnesslogs desc;

-- Query 18: Advanced Search with Multiple Wildcards
-- Demonstrates: Multiple LIKE conditions, OR logic
select s.firstname
       || ' '
       || s.lastname as studentname,
       s.gender,
       hp.bloodtype,
       hp.allergies,
       hp.chronicconditions
  from student s
  join healthprofile hp
on s.studentid = hp.fk_studentid
 where s.lastname like 'S%'
    or hp.bloodtype like 'A%'
    or upper(hp.allergies) like '%DAIRY%'
 order by s.lastname;

-- Query 19: Time-based Analytics with Date Functions
-- Demonstrates: EXTRACT, date arithmetic, TRUNC
select extract(year from fl.logdate) as year,
       extract(month from fl.logdate) as month,
       to_char(
          fl.logdate,
          'Month'
       ) as monthname,
       count(*) as totallogs,
       sum(fl.caloriesburned) as totalcalories,
       round(
          avg(fl.durationminutes),
          2
       ) as avgduration
  from fitnesslog fl
 where fl.logdate >= add_months(
   trunc(sysdate),
   -6
)
 group by extract(year from fl.logdate),
          extract(month from fl.logdate),
          to_char(
             fl.logdate,
             'Month'
          )
having count(*) > 2
 order by year desc,
          month desc;

-- Query 20: Pivot-style Report using CASE
-- Demonstrates: Conditional aggregation (pivot without PIVOT keyword)
select s.studentid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       sum(
          case
             when fl.activitytype = 'Running' then
                1
             else
                0
          end
       ) as runningcount,
       sum(
          case
             when fl.activitytype = 'Swimming' then
                1
             else
                0
          end
       ) as swimmingcount,
       sum(
          case
             when fl.activitytype = 'Cycling' then
                1
             else
                0
          end
       ) as cyclingcount,
       sum(
          case
             when fl.activitytype = 'Weightlifting' then
                1
             else
                0
          end
       ) as weightliftingcount,
       count(fl.logid) as totalactivities
  from student s
  left join fitnesslog fl
on s.studentid = fl.fk_studentid
 group by s.studentid,
          s.firstname,
          s.lastname
having count(fl.logid) > 0
 order by totalactivities desc;

-- Query 7: Health Profile Statistics
select hp.bloodtype,
       count(s.studentid) as studentcount,
       count(
          case
             when hp.allergies is not null then
                1
          end
       ) as studentswithallergies,
       count(
          case
             when hp.chronicconditions is not null then
                1
          end
       ) as studentswithchronicconditions,
       avg(hp.height) as avgheight
  from healthprofile hp
  join student s
on hp.fk_studentid = s.studentid
 group by hp.bloodtype;

-- Query 8: Goal Achievement Rate
select g.goaltype,
       count(g.goalid) as totalgoals,
       count(
          case
             when g.isachieved = 'Y' then
                1
          end
       ) as achievedgoals,
       round(
          count(
             case
                when g.isachieved = 'Y' then
                   1
             end
          ) * 100.0 / count(g.goalid),
          2
       ) as achievementrate
  from goal g
 group by g.goaltype;

-- Query 9: Student Engagement Score (based on activity and appointments)
select s.studentid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       count(distinct fl.logid) as fitnessactivities,
       count(distinct mr.recordid) as medicalvisits,
       count(distinct g.goalid) as activegoals,
       ( count(distinct fl.logid) + count(distinct mr.recordid) + count(distinct g.goalid) ) as engagementscore
  from student s
  left join fitnesslog fl
on s.studentid = fl.fk_studentid
  left join medicalrecord mr
on s.studentid = mr.fk_studentid
  left join goal g
on s.studentid = g.fk_studentid
   and g.isachieved = 'N'
 group by s.studentid,
          s.firstname,
          s.lastname
 order by engagementscore desc;

-- Query 10: Recent Medical Alerts
select mr.recordid,
       s.firstname
       || ' '
       || s.lastname as studentname,
       mr.visitdate,
       mr.diagnosis,
       mr.prescription,
       n.firstname
       || ' '
       || n.lastname as nursename,
       trunc(sysdate) - trunc(mr.visitdate) as dayssincevisit
  from medicalrecord mr
  join student s
on mr.fk_studentid = s.studentid
  join nurse n
on mr.fk_nurseid = n.nurseid
 where mr.visitdate >= trunc(sysdate) - 7
 order by mr.visitdate desc;