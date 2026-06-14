import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, GraduationCap, Phone, Building2, FileText, Target } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', role: 'etudiant',
        asso_name: '', asso_type: 'CLUB', asso_description: '', asso_objectives: ''
    });
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
        setFormData(prev => ({ ...prev, [name]: value }));
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

        if (formData.role === 'responsable' && !formData.asso_name) {
            setStatus({ type: 'error', message: 'Veuillez renseigner le nom de votre association.' });
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('auth/register', formData);
            setStatus({ type: 'success', message: response.data.message });
            setFormData({ name: '', email: '', phone: '', password: '', role: 'etudiant', asso_name: '', asso_type: 'CLUB', asso_description: '', asso_objectives: '' });
            setPwStrength(0);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.';
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const isResponsable = formData.role === 'responsable';

    const roles = [
        { id: 'etudiant', label: 'Étudiant', icon: '🎓', desc: 'Je suis étudiant' },
        { id: 'responsable', label: 'Responsable', icon: '🏛️', desc: 'Je gère une asso / ONG' }
    ];

    const pwColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];

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
                {/* ===== LEFT PANEL ===== */}
                <div style={{ 
                    flex: '1', 
                    background: isResponsable 
                        ? 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' 
                        : 'var(--ink)', 
                    padding: '60px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    color: '#fff',
                    transition: 'background 0.5s ease'
                }} className="hidden-mobile">
                    {/* Decorative Grid */}
                    <div style={{ 
                        position: 'absolute', inset: 0, 
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

                        {isResponsable ? (
                            <div style={{ animation: 'fadeInDown 0.4s ease' }}>
                                <h2 style={{ fontSize: '36px', fontWeight: '800', lineHeight: 1.15, marginBottom: '20px', fontFamily: 'var(--ff-display)' }}>
                                    Gérez votre <br /><span style={{ color: '#a5b4fc' }}>Association</span><br />sur CampusConnect.
                                </h2>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '36px', maxWidth: '320px', lineHeight: 1.7 }}>
                                    Créez votre espace Responsable, gérez vos membres, événements, finances et bien plus. Votre demande sera validée par notre équipe.
                                </p>
                                <div className="flex flex-col gap-4">
                                    {["Tableau de bord financier complet", "Gestion des membres & cotisations", "Création d'événements illimitée", "Réception de dons & sponsors"].map((feat, i) => (
                                        <div key={i} className="flex items-center gap-3" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(165,180,252,0.15)', border: '1.5px solid rgba(165,180,252,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CheckCircle2 size={12} color="#a5b4fc" />
                                            </div>
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 style={{ fontSize: '42px', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px', fontFamily: 'var(--ff-display)' }}>
                                    Rejoignez la <br /> <span style={{ color: 'var(--indigo2)' }}>communauté</span> <br />du campus.
                                </h2>
                                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px', maxWidth: '340px', lineHeight: 1.6 }}>
                                    Créez votre profil étudiant en quelques secondes et accédez à tout ce que votre campus a à offrir.
                                </p>
                                <div className="flex flex-col gap-5">
                                    {["100% gratuit pour les étudiants", "Accès à l'annuaire complet", "Inscription aux événements en 1 clic"].map((feat, i) => (
                                        <div key={i} className="flex items-center gap-3" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1.5px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle2 size={12} className="text-indigo" />
                                            </div>
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'relative', zIndex: 1, padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
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

                {/* ===== RIGHT PANEL — FORM ===== */}
                <div style={{ flex: '1.4', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
                        <h1 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '6px', fontFamily: 'var(--ff-display)', color: 'var(--ink)' }}>Créer un compte</h1>
                        <p style={{ fontSize: '14px', color: 'var(--ink3)', marginBottom: '32px', fontWeight: '500' }}>Remplissez le formulaire — c'est rapide.</p>

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
                                backgroundColor: status.type === 'error' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                color: status.type === 'error' ? 'var(--rose)' : 'var(--teal)',
                                border: `1.5px solid ${status.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`
                            }}>
                                <CheckCircle2 size={18} />
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* ===== CHOIX DU RÔLE ===== */}
                            <div className="form-group">
                                <label className="form-label">Je suis un(e)…</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {roles.map(role => (
                                        <div 
                                            key={role.id} 
                                            onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                                            style={{
                                                padding: '14px 12px',
                                                borderRadius: '14px',
                                                border: '2px solid',
                                                borderColor: formData.role === role.id ? 'var(--indigo)' : 'var(--borderl)',
                                                background: formData.role === role.id ? 'var(--indigo-light)' : 'var(--surf2)',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s ease',
                                                transform: formData.role === role.id ? 'scale(1.02)' : 'scale(1)'
                                            }}
                                        >
                                            <div style={{ fontSize: '22px', marginBottom: '4px' }}>{role.icon}</div>
                                            <div style={{ fontSize: '12px', fontWeight: '800', color: formData.role === role.id ? 'var(--indigo)' : 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{role.label}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--ink3)', marginTop: '2px' }}>{role.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ===== CHAMPS COMMUNS ===== */}
                            <div className="form-group">
                                <label className="form-label">Nom complet</label>
                                <div className="form-input-container">
                                    <User size={18} className="form-icon" />
                                    <input type="text" name="name" className="form-input" placeholder="Moussa Erebih" value={formData.name} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Adresse email</label>
                                <div className="form-input-container">
                                    <Mail size={18} className="form-icon" />
                                    <input type="email" name="email" className="form-input" placeholder="votre.nom@campus.fr" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Numéro de téléphone</label>
                                <div className="form-input-container">
                                    <Phone size={18} className="form-icon" />
                                    <input type="tel" name="phone" className="form-input" placeholder="+222 XX XX XX XX" value={formData.phone} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mot de passe</label>
                                <div className="form-input-container">
                                    <Lock size={18} className="form-icon" />
                                    <input 
                                        type={showPassword ? "text" : "password"} name="password" className="form-input"
                                        style={{ paddingRight: '48px', borderColor: formData.password && formData.password.length < 8 ? 'var(--rose)' : 'var(--borderl)' }}
                                        placeholder="Min. 8 caractères" value={formData.password} onChange={handleChange} required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formData.password && formData.password.length < 8 && (
                                    <p style={{ fontSize: '11px', color: 'var(--rose)', fontWeight: '600' }}>Trop court ! Encore {8 - formData.password.length} caractères.</p>
                                )}
                                {pwStrength > 0 && (
                                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '4px', background: i <= pwStrength ? pwColors[pwStrength - 1] : 'var(--borderl)', transition: 'background 0.3s' }} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ===== CHAMPS ASSOCIATION (si Responsable) ===== */}
                            {isResponsable && (
                                <div style={{
                                    overflow: 'hidden',
                                    animation: 'fadeInDown 0.35s ease',
                                    borderTop: '1.5px dashed var(--borderl)',
                                    paddingTop: '20px',
                                    marginTop: '4px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}>
                                    <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                                        🏛️ Informations de votre association
                                    </p>

                                    {/* Nom de l'association */}
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Nom de l'association *</label>
                                        <div className="form-input-container">
                                            <Building2 size={18} className="form-icon" />
                                            <input 
                                                type="text" 
                                                name="asso_name" 
                                                className="form-input" 
                                                placeholder="Club Informatique de l'UNA" 
                                                value={formData.asso_name} 
                                                onChange={handleChange} 
                                                required={isResponsable}
                                            />
                                        </div>
                                    </div>

                                    {/* Type d'association */}
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Type d'organisation *</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {[
                                                { id: 'CLUB', label: 'Club Étudiant', icon: '🎓', desc: 'Activité académique ou culturelle' },
                                                { id: 'ONG', label: 'ONG / Asso', icon: '🌍', desc: 'Organisation à but non lucratif' }
                                            ].map(type => (
                                                <div
                                                    key={type.id}
                                                    onClick={() => setFormData(prev => ({ ...prev, asso_type: type.id }))}
                                                    style={{
                                                        padding: '12px 10px',
                                                        borderRadius: '12px',
                                                        border: '2px solid',
                                                        borderColor: formData.asso_type === type.id ? 'var(--indigo)' : 'var(--borderl)',
                                                        background: formData.asso_type === type.id ? 'var(--indigo-light)' : 'var(--surf2)',
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '18px', marginBottom: '3px' }}>{type.icon}</div>
                                                    <div style={{ fontSize: '11px', fontWeight: '800', color: formData.asso_type === type.id ? 'var(--indigo)' : 'var(--ink)', textTransform: 'uppercase' }}>{type.label}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--ink3)', marginTop: '2px', lineHeight: 1.3 }}>{type.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Description (optionnel)</label>
                                        <div style={{ position: 'relative' }}>
                                            <FileText size={16} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--ink3)' }} />
                                            <textarea
                                                name="asso_description"
                                                className="form-input"
                                                style={{ paddingLeft: '40px', resize: 'vertical', minHeight: '80px', paddingTop: '12px' }}
                                                placeholder="Décrivez votre association en quelques mots..."
                                                value={formData.asso_description}
                                                onChange={handleChange}
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    {/* Objectifs */}
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Objectifs (optionnel)</label>
                                        <div style={{ position: 'relative' }}>
                                            <Target size={16} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--ink3)' }} />
                                            <textarea
                                                name="asso_objectives"
                                                className="form-input"
                                                style={{ paddingLeft: '40px', resize: 'vertical', minHeight: '70px', paddingTop: '12px' }}
                                                placeholder="Quels sont vos objectifs principaux ?"
                                                value={formData.asso_objectives}
                                                onChange={handleChange}
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <p style={{ fontSize: '11px', color: 'var(--ink3)', lineHeight: 1.4, fontWeight: '500', margin: 0 }}>
                                        * Le rôle Responsable est soumis à validation par l'équipe CampusConnect. Votre association sera visible publiquement après approbation.
                                    </p>
                                </div>
                            )}

                            {!isResponsable && (
                                <p style={{ fontSize: '11px', color: 'var(--ink3)', lineHeight: 1.4, fontWeight: '500', marginTop: '-8px' }}>
                                    * Le rôle Responsable est soumis à validation par l'équipe CampusConnect.
                                </p>
                            )}

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '16px' }}>
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
