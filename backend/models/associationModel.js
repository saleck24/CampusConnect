const pool = require('../config/db');

// --- Côté Utilisateur / Demandeur ---

// Créer une demande d'association
const create = async (name, description, logoUrl, objectives, membershipConditions, userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Créer l'association (non validée par défaut)
        const [assoResult] = await connection.execute(
            `INSERT INTO associations (name, description, logo_url, objectives, membership_conditions, is_validated, plan)
             VALUES (?, ?, ?, ?, ?, false, 'free')`,
            [name, description, logoUrl, objectives, membershipConditions]
        );
        
        const associationId = assoResult.insertId;

        // 2. Lier l'utilisateur en tant que membre de cette association (statut 'pending' par rapport à la demande admin pour son rôle)
        // Note: Ici on considérera que c'est une demande de rôle "responsable" 
        await connection.execute(
            `INSERT INTO association_members (user_id, association_id, status)
             VALUES (?, ?, 'pending')`,
            [userId, associationId]
        );

        await connection.commit();
        return associationId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// --- Côté Public ---

// Récupérer toutes les associations validées
const getAllValidated = async () => {
    const [rows] = await pool.execute(
        'SELECT id, name, description, logo_url, plan, premium_until, membership_fee, created_at FROM associations WHERE is_validated = true ORDER BY name ASC'
    );
    return rows;
};

// Récupérer une association par son ID (seulement si validée, ou admin peut voir tout, mais on gère ça au niveau controller)
const getById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT * FROM associations WHERE id = ?',
        [id]
    );
    return rows[0];
};


// --- Côté Admin ---

// Rejoindre une association
const requestMembership = async (userId, associationId) => {
    const [existing] = await pool.execute(
        'SELECT id FROM association_members WHERE user_id = ? AND association_id = ?',
        [userId, associationId]
    );
    if (existing.length > 0) return false;

    // Récupérer l'association pour voir s'il y a une cotisation
    const [assoRows] = await pool.execute(
        'SELECT plan, membership_fee FROM associations WHERE id = ?',
        [associationId]
    );
    const association = assoRows[0];
    
    const fee = (association && association.plan === 'premium') ? (association.membership_fee || 0) : 0;
    const paymentStatus = fee > 0 ? 'pending' : 'free';

    const [result] = await pool.execute(
        'INSERT INTO association_members (user_id, association_id, status, price_applied, payment_status) VALUES (?, ?, ?, ?, ?)',
        [userId, associationId, 'pending', fee, paymentStatus]
    );
    return result.insertId;
};

// Lister toutes les demandes non validées
const getPendingRequests = async () => {
    const [rows] = await pool.execute(`
        SELECT a.*, u.name as requestor_name, u.email as requestor_email, u.id as requestor_id, am.id as membership_id
        FROM associations a
        JOIN association_members am ON a.id = am.association_id
        JOIN users u ON am.user_id = u.id
        WHERE a.is_validated = false AND am.status = 'pending'
    `);
    return rows;
};

// Valider une association et promouvoir le createUser responsable
const validateAssociation = async (associationId, userIdToPromote, membershipId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Valider l'association
        await connection.execute('UPDATE associations SET is_validated = true WHERE id = ?', [associationId]);

        // 2. Valider le status du membre 'approuvé'
        await connection.execute('UPDATE association_members SET status = "approved" WHERE id = ?', [membershipId]);

        // 3. Promouvoir le rôle de l'utilisateur à 'responsable' si ce n'est pas déjà le cas
        await connection.execute('UPDATE users SET role = "responsable" WHERE id = ? AND role = "etudiant"', [userIdToPromote]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Refuser (ou supprimer) une demande
const refuseAssociation = async (associationId) => {
    // La contrainte ON DELETE CASCADE va automatiquemet nettoyer association_members liés à cette association
    const [result] = await pool.execute('DELETE FROM associations WHERE id = ? AND is_validated = false', [associationId]);
    return result.affectedRows > 0;
};

// Récupérer l'ID de l'association dont l'utilisateur est responsable
const getUserAssociationId = async (userId) => {
    const [rows] = await pool.execute(
        'SELECT association_id FROM association_members WHERE user_id = ? AND status = "approved"',
        [userId]
    );
    return rows.length > 0 ? rows[0].association_id : null;
};

// US30: Récupérer les adhésions d'un utilisateur
const getUserMemberships = async (userId) => {
    const [rows] = await pool.execute(`
        SELECT a.id, a.name, a.logo_url, am.status, am.created_at
        FROM association_members am
        JOIN associations a ON am.association_id = a.id
        WHERE am.user_id = ?
        ORDER BY am.created_at DESC
    `, [userId]);
    return rows;
};

// Activer / Renouveler l'abonnement Premium pour 30 jours
const upgradeToPremium = async (id) => {
    const [rows] = await pool.execute('SELECT plan, premium_until FROM associations WHERE id = ?', [id]);
    const association = rows[0];
    if (!association) return null;

    let newPremiumUntil;
    const now = new Date();
    
    if (association.premium_until && new Date(association.premium_until) > now) {
        const currentUntil = new Date(association.premium_until);
        currentUntil.setDate(currentUntil.getDate() + 30);
        newPremiumUntil = currentUntil;
    } else {
        const until = new Date();
        until.setDate(until.getDate() + 30);
        newPremiumUntil = until;
    }

    const formattedUntil = newPremiumUntil.toISOString().slice(0, 19).replace('T', ' ');

    await pool.execute(
        "UPDATE associations SET plan = 'premium', premium_until = ? WHERE id = ?",
        [formattedUntil, id]
    );

    return formattedUntil;
};

module.exports = {
    create,
    getAllValidated,
    getById,
    getPendingRequests,
    validateAssociation,
    refuseAssociation,
    getUserAssociationId,
    requestMembership,
    getUserMemberships,
    upgradeToPremium
};
