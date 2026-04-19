const reviewModel = require('../models/reviewModel');

/**
 * Soumettre un avis
 */
const submitReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rating, comment } = req.body;

        // 1. Validation de la note
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'La note doit être comprise entre 1 et 5.' });
        }

        // 2. Vérifier si l'utilisateur a participé à au moins un événement (Règle Jury)
        const canRate = await reviewModel.hasParticipated(userId);
        if (!canRate) {
            return res.status(403).json({ 
                message: 'Vous devez avoir participé à au moins un événement pour donner votre avis.' 
            });
        }

        // 3. Enregistrer l'avis
        await reviewModel.create(userId, rating, comment);

        res.status(201).json({ message: 'Merci pour votre avis !' });
    } catch (error) {
        console.error('Erreur submitReview:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la soumission de l\'avis.' });
    }
};

module.exports = {
    submitReview
};
