/**
 * Check existing usernames and emails in database
 */

const oracledb = require('oracledb');

const dbConfig = {
    user: 'sfhms_user',
    password: 'sfhms_password',
    connectString: 'localhost:1521/XEPDB1'
};

async function checkExistingUsers() {
    let connection;

    try {
        console.log('🔍 Checking existing users in database...\n');

        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `SELECT UserID, Username, Email, Role 
       FROM "User" 
       ORDER BY Role, Username`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log('📋 Existing Users:\n');
        console.log('ID'.padEnd(6) + 'Username'.padEnd(20) + 'Email'.padEnd(35) + 'Role');
        console.log('='.repeat(80));

        result.rows.forEach(row => {
            console.log(
                String(row.USERID).padEnd(6) +
                row.USERNAME.padEnd(20) +
                row.EMAIL.padEnd(35) +
                row.ROLE
            );
        });

        console.log('\n' + '='.repeat(80));
        console.log(`Total users: ${result.rows.length}`);
        console.log('\n💡 When creating a new user, use a DIFFERENT username and email!');
        console.log('\nExample for testing:');
        console.log('  Username: john_smith');
        console.log('  Email: john.smith@test.com');
        console.log('  Role: Student');
        console.log('  Password: test123');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

checkExistingUsers().catch(console.error);
