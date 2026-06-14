import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Building2, Target, ClipboardList, ArrowLeft, Loader2, AlertCircle,
    Info, CheckCircle, HeartHandshake, X, Gift, BadgeDollarSign, Send
} from 'lucide-react';

// ── Modale de paiement premium ─────────────────────────────────────────────
const PaymentModal = ({ fee, membershipId, associationId, onClose }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Veuillez choisir une preuve de paiement.');
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('proof', file);
        formData.append('membershipId', membershipId);
        try {
            await api.post(`associations/${associationId}/premium-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'envoi de la preuve.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', padding: '20px'
        }}>
            <div style={{
                background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
                animation: 'fadeInDown 0.3s ease'
            }}>
                <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '28px 32px', color: '#fff', position: 'relative' }}>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)',
                        border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}><X size={16} /></button>
                    <h3>Preuve de paiement</h3>
                    <p>Montant à payer: {fee} MRU</p>
                </div>
                <div style={{ padding: '32px' }}>
                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <CheckCircle size={48} color="#059669" />
                            <p>Preuve envoyée avec succès.</p>
                            <button className="btn btn-primary" onClick={onClose}>Fermer</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error && <div style={{ color: '#DC2626', marginBottom: '8px' }}>{error}</div>}
                            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} required />
                            <div style={{ marginTop: '16px' }}>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Envoi...' : 'Envoyer la preuve'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
// ── Page principale ──────────────────────────────────────────────────// ── Modale de Don ───────────────────────────────────────────────────
const DonationModal = ({ association, onClose }) => {
    const [step, setStep] = useState(1); // 1=type, 2=form, 3=success
    const [donationType, setDonationType] = useState('MONETARY');
    const [form, setForm] = useState({ donor_name: '', donor_email: '', amount: '', item_description: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post(`donations/${association.id}`, { ...form, donation_type: donationType });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi du don.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', padding: '20px'
        }}>
            <div style={{
                background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
                animation: 'fadeInDown 0.3s ease'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    padding: '28px 32px', color: '#fff', position: 'relative'
                }}>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)',
                        border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>
                        <X size={16} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '14px', padding: '10px' }}>
                            <HeartHandshake size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', opacity: 0.8, fontWeight: '600', margin: 0 }}>SOUTENIR</p>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{association.name}</h3>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '32px' }}>
                    {step === 3 ? (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <CheckCircle size={32} color="#059669" />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Merci pour votre soutien !</h3>
                            <p style={{ color: 'var(--ink3)', marginBottom: '24px', lineHeight: 1.6 }}>
                                Votre don a bien été enregistré. L'association {association.name} prendra contact avec vous prochainement pour confirmer la réception.
                            </p>
                            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>Fermer</button>
                        </div>
                    ) : step === 1 ? (
                        <>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quel type de don souhaitez-vous faire ?</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                {[
                                    { id: 'MONETARY', label: 'Don financier', icon: <BadgeDollarSign size={24} />, desc: 'Virement ou espèces', color: '#7C3AED', bg: '#EDE9FE' },
                                    { id: 'IN_KIND', label: 'Don en nature', icon: <Gift size={24} />, desc: 'Matériel, nourriture...', color: '#D97706', bg: '#FEF3C7' }
                                ].map(t => (
                                    <div key={t.id} onClick={() => setDonationType(t.id)} style={{
                                        padding: '20px 16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                                        border: '2px solid', borderColor: donationType === t.id ? t.color : 'var(--borderl)',
                                        background: donationType === t.id ? t.bg : '#fff', transition: '0.2s',
                                        transform: donationType === t.id ? 'scale(1.02)' : 'scale(1)'
                                    }}>
                                        <div style={{ color: t.color, marginBottom: '8px' }}>{t.icon}</div>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: t.color }}>{t.label}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--ink3)', marginTop: '4px' }}>{t.desc}</div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', background: '#059669' }}>
                                Continuer →
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {donationType === 'MONETARY' ? '💸 Don financier' : '📦 Don en nature'}
                                </label>
                            </div>

                            {error && (
                                <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
                                    {error}
                                </div>
                            )}

                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Votre nom *</label>
                                <input type="text" name="donor_name" className="form-input" placeholder="Prénom et nom" value={form.donor_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Email (facultatif)</label>
                                <input type="email" name="donor_email" className="form-input" placeholder="pour recevoir une confirmation" value={form.donor_email} onChange={handleChange} />
                            </div>

                            {donationType === 'MONETARY' ? (
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Montant (MRU) *</label>
                                    <input type="number" name="amount" className="form-input" placeholder="ex: 1000" min="1" value={form.amount} onChange={handleChange} required />
                                </div>
                            ) : (
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Description du bien *</label>
                                    <input type="text" name="item_description" className="form-input" placeholder="ex: 20 chaises, un frigo, des livres..." value={form.item_description} onChange={handleChange} required />
                                </div>
                            )}

                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Message (facultatif)</label>
                                <textarea name="message" className="form-input" rows={3} placeholder="Un mot d'encouragement..." value={form.message} onChange={handleChange} style={{ resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>← Retour</button>
                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {loading ? 'Envoi...' : <><Send size={16} /> Envoyer mon don</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Page principale ──────────────────────────────────────────────────
const AssociationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [association, setAssociation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joinSuccess, setJoinSuccess] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null); // { fee, membershipId, associationId }
    const [showDonationModal, setShowDonationModal] = useState(false);

    const handleJoin = async () => {
        if (!user) return navigate('/register');
        setJoinLoading(true);
        setJoinError('');
        try {
            const response = await api.post(`associations/${id}/join`);
            if (response.data && response.data.needPayment) {
                // Open payment modal
                setPaymentInfo({ fee: response.data.fee, membershipId: response.data.membershipId, associationId: id });
            } else {
                setJoinSuccess(true);
            }
        } catch (err) {
            setJoinError(err.response?.data?.message || 'Erreur lors de la demande d\'adhésion.');
        } finally {
            setJoinLoading(false);
        }
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`associations/${id}`);
                setAssociation(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Impossible de charger les détails.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <AlertCircle size={48} color="var(--color-error)" style={{ margin: '0 auto 1rem auto' }} />
                    <h2 style={{ color: 'var(--color-error)' }}>Erreur</h2>
                    <p>{error}</p>
                    <Link to="/associations" className="btn btn-primary mt-2 flex items-center gap-2 inline-flex" style={{ width: 'auto' }}>
                        <ArrowLeft size={18} /> Retour à l'annuaire
                    </Link>
                </div>
            </div>
        );
    }

    const isOng = association.type === 'ONG';

    return (
        <div className="container animate-fade-in mt-4 mb-4">
            {showDonationModal && <DonationModal association={association} onClose={() => setShowDonationModal(false)} />}
            {paymentInfo && (
                <PaymentModal
                    fee={paymentInfo.fee}
                    membershipId={paymentInfo.membershipId}
                    associationId={paymentInfo.associationId}
                    onClose={() => setPaymentInfo(null)}
                />
            )}
            
            <Link to="/associations" className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <ArrowLeft size={18} /> Retour à l'annuaire
            </Link>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header with Logo */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '2rem', borderBottom: '1px solid var(--color-border)', textAlign: 'center', position: 'relative' }}>
                    {association.logo_url ? (
                        <img
                            src={association.logo_url}
                            alt={association.name}
                            style={{ maxWidth: '250px', maxHeight: '150px', margin: '0 auto 1.5rem auto', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
                        />
                    ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: isOng ? '#059669' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            {isOng ? <HeartHandshake color="white" size={40} /> : <Building2 color="white" size={40} />}
                        </div>
                    )}
                    <h1 style={{ color: 'var(--color-text-main)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>{association.name}</h1>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '0.3rem 0.8rem',
                            backgroundColor: isOng ? 'rgba(5, 150, 105, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                            color: isOng ? '#059669' : 'var(--color-accent)',
                            borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem'
                        }}>
                            {isOng ? '🌱 ONG' : '🎓 Association'} Certifiée
                        </span>
                    </div>

                    {/* Bouton Faire un don pour les ONG */}
                    {/* Bouton Faire un don */}
                    <button
                        onClick={() => setShowDonationModal(true)}
                        style={{
                            position: 'absolute', top: '20px', right: '20px',
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            color: '#fff', fontWeight: '700', fontSize: '14px',
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                            transition: '0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <HeartHandshake size={18} /> Faire un don
                    </button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Description */}
                        <div>
                            <h3 className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-primary)' }}>
                                <Info size={20} /> Présentation
                            </h3>
                            <p style={{ lineHeight: '1.7', color: 'var(--color-text-main)' }}>
                                {association.description}
                            </p>
                        </div>

                        {/* Objectives */}
                        <div>
                            <h3 className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-primary)' }}>
                                <Target size={20} /> Nos Objectifs
                            </h3>
                            <p style={{ lineHeight: '1.7', color: 'var(--color-text-main)' }}>
                                {association.objectives || "Aucun objectif spécifique renseigné."}
                            </p>
                        </div>
                    </div>

                    <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

                    {/* Membership */}
                    <div>
                        <h3 className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-primary)' }}>
                            <ClipboardList size={20} /> Conditions d'adhésion
                        </h3>
                        <div style={{
                            backgroundColor: '#F1F5F9', padding: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `4px solid ${isOng ? '#059669' : 'var(--color-accent)'}`
                        }}>
                            <p style={{ margin: 0, fontWeight: 500 }}>
                                {association.membership_conditions || "Ouvert à tous les étudiants du campus."}
                            </p>
                        </div>
                    </div>

                    {/* CTA Donation banner pour ONG */}
                    {isOng && (
                        <div style={{
                            marginTop: '2rem',
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                            border: '1.5px solid #6ee7b7',
                            borderRadius: '16px',
                            padding: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '16px'
                        }}>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#065f46', margin: '0 0 4px' }}>💚 Soutenez notre mission</h4>
                                <p style={{ fontSize: '13px', color: '#047857', margin: 0 }}>
                                    Chaque don, quelle que soit sa forme, nous aide à avancer. Merci de votre générosité !
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDonationModal(true)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    padding: '12px 24px', borderRadius: '12px', border: 'none',
                                    background: '#059669', color: '#fff', fontWeight: '700',
                                    fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap'
                                }}
                            >
                                <HeartHandshake size={18} /> Faire un don
                            </button>
                        </div>
                    )}

                    {joinSuccess && (
                        <div style={{
                            position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
                            backgroundColor: '#DEF7EC', border: '1px solid #31C48D', color: '#03543F',
                            padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.3s ease-out'
                        }}>
                            <CheckCircle size={28} />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Félicitations !</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Votre demande d'adhésion a bien été envoyée.</p>
                            </div>
                            <button onClick={() => setJoinSuccess(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#03543F', marginLeft: '1rem' }}>&times;</button>
                        </div>
                    )}

                    <div className="mt-4 flex flex-col items-end gap-2">
                        {joinError && <p style={{ color: 'var(--color-error)', margin: 0 }}>{joinError}</p>}
                        <button className="btn btn-primary" onClick={handleJoin} disabled={joinLoading || joinSuccess}>
                            {joinLoading ? 'Envoi en cours...' : (!user ? 'S\'inscrire pour adhérer' : (joinSuccess ? 'Demande envoyée' : 'Devenir Membre'))}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociationDetails;
