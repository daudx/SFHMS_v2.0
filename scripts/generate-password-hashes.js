/**
 * Generate bcrypt hashes for demo user passwords
 * Run this script to get the hashed passwords for the SQL update script
 */

const bcrypt = require('bcryptjs');

const passwords = {
    'admin123': 'Admin (daudx)',
    'student123': 'Students (alice_j, bob_m, emma_student, alex_student)',
    'coach123': 'Coaches (mike_coach, sarah_coach)',
    'nurse123': 'Nurses (robert_nurse, linda_nurse)'
};

async function generateHashes() {
    console.log('='.repeat(80));
    console.log('BCRYPT PASSWORD HASHES FOR DEMO USERS');
    console.log('='.repeat(80));
    console.log('\nCopy these hashes to update your database demo users:\n');

    for (const [password, description] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`Password: ${password}`);
        console.log(`Used by: ${description}`);
        console.log(`Hash: ${hash}`);
        console.log('-'.repeat(80));
    }

    console.log('\n✅ Use these hashes in your SQL UPDATE statements');
    console.log('Example:');
    console.log(`UPDATE "User" SET PasswordHash = '<hash>' WHERE Username = 'daudx';`);
    console.log('\n');
}

generateHashes().catch(console.error);
