/*================================================================================
  SAMPLE DATA INSERTION
  Realistic data for testing and demonstration
  Execute this script THIRD
================================================================================*/

-- Insert Users (System role-based)
insert into "User" (
   username,
   passwordhash,
   role,
   email
) values ( 'john_student',
           'hash1234',
           'Student',
           'john@university.edu' );

insert into "User" (
   username,
   passwordhash,
   role,
   email
) values ( 'sarah_student',
           'hash1234',
           'Student',
           'sarah@university.edu' );

insert into "User" (
   username,
   passwordhash,
   role,
   email
) values ( 'mike_student',
           'hash1234',
           'Student',
           'mike@university.edu' );

insert into "User" (
   username,
   passwordhash,
   role,
   email
) values ( 'emma_student',
           'hash1234',
           'Student',
           'emma@university.edu' );

insert into "User" (
   username,
   passwordhash,
   role,
   email
) values ( 'alex_student',
           'hash1234',
           'Student',
           'alex@university.edu' );

insert into "User" (
   username,
   passwordhash,
   role,
   email
) values ( 'coach_james',
           'hash1234',
           'Coach',
           'james@university.edu' );

insert into "User" (
   username,
   passwordhash,
   role,
   email
) values ( 'coach_lisa',
           'hash1234',
           'Coach',
           'lisa@university.edu' );

insert into "User" (
   username,
   passwordhash,
   role,
   email
) values ( 'nurse_patricia',
           'hash1234',
           'Nurse',
           'patricia@university.edu' );

insert into "User" (
   username,
   passwordhash,
   role,
   email
) values ( 'nurse_robert',
           'hash1234',
           'Nurse',
           'robert@university.edu' );

-- Insert Students
insert into student (
   firstname,
   lastname,
   dateofbirth,
   gender,
   emergencycontactphone,
   fk_userid
) values ( 'John',
           'Miller',
           to_date('2003-05-15','YYYY-MM-DD'),
           'M',
           '555-0001',
           1 );

insert into student (
   firstname,
   lastname,
   dateofbirth,
   gender,
   emergencycontactphone,
   fk_userid
) values ( 'Sarah',
           'Johnson',
           to_date('2002-08-22','YYYY-MM-DD'),
           'F',
           '555-0002',
           2 );

insert into student (
   firstname,
   lastname,
   dateofbirth,
   gender,
   emergencycontactphone,
   fk_userid
) values ( 'Mike',
           'Davis',
           to_date('2003-12-10','YYYY-MM-DD'),
           'M',
           '555-0003',
           3 );

insert into student (
   firstname,
   lastname,
   dateofbirth,
   gender,
   emergencycontactphone,
   fk_userid
) values ( 'Emma',
           'Wilson',
           to_date('2002-03-28','YYYY-MM-DD'),
           'F',
           '555-0004',
           4 );

insert into student (
   firstname,
   lastname,
   dateofbirth,
   gender,
   emergencycontactphone,
   fk_userid
) values ( 'Alex',
           'Brown',
           to_date('2003-07-05','YYYY-MM-DD'),
           'Other',
           '555-0005',
           5 );

-- Insert Coaches
insert into coach (
   firstname,
   lastname,
   certification,
   contactphone,
   fk_userid
) values ( 'James',
           'Anderson',
           'NASM CPT',
           '555-1001',
           6 );

insert into coach (
   firstname,
   lastname,
   certification,
   contactphone,
   fk_userid
) values ( 'Lisa',
           'Martinez',
           'ACE CPT, Yoga Instructor',
           '555-1002',
           7 );

-- Insert Nurses
insert into nurse (
   firstname,
   lastname,
   licensenumber,
   fk_userid
) values ( 'Patricia',
           'Garcia',
           'RN-2024-001',
           8 );

insert into nurse (
   firstname,
   lastname,
   licensenumber,
   fk_userid
) values ( 'Robert',
           'Thompson',
           'RN-2024-002',
           9 );

-- Insert Health Profiles
insert into healthprofile (
   height,
   bloodtype,
   allergies,
   chronicconditions,
   fk_studentid
) values ( 5.9,
           'O+',
           'Penicillin',
           null,
           1 );

insert into healthprofile (
   height,
   bloodtype,
   allergies,
   chronicconditions,
   fk_studentid
) values ( 5.6,
           'A+',
           null,
           null,
           2 );

insert into healthprofile (
   height,
   bloodtype,
   allergies,
   chronicconditions,
   fk_studentid
) values ( 6.1,
           'B+',
           'Shellfish',
           'Asthma',
           3 );

insert into healthprofile (
   height,
   bloodtype,
   allergies,
   chronicconditions,
   fk_studentid
) values ( 5.4,
           'AB-',
           null,
           null,
           4 );

insert into healthprofile (
   height,
   bloodtype,
   allergies,
   chronicconditions,
   fk_studentid
) values ( 5.8,
           'O-',
           'Latex',
           'Diabetes Type 2',
           5 );

