// Quick script to generate actual bcrypt hashes
const bcrypt = require('bcryptjs');

async function generateHashes() {
    const passwords = {
        'admin123': 'Admin',
        'student123': 'Students',
        'coach123': 'Coaches',
        'nurse123': 'Nurses'
    };

    console.log('Generating bcrypt hashes...\n');

    for (const [password, role] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`${role} (${password}):`);
        console.log(hash);
        console.log('');
    }
}

generateHashes();
