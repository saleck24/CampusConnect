const pool = require('../config/db');

const findAll = async () => {
    // On récupère les événements futurs, triés par date
    // On joint avec les assos pour avoir le nom de l'association
    const [rows] = await pool.execute(`
        SELECT e.*, a.name as association_name, a.logo_url as association_logo
        FROM events e
        JOIN associations a ON e.association_id = a.id
        WHERE e.end_date >= NOW() AND e.is_cancelled = FALSE
        ORDER BY e.date ASC
    `, []);
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

// Pour Admin et Responsable : tous les événements (passés inclus)
const findByAssociation = async (associationId) => {
    const [rows] = await pool.execute(`
        SELECT e.*, a.name as association_name,
               (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as participant_count
        FROM events e
        JOIN associations a ON e.association_id = a.id
        WHERE e.association_id = ? AND e.is_cancelled = FALSE
        ORDER BY e.date DESC
    `, [associationId]);
    return rows;
};

const findAll_admin = async () => {
    const [rows] = await pool.execute(`
        SELECT e.*, a.name as association_name,
               (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as participant_count
        FROM events e
        JOIN associations a ON e.association_id = a.id
        WHERE e.is_cancelled = FALSE
        ORDER BY e.date DESC
    `, []);
    return rows;
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

// Récupérer les participants d'un événement
const getParticipants = async (eventId) => {
    const [rows] = await pool.execute(`
        SELECT u.id, u.name, u.email, r.created_at as registered_at, r.price_applied
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        WHERE r.event_id = ?
        ORDER BY r.created_at DESC
    `, [eventId]);
    return rows;
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

const update = async (id, fields) => {
    const { title, description, date, end_date, location, max_participants, is_paid, guest_price, member_price } = fields;
    await pool.execute(`
        UPDATE events SET title=?, description=?, date=?, end_date=?, location=?, 
        max_participants=?, is_paid=?, guest_price=?, member_price=? WHERE id=?
    `, [title, description, date, end_date, location, max_participants, is_paid, guest_price, member_price, id]);
};

const softDelete = async (id) => {
    await pool.execute('UPDATE events SET is_cancelled = TRUE WHERE id = ?', [id]);
};

const unregister = async (user_id, event_id) => {
    await pool.execute('DELETE FROM registrations WHERE user_id = ? AND event_id = ?', [user_id, event_id]);
};

module.exports = {
    findAll,
    findById,
    findByAssociation,
    findAll_admin,
    create,
    checkConflict,
    register,
    getRegistrationCount,
    isUserRegistered,
    getParticipants,
    update,
    softDelete,
    unregister
};
