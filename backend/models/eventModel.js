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

// US24: Récupérer les événements qui commencent dans une certaine plage d'heures
const findEventsStartingBetween = async (hoursMin, hoursMax) => {
    const [rows] = await pool.execute(`
        SELECT id, title, date, location 
        FROM events 
        WHERE is_cancelled = FALSE 
        AND date BETWEEN DATE_ADD(NOW(), INTERVAL ? HOUR) AND DATE_ADD(NOW(), INTERVAL ? HOUR)
    `, [hoursMin, hoursMax]);
    return rows;
};

// US30: Historique de participation de l'utilisateur
const getUserHistory = async (userId) => {
    const [rows] = await pool.execute(`
        SELECT e.id, e.title, e.date, e.location, e.is_cancelled, r.created_at as registered_at
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE r.user_id = ?
        ORDER BY e.date DESC
    `, [userId]);
    return rows;
};

const findById = async (id) => {
    const [rows] = await pool.execute(`
        SELECT e.*, a.name as association_name, a.logo_url as association_logo,
        (SELECT u.phone 
         FROM association_members am 
         JOIN users u ON am.user_id = u.id 
         WHERE am.association_id = a.id AND am.status = 'approved' AND u.role = 'responsable' 
         LIMIT 1) as responsible_phone
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

// Inscription (connecté ou anonyme)
const register = async ({ user_id, event_id, price, guest_name, guest_email, guest_phone }) => {
    // Si le prix est > 0 → EN_ATTENTE (en attente de validation du paiement par le responsable)
    // Sinon → GRATUIT (événement gratuit, pas besoin de validation de paiement)
    const paymentStatus = price > 0 ? 'EN_ATTENTE' : 'GRATUIT';
    const [result] = await pool.execute(
        'INSERT INTO registrations (user_id, guest_name, guest_email, guest_phone, event_id, price_applied, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id || null, guest_name || null, guest_email || null, guest_phone || null, event_id, price, paymentStatus]
    );
    return result.insertId;
};

// Vérifier si un invité anonyme est déjà inscrit (par email + event)
const isGuestRegistered = async (guest_email, event_id) => {
    const [rows] = await pool.execute(
        'SELECT id FROM registrations WHERE guest_email = ? AND event_id = ?',
        [guest_email, event_id]
    );
    return rows.length > 0;
};

// Récupérer les participants d'un événement
const getParticipants = async (eventId) => {
    const [rows] = await pool.execute(`
        SELECT 
            COALESCE(u.id, 0) as id,
            COALESCE(u.name, r.guest_name) as name,
            COALESCE(u.email, r.guest_email) as email,
            COALESCE(u.phone, r.guest_phone) as phone,
            r.created_at as registered_at, 
            r.price_applied,
            r.payment_status
        FROM registrations r
        LEFT JOIN users u ON r.user_id = u.id
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
    const allowedFields = ['title', 'description', 'date', 'end_date', 'location', 'max_participants', 'is_paid', 'guest_price', 'member_price'];
    const updates = [];
    const values = [];

    for (const key of allowedFields) {
        if (fields[key] !== undefined) {
            updates.push(`${key} = ?`);
            values.push(fields[key]);
        }
    }

    if (updates.length === 0) return;

    values.push(id);
    await pool.execute(`
        UPDATE events SET ${updates.join(', ')} WHERE id = ?
    `, values);
};

const softDelete = async (id) => {
    await pool.execute('UPDATE events SET is_cancelled = TRUE WHERE id = ?', [id]);
};

const unregister = async (user_id, event_id) => {
    await pool.execute('DELETE FROM registrations WHERE user_id = ? AND event_id = ?', [user_id, event_id]);
};

// US31: Compter les événements créés ce mois-ci par une association
const countEventsThisMonth = async (associationId) => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) as count 
        FROM events 
        WHERE association_id = ? 
        AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
        AND is_cancelled = FALSE
    `, [associationId]);
    return rows[0].count;
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
    unregister,
    findEventsStartingBetween,
    getUserHistory,
    countEventsThisMonth,
    isGuestRegistered
};
