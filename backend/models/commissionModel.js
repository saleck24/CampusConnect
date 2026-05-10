const pool = require('../config/db');

// US32: Enregistrer une commission
const createCommission = async (association_id, registration_id, type, amount, rate) => {
    const [result] = await pool.execute(
        'INSERT INTO commissions (association_id, registration_id, type, amount, rate) VALUES (?, ?, ?, ?, ?)',
        [association_id, registration_id, type, amount, rate]
    );
    return result.insertId;
};

module.exports = {
    createCommission
};