-- Insert Fitness Logs
insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Running',
           30,
           300,
           3.2,
           trunc(sysdate) - 5,
           1 );

insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Running',
           30,
           300,
           3.1,
           trunc(sysdate) - 3,
           1 );

insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Cycling',
           45,
           350,
           12.5,
           trunc(sysdate) - 1,
           1 );

insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Gym - Strength',
           60,
           400,
           null,
           trunc(sysdate),
           1 );

insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Yoga',
           45,
           150,
           null,
           trunc(sysdate) - 4,
           2 );

insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Swimming',
           30,
           280,
           1.0,
           trunc(sysdate) - 2,
           2 );

insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Running',
           25,
           250,
           2.8,
           trunc(sysdate) - 6,
           3 );

insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Hiking',
           90,
           500,
           5.2,
           trunc(sysdate) - 8,
           3 );

insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Gym - Strength',
           50,
           350,
           null,
           trunc(sysdate) - 2,
           4 );

insert into fitnesslog (
   activitytype,
   durationminutes,
   caloriesburned,
   distance,
   logdate,
   fk_studentid
) values ( 'Basketball',
           60,
           450,
           null,
           trunc(sysdate) - 1,
           5 );

-- Insert Goals
insert into goal (
   goaltype,
   targetvalue,
   startdate,
   enddate,
   isachieved,
   fk_studentid
) values ( 'Distance Running',
           10,
           to_date('2024-01-01','YYYY-MM-DD'),
           to_date('2024-06-30','YYYY-MM-DD'),
           'N',
           1 );

insert into goal (
   goaltype,
   targetvalue,
   startdate,
   enddate,
   isachieved,
   fk_studentid
) values ( 'Weight Loss',
           15,
           to_date('2024-01-01','YYYY-MM-DD'),
           to_date('2024-12-31','YYYY-MM-DD'),
           'N',
           1 );

insert into goal (
   goaltype,
   targetvalue,
   startdate,
   enddate,
   isachieved,
   fk_studentid
) values ( 'Push-ups',
           50,
           to_date('2024-02-01','YYYY-MM-DD'),
           to_date('2024-08-31','YYYY-MM-DD'),
           'N',
           2 );

insert into goal (
   goaltype,
   targetvalue,
   startdate,
   enddate,
   isachieved,
   fk_studentid
) values ( 'Flexibility',
           180,
           to_date('2024-01-15','YYYY-MM-DD'),
           to_date('2024-09-15','YYYY-MM-DD'),
           'Y',
           2 );

insert into goal (
   goaltype,
   targetvalue,
   startdate,
   enddate,
   isachieved,
   fk_studentid
) values ( 'Muscle Gain',
           20,
           to_date('2024-03-01','YYYY-MM-DD'),
           to_date('2024-12-31','YYYY-MM-DD'),
           'N',
           3 );

insert into goal (
   goaltype,
   targetvalue,
   startdate,
   enddate,
   isachieved,
   fk_studentid
) values ( 'Cardio Endurance',
           60,
           to_date('2024-02-01','YYYY-MM-DD'),
           to_date('2024-11-30','YYYY-MM-DD'),
           'N',
           4 );

insert into goal (
   goaltype,
   targetvalue,
   startdate,
   enddate,
   isachieved,
   fk_studentid
) values ( 'Blood Sugar Control',
           110,
           to_date('2024-01-01','YYYY-MM-DD'),
           to_date('2024-12-31','YYYY-MM-DD'),
           'N',
           5 );

-- Insert Medical Records
insert into medicalrecord (
   visitdate,
   diagnosis,
   prescription,
   notes,
   fk_nurseid,
   fk_studentid
) values ( to_date('2024-10-01','YYYY-MM-DD'),
           'Common Cold',
           'Rest and Fluids',
           'Mild symptoms, advised to rest',
           1,
           1 );

insert into medicalrecord (
   visitdate,
   diagnosis,
   prescription,
   notes,
   fk_nurseid,
   fk_studentid
) values ( to_date('2024-09-15','YYYY-MM-DD'),
           'Muscle Strain',
           'Ibuprofen 400mg',
           'Lower back strain, recommended stretching',
           1,
           3 );

insert into medicalrecord (
   visitdate,
   diagnosis,
   prescription,
   notes,
   fk_nurseid,
   fk_studentid
) values ( to_date('2024-10-10','YYYY-MM-DD'),
           'Routine Checkup',
           null,
           'All vitals normal, healthy BMI',
           2,
           2 );

insert into medicalrecord (
   visitdate,
   diagnosis,
   prescription,
   notes,
   fk_nurseid,
   fk_studentid
) values ( to_date('2024-10-08','YYYY-MM-DD'),
           'Allergic Reaction',
           'Antihistamine',
           'Minor reaction, prescribed medication',
           2,
           4 );

