const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const associationModel = require('../models/associationModel');
const emailService = require('../utils/emailService');

// Inscription
const register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Validation basique
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Tous les champs sont requis, y compris le numéro de téléphone.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
        }

        // Hachage du mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Créer l'utilisateur
        const userId = await userModel.create(name, email, phone, hashedPassword, role);

        // Créer un token d'activation (valable 1h)
        const activationToken = jwt.sign({ id: userId, email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Lien d'activation frontend (à adapter avec le port FrontEnd usuel, par défaut 5173)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const activationLink = `${frontendUrl}/confirm/${activationToken}`;

        // Envoyer l'email
        const emailHtml = `
            <h1>Bienvenue sur CampusConnect</h1>
            <p>Bonjour ${name},</p>
            <p>Merci de vous être inscrit sur CampusConnect. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
            <a href="${activationLink}">Activer mon compte</a>
            <p>Ce lien est valide pendant 1 heure.</p>
        `;
        
        // On envoie en arrière plan, pas de problème s'il faillit c'est asynchrone mais on ne bloque pas pour autant
        emailService.sendEmail(email, 'Confirmez votre adresse email sur CampusConnect', emailHtml);

        res.status(201).json({ message: 'Inscription réussie. Veuillez vérifier vos emails pour activer votre compte.' });
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
    }
};

// Confirmation d'email
const confirmEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) return res.status(400).json({ message: 'Token manquant' });

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Activer l'utilisateur
        const isActivated = await userModel.activateUser(decoded.id);

        if (isActivated) {
            
            // Envoyer un mail informatif "Compte activé"
            const emailHtml = `
            <h1>CampusConnect</h1>
            <p>Votre compte est désormais activé ! Vous pouvez vous connecter à la plateforme.</p>
            `;
            emailService.sendEmail(decoded.email, 'Votre compte est activé', emailHtml);

            res.status(200).json({ message: 'Compte activé avec succès. Vous pouvez maintenant vous connecter.' });
        } else {
            res.status(400).json({ message: 'Compte déjà activé ou utilisateur introuvable.' });
        }
    } catch (error) {
        console.error('Erreur de confirmation :', error);
        res.status(400).json({ message: 'Lien d\'activation invalide ou expiré.' });
    }
};

// Connexion
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis.' });
        }

        const user = await userModel.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        if (!user.is_active) {
            // Un utilisateur est inactif soit parce qu'il n'a pas validé son mail,
            // soit parce qu'il a été suspendu par un admin (is_active repassé à 0).
            // Pour plus de clarté, on pourrait vérifier s'il a déjà validé son mail
            // ou simplement donner un message plus global.
            return res.status(403).json({ 
                message: 'Accès restreint. Votre compte n’est pas actif ou a été suspendu par l’administration.' 
            });
        }

        // Vérifier le mot de passe
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        // Générer le JWT JWT_EXPIRES_IN (24h)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Si responsable, on récupère son associationId
        let associationId = null;
        if (user.role === 'responsable') {
            associationId = await associationModel.getUserAssociationId(user.id);
        }

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, associationId }
        });

    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
    }
};

// Mot de passe oublié
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email requis.' });

        const user = await userModel.findByEmail(email);
        if (!user) {
            // Pour des raisons de sécurité, on peut renvoyer un succès même si l'email n'existe pas.
            return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé.' });
        }

        // Créer un token valable 15 minutes
        // On inclut le hachage du mot de passe dans le secret pour invalider le token si le mot de passe change
        const secret = process.env.JWT_SECRET + user.password;
        const resetToken = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '15m' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password/${user.id}/${resetToken}`;

        const emailHtml = `
            <h1>Réinitialisation de mot de passe</h1>
            <p>Bonjour ${user.name},</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe sur CampusConnect.</p>
            <p>Cliquez sur le lien ci-dessous pour le modifier :</p>
            <a href="${resetLink}">Réinitialiser mon mot de passe</a>
            <p>Ce lien est valide pendant 15 minutes. Si vous n'avez rien demandé, ignorez cet e-mail.</p>
        `;
        
        emailService.sendEmail(user.email, 'Réinitialisation de votre mot de passe CampusConnect', emailHtml);

        res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé.' });
    } catch (error) {
        console.error('Erreur forgotPassword:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Réinitialisation du mot de passe
const resetPassword = async (req, res) => {
    try {
        const { id, token } = req.params;
        const { newPassword } = req.body;

        if (!id || !token || !newPassword) {
            return res.status(400).json({ message: 'Données manquantes.' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur introuvable.' });
        }

        // Pour vérifier, on a besoin du mot de passe actuel complet de l'utilisateur
        // Comme findById ne renvoie pas le mdp (parfois), on utilise findByEmail
        const userFull = await userModel.findByEmail(user.email);
        const secret = process.env.JWT_SECRET + userFull.password;

        try {
            jwt.verify(token, secret);
        } catch (err) {
            return res.status(400).json({ message: 'Lien invalide ou expiré.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await userModel.updatePassword(id, hashedPassword);

        res.status(200).json({ message: 'Mot de passe modifié avec succès. Vous pouvez vous connecter.' });
    } catch (error) {
        console.error('Erreur resetPassword:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = {
    register,
    confirmEmail,
    login,
    forgotPassword,
    resetPassword
};
