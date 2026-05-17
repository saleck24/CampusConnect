import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
    const { id, token } = useParams();
    const navigate = useNavigate();
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (newPassword !== confirmPassword) {
            return setStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
        }
        if (newPassword.length < 8) {
            return setStatus({ type: 'error', message: 'Le mot de passe doit contenir au moins 8 caractères.' });
        }

        setLoading(true);

        try {
            const response = await api.post(`auth/reset-password/${id}/${token}`, { newPassword });
            setStatus({ type: 'success', message: response.data.message });
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Lien invalide ou expiré.' });
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
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--ff-display)', color: 'var(--ink)' }}>
                    Nouveau mot de passe
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--ink3)', marginBottom: '32px', lineHeight: 1.6 }}>
                    Veuillez saisir votre nouveau mot de passe ci-dessous.
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
                        <label className="form-label">Nouveau mot de passe</label>
                        <div className="form-input-container">
                            <Lock size={18} className="form-icon" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                style={{ paddingRight: '48px' }}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirmer le mot de passe</label>
                        <div className="form-input-container">
                            <Lock size={18} className="form-icon" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading || status.type === 'success'} style={{ width: '100%', padding: '14px', marginTop: '16px', fontSize: '16px' }}>
                        {loading ? 'Modification...' : 'Réinitialiser'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
