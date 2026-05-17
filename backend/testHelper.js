const path = require('path');
try { 
    process.loadEnvFile(path.join(__dirname, '.env')); 
} catch(e) {
    console.log("Env loading error:", e.message);
}

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campusconnect',
});

const action = process.argv[2];
const param1 = process.argv[3];
const param2 = process.argv[4];

async function main() {
    try {
        if (action === 'activate') {
            const email = param1;
            console.log(`Activating user: ${email}`);
            await pool.execute("UPDATE users SET is_active = 1 WHERE email = ?", [email]);
            console.log("✅ Activated!");
        } else if (action === 'premium') {
            const name = param1;
            console.log(`Upgrading association to Premium: ${name}`);
            await pool.execute("UPDATE associations SET plan = 'premium' WHERE name = ?", [name]);
            console.log("✅ Upgraded!");
        } else if (action === 'list') {
            console.log("=== USERS ===");
            const [users] = await pool.execute("SELECT id, name, email, role, is_active FROM users");
            console.table(users);

            console.log("=== ASSOCIATIONS ===");
            const [assos] = await pool.execute("SELECT id, name, plan, is_validated FROM associations");
            console.table(assos);

            console.log("=== COMMISSIONS ===");
            const [commissions] = await pool.execute("SELECT * FROM commissions");
            console.table(commissions);
        } else {
            console.log("Usage: node testHelper.js [activate|premium|list] [param1] [param2]");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();
