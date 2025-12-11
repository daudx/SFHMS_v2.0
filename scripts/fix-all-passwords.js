/**
 * Update ALL users with plain text passwords to bcrypt hashes
 */

const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');

const dbConfig = {
    user: 'sfhms_user',
    password: 'sfhms_password',
    connectString: 'localhost:1521/XEPDB1'
};

async function updateAllPasswords() {
    let connection;

    try {
        console.log('🔐 Updating ALL plain text passwords to bcrypt hashes...\n');

        connection = await oracledb.getConnection(dbConfig);

        // Get all users
        const result = await connection.execute(
            `SELECT UserID, Username, PasswordHash, Role 
       FROM "User" 
       ORDER BY UserID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        let updated = 0;
        let skipped = 0;

        for (const user of result.rows) {
            const isBcrypt = user.PASSWORDHASH.startsWith('$2b$') || user.PASSWORDHASH.startsWith('$2a$');

            if (!isBcrypt) {
                // Plain text password - need to hash it
                const plainPassword = user.PASSWORDHASH;
                const hash = await bcrypt.hash(plainPassword, 10);

                await connection.execute(
                    `UPDATE "User" SET PasswordHash = :hash WHERE UserID = :userId`,
                    { hash, userId: user.USERID },
                    { autoCommit: false }
                );

                console.log(`✅ Updated: ${user.USERNAME.padEnd(20)} (${user.ROLE}) - Password was: ${plainPassword}`);
                updated++;
            } else {
                console.log(`⏭️  Skipped: ${user.USERNAME.padEnd(20)} (${user.ROLE}) - Already hashed`);
                skipped++;
            }
        }

        // Commit all changes
        await connection.commit();

        console.log('\n' + '='.repeat(70));
        console.log(`✅ Updated: ${updated} users`);
        console.log(`⏭️  Skipped: ${skipped} users (already had bcrypt hashes)`);
        console.log('='.repeat(70));
        console.log('\n✅ All passwords are now bcrypt hashed!');
        console.log('\n📝 All users can now login with their original passwords');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (connection) {
            await connection.rollback();
            console.log('🔄 Changes rolled back');
        }
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

updateAllPasswords().catch(console.error);
