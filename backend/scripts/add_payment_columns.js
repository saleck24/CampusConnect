const pool = require('../config/db');

async function run() {
    try {
        await pool.query("ALTER TABLE associations ADD COLUMN payment_status ENUM('GRATUIT', 'EN_ATTENTE', 'PAYE') DEFAULT 'GRATUIT'");
        await pool.query("ALTER TABLE associations ADD COLUMN payment_proof_url VARCHAR(255) DEFAULT NULL");
        console.log("Columns added successfully");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
