/**
 * Check specific user's password hash and try to login
 */

const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');

const dbConfig = {
    user: 'sfhms_user',
    password: 'sfhms_password',
    connectString: 'localhost:1521/XEPDB1'
};

async function checkUser() {
    let connection;

    try {
        console.log('🔍 Checking user passwords...\n');

        connection = await oracledb.getConnection(dbConfig);

        // Check a few specific users
        const usernames = ['ali_ahmed', 'Mahnoor Naseer', 'meerab', 'sarah_williams', 'bob_m'];

        for (const username of usernames) {
            const result = await connection.execute(
                `SELECT UserID, Username, PasswordHash, Role, Email 
         FROM "User" 
         WHERE Username = :username`,
                { username },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rows && result.rows.length > 0) {
                const user = result.rows[0];
                console.log(`\n📋 User: ${user.USERNAME}`);
                console.log(`   Role: ${user.ROLE}`);
                console.log(`   Email: ${user.EMAIL}`);
                console.log(`   Password Hash: ${user.PASSWORDHASH.substring(0, 30)}...`);

                // Check if it's a bcrypt hash
                const isBcrypt = user.PASSWORDHASH.startsWith('$2b$') || user.PASSWORDHASH.startsWith('$2a$');
                console.log(`   Is Bcrypt: ${isBcrypt ? '✅ YES' : '❌ NO (plain text!)'}`);

                // Try to verify with common passwords
                if (isBcrypt) {
                    const testPasswords = ['student123', 'test123', 'password123', 'admin123'];
                    for (const pwd of testPasswords) {
                        const match = await bcrypt.compare(pwd, user.PASSWORDHASH);
                        if (match) {
                            console.log(`   ✅ Password is: ${pwd}`);
                            break;
                        }
                    }
                }
            } else {
                console.log(`\n⚠️  User not found: ${username}`);
            }
        }

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

checkUser().catch(console.error);
