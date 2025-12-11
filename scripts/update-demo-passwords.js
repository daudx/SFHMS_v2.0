/**
 * Update Demo Users with Bcrypt Hashed Passwords
 * This script updates the existing demo users in the database with properly hashed passwords
 */

const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
        env[key.trim()] = valueParts.join('=').trim();
    }
});

const passwords = {
    'daudx': 'admin123',
    'alice_j': 'student123',
    'bob_m': 'student123',
    'emma_student': 'student123',
    'alex_student': 'student123',
    'mike_coach': 'coach123',
    'sarah_coach': 'coach123',
    'robert_nurse': 'nurse123',
    'linda_nurse': 'nurse123'
};

async function updatePasswords() {
    let connection;

    try {
        console.log('🔐 Connecting to Oracle Database...');

        connection = await oracledb.getConnection({
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            connectString: env.DB_CONNECTION_STRING
        });

        console.log('✅ Connected successfully!\n');
        console.log('🔄 Updating user passwords with bcrypt hashes...\n');

        let updated = 0;
        let failed = 0;

        for (const [username, plainPassword] of Object.entries(passwords)) {
            try {
                // Generate bcrypt hash
                const hash = await bcrypt.hash(plainPassword, 10);

                // Update the user
                const result = await connection.execute(
                    `UPDATE "User" SET PasswordHash = :hash WHERE Username = :username`,
                    { hash, username },
                    { autoCommit: false }
                );

                if (result.rowsAffected > 0) {
                    console.log(`✅ Updated: ${username.padEnd(20)} (${plainPassword})`);
                    updated++;
                } else {
                    console.log(`⚠️  Not found: ${username}`);
                    failed++;
                }
            } catch (err) {
                console.error(`❌ Error updating ${username}:`, err.message);
                failed++;
            }
        }

        // Commit all changes
        await connection.commit();

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Successfully updated: ${updated} users`);
        if (failed > 0) {
            console.log(`⚠️  Failed/Not found: ${failed} users`);
        }
        console.log('='.repeat(60));
        console.log('\n✅ All changes committed to database!');
        console.log('\n📝 You can now login with these credentials:');
        console.log('   - Admin: daudx / admin123');
        console.log('   - Student: bob_m / student123');
        console.log('   - Coach: mike_coach / coach123');
        console.log('   - Nurse: robert_nurse / nurse123');

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
                console.log('\n🔌 Database connection closed');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

// Run the update
updatePasswords().catch(console.error);
