import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, GraduationCap } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'etudiant' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [pwStrength, setPwStrength] = useState(0);

    const updatePwStrength = (v) => {
        let s = 0;
        if (v.length >= 8) s++;
        if (/[A-Z]/.test(v)) s++;
        if (/[0-9]/.test(v)) s++;
        if (/[^A-Za-z0-9]/.test(v)) s++;
        setPwStrength(s);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') updatePwStrength(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        if (formData.password.length < 8) {
            setStatus({ type: 'error', message: 'Le mot de passe doit comporter au moins 8 caractères.' });
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('auth/register', formData);
            setStatus({ type: 'success', message: response.data.message });
            setFormData({ name: '', email: '', password: '', role: 'etudiant' });
            setPwStrength(0);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.';
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'invite', label: 'Invité', icon: '👤' },
        { id: 'etudiant', label: 'Étudiant', icon: '🎓' },
        { id: 'responsable', label: 'Responsable', icon: '🏛️' }
    ];

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
                maxWidth: '1100px', 
                width: '100%', 
                background: '#fff', 
                borderRadius: '32px', 
                overflow: 'hidden', 
                boxShadow: '0 40px 100px rgba(15, 23, 42, 0.08)',
                minHeight: '740px'
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
                            Rejoignez la <br /> <span style={{ color: 'var(--indigo2)' }}>communauté</span> <br /> du campus.
                        </h2>
                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px', maxWidth: '340px', lineHeight: 1.6 }}>
                            Créez votre profil étudiant en quelques secondes et accédez à tout ce que votre campus a à offrir.
                        </p>

                        <div className="flex flex-col gap-5">
                            {[
                                "100% gratuit pour les étudiants",
                                "Accès à l'annuaire complet",
                                "Inscription aux événements en 1 clic"
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

                    <div style={{ position: 'relative', zIndex: 1, padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '16px', opacity: 0.8, lineHeight: 1.6 }}>
                           "J'ai découvert des clubs passionnants grâce à CampusConnect. L'inscription est un jeu d'enfant !"
                        </p>
                        <div className="flex items-center gap-3">
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal) 0%, #2DD4BF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>SA</div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>Saleck Ahmed</div>
                                <div style={{ fontSize: '11px', opacity: 0.5 }}>Étudiant Master SI</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Register Form */}
                <div style={{ flex: '1.4', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
                    <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--ff-display)', color: 'var(--ink)' }}>Créer un compte</h1>
                        <p style={{ fontSize: '15px', color: 'var(--ink3)', marginBottom: '40px', fontWeight: '500' }}>Remplissez le formulaire — c'est rapide.</p>

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

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Nom complet</label>
                                <div className="form-input-container">
                                    <User size={18} className="form-icon" />
                                    <input 
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="Moussa Erebih"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

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
                                <label className="form-label">Mot de passe</label>
                                <div className="form-input-container">
                                    <Lock size={18} className="form-icon" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="form-input"
                                        style={{ 
                                            paddingRight: '48px',
                                            borderColor: formData.password && formData.password.length < 8 ? 'var(--rose)' : 'var(--borderl)' 
                                        }}
                                        placeholder="Min. 8 caractères"
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
                                {formData.password && formData.password.length < 8 && (
                                    <p style={{ fontSize: '11px', color: 'var(--rose)', fontWeight: '600' }}>
                                        Trop court ! Encore {8 - formData.password.length} caractères.
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: '4px', marginTop: pwStrength > 0 ? '4px' : '0' }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ 
                                            flex: 1, height: '4px', borderRadius: '2px', 
                                            background: i <= pwStrength ? 'var(--indigo)' : 'var(--surf3)',
                                            transition: '0.3s'
                                        }}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '8px' }}>
                                <label className="form-label">Je suis un(e)…</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {roles.map(role => (
                                        <div 
                                            key={role.id} 
                                            onClick={() => setFormData({ ...formData, role: role.id })}
                                            style={{
                                                padding: '12px 6px',
                                                borderRadius: '12px',
                                                border: '1.5px solid',
                                                borderColor: formData.role === role.id ? 'var(--indigo)' : 'var(--borderl)',
                                                background: formData.role === role.id ? 'var(--indigo-light)' : 'var(--surf2)',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: '0.2s'
                                            }}
                                        >
                                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{role.icon}</div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: formData.role === role.id ? 'var(--indigo)' : 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{role.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--ink3)', marginTop: '8px', lineHeight: 1.4, fontWeight: '500' }}>
                                    * Le rôle Responsable est soumis à validation par l'équipe CampusConnect.
                                </p>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: '16px', fontSize: '16px' }}>
                                {loading ? 'Création en cours...' : 'Créer mon compte'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink3)', marginTop: '32px', fontWeight: '500' }}>
                            Déjà inscrit ? <Link to="/login" style={{ color: 'var(--indigo)', fontWeight: '800', textDecoration: 'none' }}>Se connecter</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
