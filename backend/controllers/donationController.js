const pool = require('../config/db');

// ============================================================
// DONS — Routes publiques
// ============================================================

/**
 * POST /api/donations/:assoId
 * Soumettre un don (financier ou en nature) — accessible sans compte
 */
const submitDonation = async (req, res) => {
    try {
        const { assoId } = req.params;
        const { donor_name, donor_email, donation_type, amount, item_description, message } = req.body;

        if (!donor_name || !donation_type) {
            return res.status(400).json({ message: 'Le nom du donateur et le type de don sont requis.' });
        }
        if (donation_type === 'MONETARY' && (!amount || parseFloat(amount) <= 0)) {
            return res.status(400).json({ message: 'Un montant valide est requis pour un don financier.' });
        }
        if (donation_type === 'IN_KIND' && !item_description) {
            return res.status(400).json({ message: 'Décrivez le bien que vous souhaitez donner.' });
        }

        const commission = donation_type === 'MONETARY' ? (parseFloat(amount) * 0.10).toFixed(2) : null;
        const proof_url = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await pool.execute(
            `INSERT INTO donations (association_id, donor_name, donor_email, donation_type, amount, commission_amount, item_description, message, proof_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'EN_ATTENTE')`,
            [assoId, donor_name, donor_email || null, donation_type, amount || null, commission, item_description || null, message || null, proof_url]
        );

        res.status(201).json({ message: 'Votre don a été enregistré. Merci pour votre soutien !', donationId: result.insertId });
    } catch (err) {
        console.error('Erreur submitDonation:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// ============================================================
// DONS — Routes Responsable
// ============================================================

/**
 * GET /api/donations/my-asso
 * Récupérer tous les dons reçus par l'association du responsable connecté
 */
const getMyAssoDonations = async (req, res) => {
    try {
        const userId = req.user.id;
        const [assoRows] = await pool.execute(
            `SELECT a.id FROM associations a
             JOIN association_members am ON am.association_id = a.id
             WHERE am.user_id = ? AND am.status = 'approved' AND a.is_validated = true LIMIT 1`,
            [userId]
        );
        if (assoRows.length === 0) return res.status(404).json({ message: 'Association introuvable.' });

        const assoId = assoRows[0].id;
        const [donations] = await pool.execute(
            `SELECT * FROM donations WHERE association_id = ? ORDER BY created_at DESC`,
            [assoId]
        );
        res.json(donations);
    } catch (err) {
        console.error('Erreur getMyAssoDonations:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * PUT /api/donations/:id/validate
 * Valider (confirmer la réception de) un don
 */
const validateDonation = async (req, res) => {
    try {
        const { id } = req.params;
        // Update status first
        await pool.execute(`UPDATE donations SET status = 'VALIDE' WHERE id = ?`, [id]);

        // Retrieve the donation record
        const [rows] = await pool.execute(`SELECT * FROM donations WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Don non trouvé.' });
        }
        const donation = rows[0];

        // If it's a monetary donation with a commission, record it safely
        if (donation && donation.donation_type === 'MONETARY' && donation.commission_amount) {
            try {
                await pool.execute(
                    `INSERT INTO commissions (association_id, amount, type, description, created_at)
                     VALUES (?, ?, 'don', ?, NOW())
                     ON DUPLICATE KEY UPDATE amount = amount`,
                    [donation.association_id, donation.commission_amount, `Commission 10% sur don de ${donation.donor_name}`]
                );
            } catch (e) {
                console.error('Erreur insertion commission:', e);
                // Continue without failing the donation validation
            }
        }

        res.json({ message: 'Don validé avec succès.' });
    } catch (err) {
        console.error('Erreur validateDonation:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// ============================================================
// COTISATIONS RÉCURRENTES — Routes Responsable
// ============================================================

/**
 * GET /api/donations/my-asso/contributions
 * Récupérer toutes les cotisations récurrentes des membres
 */
const getMyAssoContributions = async (req, res) => {
    try {
        const userId = req.user.id;
        const [assoRows] = await pool.execute(
            `SELECT a.id FROM associations a
             JOIN association_members am ON am.association_id = a.id
             WHERE am.user_id = ? AND am.status = 'approved' AND a.is_validated = true LIMIT 1`,
            [userId]
        );
        if (assoRows.length === 0) return res.status(404).json({ message: 'Association introuvable.' });

        const assoId = assoRows[0].id;
        const [contributions] = await pool.execute(
            `SELECT mc.*, u.name as member_name, u.email as member_email
             FROM member_contributions mc
             JOIN users u ON u.id = mc.user_id
             WHERE mc.association_id = ?
             ORDER BY mc.period DESC, u.name ASC`,
            [assoId]
        );
        res.json(contributions);
    } catch (err) {
        console.error('Erreur getMyAssoContributions:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * POST /api/donations/my-asso/contributions
 * Créer/demander une cotisation pour un ou plusieurs membres (pour un mois donné)
 */
const createContribution = async (req, res) => {
    try {
        const userId = req.user.id;
        const { user_ids, amount, period } = req.body; // period: "2026-06"

        if (!user_ids || !amount || !period) {
            return res.status(400).json({ message: 'user_ids, amount et period sont requis.' });
        }

        const [assoRows] = await pool.execute(
            `SELECT a.id FROM associations a
             JOIN association_members am ON am.association_id = a.id
             WHERE am.user_id = ? AND am.status = 'approved' AND a.is_validated = true LIMIT 1`,
            [userId]
        );
        if (assoRows.length === 0) return res.status(404).json({ message: 'Association introuvable.' });

        const assoId = assoRows[0].id;
        const ids = Array.isArray(user_ids) ? user_ids : [user_ids];

        let inserted = 0;
        for (const memberId of ids) {
            try {
                await pool.execute(
                    `INSERT IGNORE INTO member_contributions (association_id, user_id, amount, period, status)
                     VALUES (?, ?, ?, ?, 'EN_ATTENTE')`,
                    [assoId, memberId, amount, period]
                );
                inserted++;
            } catch (e) { /* IGNORE si déjà existant */ }
        }

        res.status(201).json({ message: `${inserted} cotisation(s) créée(s) pour la période ${period}.` });
    } catch (err) {
        console.error('Erreur createContribution:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * PUT /api/donations/contributions/:id/validate
 * Valider le paiement d'une cotisation
 */
const validateContribution = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute(
            `UPDATE member_contributions SET status = 'PAYE', validated_at = NOW() WHERE id = ?`,
            [id]
        );
        res.json({ message: 'Cotisation validée.' });
    } catch (err) {
        console.error('Erreur validateContribution:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

const getMyAssoSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find the association the manager belongs to
        const [assoRows] = await pool.execute(
            `SELECT a.id FROM associations a
             JOIN association_members am ON am.association_id = a.id
             WHERE am.user_id = ? AND am.status = 'approved' AND a.is_validated = true LIMIT 1`,
            [userId]
        );
        if (assoRows.length === 0) return res.status(404).json({ message: 'Association introuvable.' });
        const assoId = assoRows[0].id;

        // Total monetary donations
        const [monetaryRes] = await pool.execute(
            `SELECT COALESCE(SUM(amount),0) AS total_monetary FROM donations WHERE association_id = ? AND donation_type = 'MONETARY' AND status = 'VALIDE'`,
            [assoId]
        );
        const totalMonetary = monetaryRes[0].total_monetary;

        // Count of material (in‑kind) donations
        const [materialRes] = await pool.execute(
            `SELECT COUNT(*) AS material_count FROM donations WHERE association_id = ? AND donation_type = 'IN_KIND' AND status = 'VALIDE'`,
            [assoId]
        );
        const materialCount = materialRes[0].material_count;

        // Total from recurring contributions (paid)
        const [recurringRes] = await pool.execute(
            `SELECT COALESCE(SUM(amount),0) AS total_recurring FROM member_contributions WHERE association_id = ? AND status = 'PAYE'`,
            [assoId]
        );
        const totalRecurring = recurringRes[0].total_recurring;

        res.status(200).json({
            totalMonetary,
            materialCount,
            totalRecurring
        });
    } catch (err) {
        console.error('Erreur getMyAssoSummary:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = {
    submitDonation,
    getMyAssoDonations,
    validateDonation,
    getMyAssoContributions,
    createContribution,
    validateContribution,
    getMyAssoSummary
};
