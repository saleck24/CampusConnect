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
        'SELECT id, name, description, logo_url, plan, created_at FROM associations WHERE is_validated = true ORDER BY name ASC'
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
        await connection.execute('UPDATE users SET role = "responsable" WHERE id = ? AND role IN ("invite", "etudiant")', [userIdToPromote]);

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

module.exports = {
    create,
    getAllValidated,
    getById,
    getPendingRequests,
    validateAssociation,
    refuseAssociation
};
