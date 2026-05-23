import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const SponsorModal = ({ isOpen, onClose }) => {
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState(
        "Bonjour,\n\nNous souhaitons devenir partenaire sponsor de CampusConnect (5 000 MRU / mois) afin de soutenir la communauté étudiante et d'afficher notre marque sur la plateforme."
    );
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyName.trim() || !email.trim() || !message.trim()) {
            return setStatus({ type: 'error', message: 'Veuillez remplir tous les champs obligatoires (*).' });
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/sponsors/contact', {
                companyName,
                email,
                phone,
                message
            });
            setStatus({ type: 'success', message: 'Votre demande a bien été envoyée à l\'administration de CampusConnect !' });
            setTimeout(() => {
                // Reset form
                setCompanyName('');
                setEmail('');
                setPhone('');
                onClose();
            }, 3000);
        } catch (error) {
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de votre demande.' 
            });
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
                maxWidth: '550px',
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
                    Devenir Partenaire Sponsor
                </h2>
                <p style={{ color: 'var(--ink3)', fontSize: '15px', marginBottom: '24px' }}>
                    Soutenez notre communauté étudiante et profitez d'une visibilité premium sur le campus.
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
                        {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                            Nom de l'entreprise *
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            required
                            placeholder="Ex: Mauritel, Mattel, etc."
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                Adresse e-mail de contact *
                            </label>
                            <input 
                                type="email" 
                                className="form-input"
                                required
                                placeholder="contact@entreprise.mr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                Numéro de téléphone
                            </label>
                            <input 
                                type="tel" 
                                className="form-input"
                                placeholder="+222 XXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                            Détails de la demande *
                        </label>
                        <textarea 
                            className="form-input"
                            rows="5"
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600', resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onClose}
                            style={{ flex: 1, padding: '12px', fontSize: '15px', borderRadius: '12px', fontWeight: '700' }}
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading || status.type === 'success'}
                            style={{ flex: 2, padding: '12px', fontSize: '15px', borderRadius: '12px', fontWeight: '700' }}
                        >
                            {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SponsorModal;
