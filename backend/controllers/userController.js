const userModel = require('../models/userModel');

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Erreur getAllUsers:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['invite', 'etudiant', 'responsable', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Rôle invalide.' });
        }

        await userModel.updateRole(id, role);
        res.status(200).json({ message: 'Rôle mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur updateUserRole:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        await userModel.toggleStatus(id, is_active);
        res.status(200).json({ message: 'Statut mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur toggleUserStatus:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    toggleUserStatus
};
