const pool = require('../config/db');
const emailService = require('../utils/emailService');

// Récupérer les sponsors actifs (public)
const getActiveSponsors = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await pool.query(
            'SELECT * FROM sponsors WHERE is_active = 1 AND start_date <= ? AND end_date >= ? ORDER BY name ASC',
            [today, today]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erreur getActiveSponsors:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des sponsors.' });
    }
};

// Récupérer tous les sponsors (Admin uniquement)
const getAllSponsors = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sponsors ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erreur getAllSponsors:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Créer un sponsor (Admin uniquement)
const createSponsor = async (req, res) => {
    try {
        const { name, website_url, amount_paid, start_date, end_date } = req.body;

        if (!name || !start_date || !end_date) {
            return res.status(400).json({ message: 'Le nom, la date de début et de fin sont requis.' });
        }

        let logo_url = null;
        if (req.file) {
            logo_url = '/uploads/' + req.file.filename;
        }

        const [result] = await pool.query(
            'INSERT INTO sponsors (name, logo_url, website_url, amount_paid, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [name, logo_url, website_url || null, amount_paid || 5000.00, start_date, end_date]
        );

        res.status(201).json({ message: 'Sponsor créé avec succès.', sponsorId: result.insertId });
    } catch (error) {
        console.error('Erreur createSponsor:', error);
        res.status(500).json({ message: 'Erreur lors de la création du sponsor.' });
    }
};

// Modifier un sponsor (Admin uniquement)
const updateSponsor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, website_url, amount_paid, start_date, end_date, is_active } = req.body;

        const [rows] = await pool.query('SELECT * FROM sponsors WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Sponsor introuvable.' });
        }

        const sponsor = rows[0];
        let logo_url = sponsor.logo_url;
        if (req.file) {
            logo_url = '/uploads/' + req.file.filename;
        }

        const updateFields = {
            name: name !== undefined ? name : sponsor.name,
            logo_url: logo_url,
            website_url: website_url !== undefined ? website_url : sponsor.website_url,
            amount_paid: amount_paid !== undefined ? amount_paid : sponsor.amount_paid,
            start_date: start_date !== undefined ? start_date : sponsor.start_date,
            end_date: end_date !== undefined ? end_date : sponsor.end_date,
            is_active: is_active !== undefined ? (is_active === 'true' || is_active === true || is_active === 1 ? 1 : 0) : sponsor.is_active
        };

        await pool.query(
            `UPDATE sponsors SET name = ?, logo_url = ?, website_url = ?, amount_paid = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?`,
            [updateFields.name, updateFields.logo_url, updateFields.website_url, updateFields.amount_paid, updateFields.start_date, updateFields.end_date, updateFields.is_active, id]
        );

        res.status(200).json({ message: 'Sponsor mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur updateSponsor:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
    }
};

// Supprimer un sponsor (Admin uniquement)
const deleteSponsor = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM sponsors WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sponsor introuvable.' });
        }

        res.status(200).json({ message: 'Sponsor supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur deleteSponsor:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression.' });
    }
};

// Contacter l'administration pour devenir partenaire sponsor
const contactAdmin = async (req, res) => {
    try {
        const { companyName, email, phone, message } = req.body;
        if (!companyName || !email || !message) {
            return res.status(400).json({ message: 'Le nom de l\'entreprise, l\'adresse e-mail et le message sont requis.' });
        }

        const adminEmail = 'campustoconnected@gmail.com';
        const subject = `Demande de partenariat sponsor - ${companyName}`;
        const htmlContent = `
            <h3>Nouvelle demande de partenariat sponsor</h3>
            <p><strong>Nom de l'entreprise :</strong> ${companyName}</p>
            <p><strong>E-mail de contact :</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
            <p><strong>Message / Demande :</strong></p>
            <blockquote style="background: #f4f4f4; padding: 15px; border-left: 5px solid #4F46E5; font-style: italic;">
                ${message.replace(/\n/g, '<br/>')}
            </blockquote>
        `;

        const emailSent = await emailService.sendEmail(adminEmail, subject, htmlContent);
        if (emailSent) {
            res.status(200).json({ message: 'Votre demande a bien été envoyée à l\'administration de CampusConnect.' });
        } else {
            res.status(500).json({ message: 'Erreur serveur lors du traitement de l\'envoi de l\'e-mail.' });
        }
    } catch (error) {
        console.error('Erreur contactAdmin:', error);
        res.status(500).json({ message: 'Une erreur serveur est survenue lors de l\'envoi.' });
    }
};

module.exports = {
    getActiveSponsors,
    getAllSponsors,
    createSponsor,
    updateSponsor,
    deleteSponsor,
    contactAdmin
};
