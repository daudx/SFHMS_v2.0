/*================================================================================
  STUDENT HEALTH & FITNESS MONITORING SYSTEM (SHFMS)
  Oracle SQL Database Schema
  
  This script creates all tables with proper constraints and relationships
  Execute this script FIRST
================================================================================*/

-- =============================================================================
-- DROP EXISTING TABLES
-- =============================================================================
-- Using CASCADE CONSTRAINTS to handle foreign key dependencies automatically
-- PURGE removes tables permanently (skip recycle bin)

declare
   table_count number;
begin
   select count(*)
     into table_count
     from user_tables
    where table_name = 'COACHFITNESSREVIEW';
   if table_count > 0 then
      execute immediate 'DROP TABLE CoachFitnessReview CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'PLANDETAIL';
   if table_count > 0 then
      execute immediate 'DROP TABLE PlanDetail CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'TRAININGPLAN';
   if table_count > 0 then
      execute immediate 'DROP TABLE TrainingPlan CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'APPOINTMENT';
   if table_count > 0 then
      execute immediate 'DROP TABLE Appointment CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'MEDICALRECORD';
   if table_count > 0 then
      execute immediate 'DROP TABLE MedicalRecord CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'GOAL';
   if table_count > 0 then
      execute immediate 'DROP TABLE Goal CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'FITNESSLOG';
   if table_count > 0 then
      execute immediate 'DROP TABLE FitnessLog CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'HEALTHPROFILE';
   if table_count > 0 then
      execute immediate 'DROP TABLE HealthProfile CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'COACH';
   if table_count > 0 then
      execute immediate 'DROP TABLE Coach CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'NURSE';
   if table_count > 0 then
      execute immediate 'DROP TABLE Nurse CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'STUDENT';
   if table_count > 0 then
      execute immediate 'DROP TABLE Student CASCADE CONSTRAINTS PURGE';
   end if;
   select count(*)
     into table_count
     from user_tables
    where table_name = 'User';
   if table_count > 0 then
      execute immediate 'DROP TABLE "User" CASCADE CONSTRAINTS PURGE';
   end if;
end;
/

PROMPT Old tables dropped successfully (if they existed)

-- Create User table
create table "User" (
   userid       number primary key,
   username     varchar2(50) not null unique,
   passwordhash varchar2(255) not null,
   role         varchar2(20) not null,
   email        varchar2(100) not null unique,
   createddate  date default sysdate,
   constraint chk_user_role
      check ( role in ( 'Student',
                        'Coach',
                        'Nurse',
                        'Admin' ) )
);

-- Create Student table
create table student (
   studentid             number primary key,
   firstname             varchar2(50) not null,
   lastname              varchar2(50) not null,
   dateofbirth           date not null,
   gender                varchar2(10) not null,
   emergencycontactphone varchar2(20),
   fk_userid             number not null,
   createddate           date default sysdate,
   constraint fk_student_user foreign key ( fk_userid )
      references "User" ( userid )
         on delete cascade,
   constraint chk_student_gender
      check ( gender in ( 'M',
                          'F',
                          'Other' ) ),
   constraint chk_student_dob
      check ( dateofbirth >= date '1900-01-01'
         and dateofbirth <= date '2010-12-31' )
);

-- Create Coach table
create table coach (
   coachid       number primary key,
   firstname     varchar2(50) not null,
   lastname      varchar2(50) not null,
   certification varchar2(100),
   contactphone  varchar2(20),
   fk_userid     number not null,
   createddate   date default sysdate,
   constraint fk_coach_user foreign key ( fk_userid )
      references "User" ( userid )
         on delete cascade
);

-- Create Nurse table
create table nurse (
   nurseid       number primary key,
   firstname     varchar2(50) not null,
   lastname      varchar2(50) not null,
   licensenumber varchar2(50) not null unique,
   fk_userid     number not null,
   createddate   date default sysdate,
   constraint fk_nurse_user foreign key ( fk_userid )
      references "User" ( userid )
         on delete cascade
);

-- Create HealthProfile table (1:1 with Student)
create table healthprofile (
   profileid         number primary key,
   height            number(5,2),
   bloodtype         varchar2(5),
   allergies         varchar2(255),
   chronicconditions varchar2(255),
   fk_studentid      number not null unique,
   createddate       date default sysdate,
   lastupdated       date default sysdate,
   constraint fk_healthprofile_student foreign key ( fk_studentid )
      references student ( studentid )
         on delete cascade,
   constraint chk_height_positive
      check ( height > 0
         and height <= 300 )
);

-- Create FitnessLog table (1:M with Student)
create table fitnesslog (
   logid           number primary key,
   activitytype    varchar2(50) not null,
   durationminutes number,
   caloriesburned  number,
   distance        number(8,2),
   logdate         date not null,
   fk_studentid    number not null,
   createddate     date default sysdate,
   constraint fk_fitnesslog_student foreign key ( fk_studentid )
      references student ( studentid )
         on delete cascade,
   constraint chk_duration_positive check ( durationminutes > 0 ),
   constraint chk_calories_positive check ( caloriesburned >= 0 ),
   constraint chk_distance_positive check ( distance >= 0 )
);

