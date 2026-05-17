import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.post('auth/forgot-password', { email });
            setStatus({ type: 'success', message: response.data.message || 'Lien envoyé avec succès.' });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Erreur lors de la demande.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ 
            minHeight: 'calc(100vh - 70px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--surf2)', 
            padding: '40px 20px' 
        }}>
            <div style={{ 
                maxWidth: '480px', 
                width: '100%', 
                background: '#fff', 
                borderRadius: '24px', 
                padding: '48px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--borderl)'
            }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--ink3)', textDecoration: 'none', fontWeight: '600', fontSize: '14px', marginBottom: '32px' }}>
                    <ArrowLeft size={16} /> Retour à la connexion
                </Link>

                <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--ff-display)', color: 'var(--ink)' }}>
                    Mot de passe oublié
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--ink3)', marginBottom: '32px', lineHeight: 1.6 }}>
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                {status.message && (
                    <div style={{
                        padding: '14px 18px',
                        marginBottom: '24px',
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="form-group">
                        <label className="form-label">Adresse email</label>
                        <div className="form-input-container">
                            <Mail size={18} className="form-icon" />
                            <input 
                                type="email"
                                className="form-input"
                                placeholder="votre.nom@campus.fr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: '16px', fontSize: '16px' }}>
                        {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
