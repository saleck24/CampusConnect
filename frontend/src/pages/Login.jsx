import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, GraduationCap } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.post('auth/login', formData);
            login(response.data.user, response.data.token);
            setStatus({ type: 'success', message: 'Bienvenue ! Redirection...' });
            setTimeout(() => navigate('/'), 1200);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Identifiants invalides.';
            setStatus({ type: 'error', message: errorMsg });
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
            <div className="flex" style={{ 
                maxWidth: '1000px', 
                width: '100%', 
                background: '#fff', 
                borderRadius: '32px', 
                overflow: 'hidden', 
                boxShadow: '0 40px 100px rgba(15, 23, 42, 0.08)',
                minHeight: '640px'
            }}>
                {/* Left Panel - Information Section */}
                <div style={{ 
                    flex: '1', 
                    background: 'var(--ink)', 
                    padding: '60px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    color: '#fff'
                }} className="hidden-mobile">
                    {/* Decorative Background */}
                    <div style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', 
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
                    }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div className="flex items-center gap-3" style={{ marginBottom: '60px' }}>
                            <div style={{ background: 'var(--indigo)', padding: '10px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)' }}>
                                <GraduationCap size={24} />
                            </div>
                            <span style={{ fontWeight: '800', fontSize: '20px', fontFamily: 'var(--ff-display)', letterSpacing: '-0.02em' }}>CampusConnect</span>
                        </div>

                        <h2 style={{ fontSize: '42px', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px', fontFamily: 'var(--ff-display)' }}>
                            Bon retour <br /> sur votre <span style={{ color: 'var(--indigo2)' }}>campus.</span>
                        </h2>
                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px', maxWidth: '340px', lineHeight: 1.6 }}>
                            Connectez-vous pour retrouver vos associations, vos événements et votre tableau de bord étudiant personnalisé.
                        </p>

                        <div className="flex flex-col gap-5">
                            {[
                                "Événements en temps réel",
                                "Gestion des adhésions simplifiée",
                                "Notifications et rappels automatiques"
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center gap-3" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1.5px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle2 size={12} className="text-indigo" />
                                    </div>
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div style={{ 
                        marginTop: '40px',
                        position: 'relative', 
                        zIndex: 1, 
                        padding: '24px', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderRadius: '20px', 
                        border: '1px solid rgba(255,255,255,0.1)' 
                    }}>
                        <p style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '16px', opacity: 0.8, lineHeight: 1.6 }}>
                            "La plateforme a totalement changé ma vision de la vie associative. Tout est plus fluide et accessible."
                        </p>
                        <div className="flex items-center gap-3">
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo) 0%, var(--indigo2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>ME</div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>Moussa Erebih</div>
                                <div style={{ fontSize: '11px', opacity: 0.5 }}>Responsable Club Dev</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div style={{ flex: '1.2', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
                    <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--ff-display)', color: 'var(--ink)' }}>Se connecter</h1>
                        <p style={{ fontSize: '15px', color: 'var(--ink3)', marginBottom: '40px', fontWeight: '500' }}>Ravi de vous revoir ! Entrez vos identifiants.</p>

                        {status.message && (
                            <div style={{
                                padding: '14px 18px',
                                marginBottom: '28px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                backgroundColor: status.type === 'error' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                color: status.type === 'error' ? 'var(--rose)' : 'var(--teal)',
                                border: `1.5px solid ${status.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`
                            }}>
                                <CheckCircle2 size={18} />
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="form-group">
                                <label className="form-label">Adresse email</label>
                                <div className="form-input-container">
                                    <Mail size={18} className="form-icon" />
                                    <input 
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="votre.nom@campus.fr"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="flex justify-between items-center">
                                    <label className="form-label">Mot de passe</label>
                                    <Link to="#" style={{ fontSize: '12px', color: 'var(--indigo)', fontWeight: '700', textDecoration: 'none' }}>Oublié ?</Link>
                                </div>
                                <div className="form-input-container">
                                    <Lock size={18} className="form-icon" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="form-input"
                                        style={{ paddingRight: '48px' }}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: '12px', fontSize: '16px' }}>
                                {loading ? 'Vérification...' : 'Se connecter'}
                            </button>
                        </form>

                        <div style={{ position: 'relative', margin: '32px 0' }}>
                            <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: '100%', borderTop: '1.5px solid var(--borderl)' }}></div>
                            </div>
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ background: '#fff', padding: '0 12px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
                            </div>
                        </div>

                        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink3)', fontWeight: '500' }}>
                            Pas encore de compte ? <Link to="/register" style={{ color: 'var(--indigo)', fontWeight: '800', textDecoration: 'none' }}>Créer un compte gratuit</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
