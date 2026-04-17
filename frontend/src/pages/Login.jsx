import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

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
            
            // Login function from context saves to localStorage
            login(response.data.user, response.data.token);
            
            setStatus({ type: 'success', message: 'Connexion réussie ! Redirection...' });
            
            // Redirect after a short delay
            setTimeout(() => navigate('/'), 1000);
            
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Identifiants invalides ou erreur serveur.';
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in flex justify-center items-center mt-4 mb-4">
            <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
                <h2 className="text-center mb-4" style={{ color: 'var(--color-primary)' }}>Connexion</h2>
                
                {status.message && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: status.type === 'error' ? '#FEF2F2' : '#F0FDF4',
                        color: status.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
                        border: `1px solid ${status.type === 'error' ? '#FCA5A5' : '#86EFAC'}`
                    }}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--color-text-main)' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                placeholder="jean.dupont@campus.fr"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem'}}>
                           <label style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>Mot de passe</label>
                           <Link to="#" style={{ fontSize: '0.85rem' }}>Oublié ?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.6rem 2.5rem 0.6rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                placeholder="••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-2" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Vérification...' : 'Se connecter'}
                    </button>
                </form>

                <p className="text-center mt-4" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Vous n'avez pas de compte ? <Link to="/register" style={{ fontWeight: 600 }}>S'inscrire</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
