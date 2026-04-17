const pool = require('../config/db');

const findAll = async () => {
    // On récupère les événements futurs, triés par date
    // On joint avec les assos pour avoir le nom de l'association
    const [rows] = await pool.execute(`
        SELECT e.*, a.name as association_name, a.logo_url as association_logo
        FROM events e
        JOIN associations a ON e.association_id = a.id
        WHERE e.date >= NOW() AND e.is_cancelled = FALSE
        ORDER BY e.date ASC
    `);
    return rows;
};

const findById = async (id) => {
    const [rows] = await pool.execute(`
        SELECT e.*, a.name as association_name, a.logo_url as association_logo
        FROM events e
        JOIN associations a ON e.association_id = a.id
        WHERE e.id = ?
    `, [id]);
    return rows[0];
};

const create = async (eventData) => {
    const { association_id, title, description, date, end_date, location, max_participants, is_paid, guest_price, member_price } = eventData;
    
    const [result] = await pool.execute(`
        INSERT INTO events (
            association_id, title, description, date, end_date, location, 
            max_participants, is_paid, guest_price, member_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        association_id, title, description, date, end_date, location, 
        max_participants, is_paid, guest_price || 0, member_price || 0
    ]);
    
    return result.insertId;
};

// US05 : Vérifier les conflits de salles
const checkConflict = async (location, start_date, end_date) => {
    // Un conflit existe si les intervalles se chevauchent :
    // (StartA < EndB) AND (EndA > StartB)
    const [rows] = await pool.execute(`
        SELECT id, title FROM events 
        WHERE location = ? 
        AND is_cancelled = FALSE
        AND (? < end_date) AND (? > date)
    `, [location, start_date, end_date]);
    
    return rows.length > 0 ? rows[0] : null;
};

// Inscription
const register = async (user_id, event_id, price) => {
    const [result] = await pool.execute(
        'INSERT INTO registrations (user_id, event_id, price_applied) VALUES (?, ?, ?)',
        [user_id, event_id, price]
    );
    return result.insertId;
};

const getRegistrationCount = async (event_id) => {
    const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM registrations WHERE event_id = ?',
        [event_id]
    );
    return rows[0].count;
};

const isUserRegistered = async (user_id, event_id) => {
    const [rows] = await pool.execute(
        'SELECT id FROM registrations WHERE user_id = ? AND event_id = ?',
        [user_id, event_id]
    );
    return rows.length > 0;
};

module.exports = {
    findAll,
    findById,
    create,
    checkConflict,
    register,
    getRegistrationCount,
    isUserRegistered
};