insert into medicalrecord (
   visitdate,
   diagnosis,
   prescription,
   notes,
   fk_nurseid,
   fk_studentid
) values ( to_date('2024-10-05','YYYY-MM-DD'),
           'Blood Pressure Check',
           'Lifestyle Modification',
           'Slightly elevated, monitor and exercise',
           1,
           5 );

-- Insert Appointments
insert into appointment (
   appointmentdate,
   appointmenttime,
   reason,
   status,
   fk_studentid,
   fk_nurseid
) values ( to_date('2024-11-15','YYYY-MM-DD'),
           '09:00',
           'Routine Checkup',
           'Scheduled',
           1,
           1 );

insert into appointment (
   appointmentdate,
   appointmenttime,
   reason,
   status,
   fk_studentid,
   fk_nurseid
) values ( to_date('2024-11-16','YYYY-MM-DD'),
           '10:30',
           'Follow-up',
           'Scheduled',
           2,
           1 );

insert into appointment (
   appointmentdate,
   appointmenttime,
   reason,
   status,
   fk_studentid,
   fk_nurseid
) values ( to_date('2024-11-20','YYYY-MM-DD'),
           '14:00',
           'Injury Assessment',
           'Scheduled',
           3,
           2 );

insert into appointment (
   appointmentdate,
   appointmenttime,
   reason,
   status,
   fk_studentid,
   fk_nurseid
) values ( to_date('2024-11-10','YYYY-MM-DD'),
           '11:00',
           'Vaccination',
           'Completed',
           4,
           2 );

insert into appointment (
   appointmentdate,
   appointmenttime,
   reason,
   status,
   fk_studentid,
   fk_nurseid
) values ( to_date('2024-11-25','YYYY-MM-DD'),
           '15:30',
           'Blood Work',
           'Scheduled',
           5,
           1 );

-- Insert Training Plans
insert into trainingplan (
   planname,
   description,
   startdate,
   enddate,
   fk_coachid
) values ( 'Beginner Cardio',
           'Start building cardio endurance with low impact exercises',
           to_date('2024-11-01','YYYY-MM-DD'),
           to_date('2024-12-31','YYYY-MM-DD'),
           1 );

insert into trainingplan (
   planname,
   description,
   startdate,
   enddate,
   fk_coachid
) values ( 'Strength Building',
           'Progressive strength training program',
           to_date('2024-10-15','YYYY-MM-DD'),
           to_date('2025-01-31','YYYY-MM-DD'),
           1 );

insert into trainingplan (
   planname,
   description,
   startdate,
   enddate,
   fk_coachid
) values ( 'Yoga & Flexibility',
           'Improve flexibility and balance through yoga',
           to_date('2024-11-01','YYYY-MM-DD'),
           to_date('2024-12-31','YYYY-MM-DD'),
           2 );

-- Insert Plan Details
insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Monday',
           'Treadmill Running',
           1,
           30,
           1 );

insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Wednesday',
           'Elliptical',
           1,
           25,
           1 );

insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Friday',
           'Cycling',
           1,
           45,
           1 );

insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Monday',
           'Bench Press',
           4,
           8,
           2 );

insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Tuesday',
           'Squats',
           4,
           10,
           2 );

insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Wednesday',
           'Deadlifts',
           3,
           5,
           2 );

insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Thursday',
           'Pull-ups',
           3,
           8,
           2 );

insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Monday',
           'Morning Yoga',
           1,
           60,
           3 );

insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Wednesday',
           'Vinyasa Flow',
           1,
           60,
           3 );

insert into plandetail (
   dayofweek,
   exercisename,
   sets,
   reps,
   fk_planid
) values ( 'Friday',
           'Yin Yoga',
           1,
           90,
           3 );

-- Insert Coach Fitness Reviews
insert into coachfitnessreview (
   reviewdate,
   reviewnotes,
   fk_coachid,
   fk_logid
) values ( trunc(sysdate),
           'Great run! Maintaining good pace and form.',
           1,
           1 );

insert into coachfitnessreview (
   reviewdate,
   reviewnotes,
   fk_coachid,
   fk_logid
) values ( trunc(sysdate) - 1,
           'Excellent cycling session, increased distance.',
           1,
           3 );

insert into coachfitnessreview (
   reviewdate,
   reviewnotes,
   fk_coachid,
   fk_logid
) values ( trunc(sysdate) - 2,
           'Good yoga session, focus on breathing technique.',
           2,
           5 );

insert into coachfitnessreview (
   reviewdate,
   reviewnotes,
   fk_coachid,
   fk_logid
) values ( trunc(sysdate) - 3,
           'Swimming technique improving, keep going!',
           2,
           6 );

insert into coachfitnessreview (
   reviewdate,
   reviewnotes,
   fk_coachid,
   fk_logid
) values ( trunc(sysdate) - 4,
           'Strong hiking performance, good endurance.',
           1,
           8 );

commit;