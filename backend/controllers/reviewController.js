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

        // 3. Vérifier s'il a déjà donné son avis
        const alreadyReviewed = await reviewModel.hasAlreadyReviewed(userId);
        if (alreadyReviewed) {
            return res.status(400).json({ 
                message: 'Vous avez déjà donné votre avis sur la plateforme.' 
            });
        }

        // 4. Enregistrer l'avis
        await reviewModel.create(userId, rating, comment);

        res.status(201).json({ message: 'Merci pour votre avis !' });
    } catch (error) {
        console.error('Erreur submitReview:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la soumission de l\'avis.' });
    }
};

const getRecentReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.getRecentReviews(10);
        
        // Formatter pour ne renvoyer que les initiales (Anonymisation)
        const formattedReviews = reviews.map(r => {
            const parts = r.name ? r.name.trim().split(' ') : [];
            const initials = parts.length > 1 && parts[0][0] && parts[1][0] 
                ? (parts[0][0] + parts[1][0]).toUpperCase() 
                : (r.name ? r.name.substring(0, 2).toUpperCase() : "??");
            
            return {
                rating: r.rating,
                comment: r.comment,
                created_at: r.created_at,
                author_initials: initials
            };
        });
        
        res.status(200).json(formattedReviews);
    } catch (error) {
        console.error('Erreur getRecentReviews:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

const checkCanReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const hasJoined = await reviewModel.hasParticipated(userId);
        const alreadyReviewed = await reviewModel.hasAlreadyReviewed(userId);
        res.status(200).json({ canReview: hasJoined && !alreadyReviewed });
    } catch (error) {
        console.error('Erreur checkCanReview:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = {
    submitReview,
    getRecentReviews,
    checkCanReview
};