-- Create MedicalRecord table (1:M with both Nurse and Student)
create table medicalrecord (
   recordid     number primary key,
   visitdate    date not null,
   diagnosis    varchar2(255),
   prescription varchar2(255),
   notes        varchar2(1000),
   fk_nurseid   number not null,
   fk_studentid number not null,
   createddate  date default sysdate,
   constraint fk_medicalrecord_nurse foreign key ( fk_nurseid )
      references nurse ( nurseid )
         on delete cascade,
   constraint fk_medicalrecord_student foreign key ( fk_studentid )
      references student ( studentid )
         on delete cascade
);

-- Create Goal table (1:M with Student)
create table goal (
   goalid       number primary key,
   goaltype     varchar2(50) not null,
   targetvalue  number,
   startdate    date not null,
   enddate      date,
   isachieved   varchar2(1) default 'N',
   fk_studentid number not null,
   createddate  date default sysdate,
   constraint fk_goal_student foreign key ( fk_studentid )
      references student ( studentid )
         on delete cascade,
   constraint chk_goal_achieved check ( isachieved in ( 'Y',
                                                        'N' ) ),
   constraint chk_goal_dates
      check ( enddate is null
          or enddate >= startdate ),
   constraint chk_targetvalue_positive check ( targetvalue > 0 )
);

-- Create Appointment table (1:M with Nurse and Student)
create table appointment (
   appointmentid   number primary key,
   appointmentdate date not null,
   appointmenttime varchar2(5),
   reason          varchar2(255),
   status          varchar2(20) default 'Scheduled',
   fk_studentid    number not null,
   fk_nurseid      number not null,
   createddate     date default sysdate,
   constraint fk_appointment_student foreign key ( fk_studentid )
      references student ( studentid )
         on delete cascade,
   constraint fk_appointment_nurse foreign key ( fk_nurseid )
      references nurse ( nurseid )
         on delete cascade,
   constraint chk_appointment_status
      check ( status in ( 'Scheduled',
                          'Completed',
                          'Cancelled' ) )
);

-- Create TrainingPlan table (1:M with Coach)
create table trainingplan (
   planid      number primary key,
   planname    varchar2(100) not null,
   description varchar2(500),
   startdate   date not null,
   enddate     date,
   fk_coachid  number not null,
   createddate date default sysdate,
   constraint fk_trainingplan_coach foreign key ( fk_coachid )
      references coach ( coachid )
         on delete cascade,
   constraint chk_plan_dates
      check ( enddate is null
          or enddate >= startdate )
);

-- Create PlanDetail table (1:M with TrainingPlan)
create table plandetail (
   detailid     number primary key,
   dayofweek    varchar2(20) not null,
   exercisename varchar2(100) not null,
   sets         number,
   reps         number,
   fk_planid    number not null,
   createddate  date default sysdate,
   constraint fk_plandetail_plan foreign key ( fk_planid )
      references trainingplan ( planid )
         on delete cascade,
   constraint chk_dayofweek
      check ( dayofweek in ( 'Monday',
                             'Tuesday',
                             'Wednesday',
                             'Thursday',
                             'Friday',
                             'Saturday',
                             'Sunday' ) ),
   constraint chk_sets_positive check ( sets > 0 ),
   constraint chk_reps_positive check ( reps > 0 )
);

-- Create CoachFitnessReview table (M:M between Coach and FitnessLog)
create table coachfitnessreview (
   reviewid    number primary key,
   reviewdate  date not null,
   reviewnotes varchar2(500),
   fk_coachid  number not null,
   fk_logid    number not null,
   createddate date default sysdate,
   constraint fk_review_coach foreign key ( fk_coachid )
      references coach ( coachid )
         on delete cascade,
   constraint fk_review_log foreign key ( fk_logid )
      references fitnesslog ( logid )
         on delete cascade
);

-- Create indexes for better query performance
create index idx_student_userid on
   student (
      fk_userid
   );
create index idx_coach_userid on
   coach (
      fk_userid
   );
create index idx_nurse_userid on
   nurse (
      fk_userid
   );
create index idx_fitnesslog_student on
   fitnesslog (
      fk_studentid
   );
create index idx_fitnesslog_date on
   fitnesslog (
      logdate
   );
create index idx_medicalrecord_student on
   medicalrecord (
      fk_studentid
   );
create index idx_medicalrecord_nurse on
   medicalrecord (
      fk_nurseid
   );
create index idx_goal_student on
   goal (
      fk_studentid
   );
create index idx_appointment_student on
   appointment (
      fk_studentid
   );
create index idx_appointment_nurse on
   appointment (
      fk_nurseid
   );

commit;