-- Add daudx admin user
insert into "User" (
   userid,
   username,
   passwordhash,
   role,
   email
) values ( 100,
           'daudx',
           'admin123',
           'Admin',
           'daudx@university.edu' );

-- Add quick login test users for students (using existing studentids)
-- Update existing student users with easy credentials
update "User"
   set username = 'alice_j',
       passwordhash = 'student123'
 where userid = 1;
update "User"
   set username = 'bob_m',
       passwordhash = 'student123'
 where userid = 2;

-- Update existing coach users
update "User"
   set username = 'mike_coach',
       passwordhash = 'coach123'
 where userid = 6;
update "User"
   set username = 'sarah_coach',
       passwordhash = 'coach123'
 where userid = 7;

-- The nurse usernames are already good
update "User"
   set
   passwordhash = 'nurse123'
 where userid in ( 8,
                   9,
                   10,
                   11 );

commit;

-- Display all users for verification
select 'All Users After Update:' as info
  from dual;
select userid,
       username,
       role,
       email
  from "User"
 order by role,
          userid;

EXIT;