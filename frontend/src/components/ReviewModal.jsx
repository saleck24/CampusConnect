import React, { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ReviewModal = ({ isOpen, onClose, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            return setStatus({ type: 'error', message: 'Veuillez sélectionner une note.' });
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/reviews', { rating, comment });
            setStatus({ type: 'success', message: 'Merci pour votre avis !' });
            setTimeout(() => {
                onReviewSubmitted();
                onClose();
            }, 2000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Erreur lors de la soumission.' });
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div className="animate-fade-in" style={{
                background: '#fff',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '500px',
                padding: '32px',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: 'var(--ink)' }}>
                    Donnez votre avis
                </h2>
                <p style={{ color: 'var(--ink3)', fontSize: '15px', marginBottom: '24px' }}>
                    Votre avis nous aide à améliorer CampusConnect pour tous les étudiants.
                </p>

                {status.message && (
                    <div style={{
                        padding: '12px 16px',
                        marginBottom: '20px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: status.type === 'error' ? 'rgba(225, 29, 72, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                        color: status.type === 'error' ? 'var(--rose)' : 'var(--teal)'
                    }}>
                        <CheckCircle2 size={18} />
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s',
                                    transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)'
                                }}
                            >
                                <Star 
                                    size={36} 
                                    fill={(hoverRating || rating) >= star ? "var(--amber)" : "transparent"} 
                                    color={(hoverRating || rating) >= star ? "var(--amber)" : "var(--borderl)"} 
                                />
                            </button>
                        ))}
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label">Commentaire (optionnel)</label>
                        <textarea 
                            className="form-input"
                            rows="4"
                            placeholder="Qu'avez-vous pensé de la plateforme et des événements ?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{ paddingLeft: '14px', resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading || status.type === 'success'}
                        style={{ width: '100%', padding: '14px', fontSize: '16px' }}
                    >
                        {loading ? 'Envoi...' : 'Soumettre mon avis'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
