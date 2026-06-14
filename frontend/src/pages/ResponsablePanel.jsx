import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Calendar, Users, Wallet, Trash2, Edit, Plus, 
    ArrowUpRight, Clock, CheckCircle, CheckCircle2, AlertCircle, Mail, UserMinus, Phone, X, UploadCloud, Eye,
    HeartHandshake, BadgeDollarSign, RefreshCw, Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WhatsappIcon = ({ size = 18 }) => (
    <svg 
        viewBox="0 0 24 24" 
        width={size} 
        height={size} 
        fill="currentColor" 
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.459 3.473 1.332 4.988L2 22l5.163-1.354c1.464.798 3.109 1.218 4.845 1.218 5.508 0 9.99-4.482 9.99-9.988S17.52 2 12.012 2zm0 18.286c-1.523 0-3.02-.409-4.329-1.182l-.31-.184-3.218.843.858-3.136-.202-.322c-.848-1.354-1.296-2.924-1.296-4.542 0-4.547 3.7-8.246 8.298-8.246 4.595 0 8.295 3.699 8.295 8.246s-3.7 8.244-8.296 8.244zm4.55-6.208c-.249-.125-1.477-.729-1.706-.812-.229-.084-.396-.125-.562.125-.167.25-.646.812-.792.979-.146.167-.292.188-.541.063-.25-.125-1.054-.388-2.008-1.238-.742-.662-1.242-1.48-1.388-1.73-.146-.25-.016-.385.109-.509.112-.112.249-.292.374-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.021-.438-.063-.125-.562-1.354-.771-1.854-.203-.491-.41-.424-.562-.431-.146-.007-.312-.007-.479-.007-.167 0-.438.063-.667.313-.229.25-.875.855-.875 2.083 0 1.229.896 2.417.996 2.563.1.146 1.761 2.689 4.267 3.771.596.257 1.061.411 1.423.526.602.19 1.15.163 1.583.099.483-.072 1.477-.604 1.686-1.188.21-.584.21-1.084.146-1.188-.063-.105-.229-.168-.479-.293z"/>
    </svg>
);

const ResponsablePanel = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [members, setMembers] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [finances, setFinances] = useState({ transactions: [], totalRevenue: 0 });
    const [donations, setDonations] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [financeSubTab, setFinanceSubTab] = useState('events');
    const [loading, setLoading] = useState(true);
    const [association, setAssociation] = useState(null);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    // Popup de succès et modale de confirmation
    const [successPopup, setSuccessPopup] = useState({ visible: false, message: '' });
    const [confirmModal, setConfirmModal] = useState({ visible: false, message: '', onConfirm: null });
    const [feedbackModal, setFeedbackModal] = useState({ visible: false, type: 'success', message: '' });
    const [uploadingProof, setUploadingProof] = useState(false);

    useEffect(() => {
        loadAssociation();
    }, []);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadAssociation = async () => {
        try {
            const res = await api.get('associations/my-association');
            setAssociation(res.data);
        } catch (error) {
            console.error('Erreur chargement association:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        setStatusMsg({ type: '', text: '' });
        try {
            if (activeTab === 'events') {
                const res = await api.get('events/my-events');
                setEvents(res.data);
            } else if (activeTab === 'members') {
                const [membersRes, pendingRes] = await Promise.all([
                    api.get('associations/my-association/members'),
                    api.get('associations/my-association/pending-members')
                ]);
                setMembers(membersRes.data);
                setPendingMembers(pendingRes.data);
            } else if (activeTab === 'finances') {
                const [finRes, donRes, contribRes] = await Promise.all([
                    api.get('associations/my-association/finances'),
                    api.get('donations/my-asso').catch(() => ({ data: [] })),
                    api.get('donations/my-asso/contributions').catch(() => ({ data: [] }))
                ]);
                setFinances(finRes.data);
                setDonations(donRes.data);
                setContributions(contribRes.data);
            }
        } catch (error) {
            console.error(`Erreur chargement ${activeTab}:`, error);
            setStatusMsg({ type: 'error', text: 'Une erreur est survenue lors du chargement.' });
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        setSuccessPopup({ visible: true, message });
        setTimeout(() => setSuccessPopup({ visible: false, message: '' }), 3000);
    };

    const askConfirm = (message, onConfirm) => {
        setConfirmModal({ visible: true, message, onConfirm });
    };

    const handleDeleteEvent = async (id) => {
        askConfirm("Voulez-vous vraiment annuler cet événement ?", async () => {
            try {
                await api.delete(`events/${id}`);
                setEvents(events.filter(e => e.id !== id));
                setFeedbackModal({ visible: true, type: 'success', message: 'Événement annulé avec succès.' });
            } catch (error) {
                setFeedbackModal({ visible: true, type: 'error', message: 'Erreur lors de la suppression.' });
            }
        });
    };

    const handleRemoveMember = async (userId) => {
        askConfirm("Révoquer l'adhésion de cet étudiant ?", async () => {
            try {
                await api.delete(`associations/my-association/members/${userId}`);
                setMembers(members.filter(m => m.id !== userId));
                setFeedbackModal({ visible: true, type: 'success', message: 'Adhérent révoqué avec succès.' });
            } catch (error) {
                setFeedbackModal({ visible: true, type: 'error', message: 'Erreur lors de la révocation.' });
            }
        });
    };

    const handleValidatePayment = async (registrationId) => {
        askConfirm("Confirmer la validation de ce paiement ?", async () => {
            try {
                await api.put(`registrations/${registrationId}/validate`);
                loadData();
                setFeedbackModal({ visible: true, type: 'success', message: 'Paiement effectué !' });
            } catch (error) {
                setFeedbackModal({ visible: true, type: 'error', message: 'Erreur lors de la validation du paiement.' });
            }
        });
    };

    const handleValidateDonation = async (donationId) => {
        askConfirm("Confirmer la réception de ce don ?", async () => {
            try {
                await api.put(`donations/${donationId}/validate`);
                setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: 'VALIDE' } : d));
                setFeedbackModal({ visible: true, type: 'success', message: 'Don validé avec succès !' });
            } catch (error) {
                setFeedbackModal({ visible: true, type: 'error', message: 'Erreur lors de la validation du don.' });
            }
        });
    };

    const handleValidateContribution = async (contribId) => {
        askConfirm("Confirmer le paiement de cette cotisation ?", async () => {
            try {
                await api.put(`donations/contributions/${contribId}/validate`);
                setContributions(prev => prev.map(c => c.id === contribId ? { ...c, status: 'PAYE' } : c));
                setFeedbackModal({ visible: true, type: 'success', message: 'Cotisation validée !' });
            } catch (error) {
                setFeedbackModal({ visible: true, type: 'error', message: 'Erreur lors de la validation de la cotisation.' });
            }
        });
    };

    const handleValidateMembershipPayment = async (userId) => {
        askConfirm("Confirmer la réception de la cotisation annuelle de cet étudiant ?", async () => {
            try {
                await api.put(`associations/my-association/members/${userId}/validate-payment`);
                const res = await api.get('associations/my-association/members');
                setMembers(res.data);
                setFeedbackModal({ visible: true, type: 'success', message: 'Cotisation validée ! La commission CampusConnect a été calculée automatiquement.' });
            } catch (error) {
                setFeedbackModal({ visible: true, type: 'error', message: error.response?.data?.message || 'Erreur lors de la validation de la cotisation.' });
            }
        });
    };

    const handleApproveMember = async (userId) => {
        try {
            await api.put(`associations/my-association/members/${userId}/approve`);
            setPendingMembers(pendingMembers.filter(m => m.id !== userId));
            // Recharger les membres approuvés
            const res = await api.get('associations/my-association/members');
            setMembers(res.data);
            setFeedbackModal({ visible: true, type: 'success', message: 'Adhésion approuvée !' });
        } catch (error) {
            setFeedbackModal({ visible: true, type: 'error', message: 'Erreur lors de l\'approbation.' });
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        const fee = parseFloat(e.target.membership_fee.value);
        if (isNaN(fee) || fee < 0) {
            setFeedbackModal({ visible: true, type: 'error', message: 'Montant de cotisation invalide.' });
            return;
        }
        try {
            await api.put('associations/my-association/settings', { membership_fee: fee });
            setAssociation(prev => ({ ...prev, membership_fee: fee }));
            setFeedbackModal({ visible: true, type: 'success', message: `Cotisation annuelle mise à jour avec succès : ${fee} MRU` });
        } catch (error) {
            setFeedbackModal({ visible: true, type: 'error', message: error.response?.data?.message || 'Erreur lors de la mise à jour.' });
        }
    };

    const handleProofUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !association) return;

        const formData = new FormData();
        formData.append('proof', file);

        setUploadingProof(true);
        try {
            const res = await api.post(`associations/${association.id}/premium-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAssociation(prev => ({
                ...prev,
                payment_proof_url: res.data.payment_proof_url,
                payment_status: 'EN_ATTENTE'
            }));
            setFeedbackModal({ visible: true, type: 'success', message: 'Reçu de paiement envoyé avec succès. En attente de validation.' });
        } catch (err) {
            console.error('Erreur upload:', err);
            setFeedbackModal({ visible: true, type: 'error', message: "Erreur lors de l'envoi du reçu." });
        } finally {
            setUploadingProof(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>

            {/* ===== POPUP SUCCÈS ===== */}
            {successPopup.visible && (
                <div style={{
                    position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#fff', borderRadius: '16px', padding: '18px 28px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '2px solid #10B981',
                    animation: 'fadeInDown 0.3s ease'
                }}>
                    <CheckCircle2 size={28} color="#10B981" />
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#065F46' }}>
                        {successPopup.message}
                    </span>
                </div>
            )}

            {/* ===== MODALE DE CONFIRMATION ===== */}
            {confirmModal.visible && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(15,23,42,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '20px', padding: '36px',
                        maxWidth: '400px', width: '90%', textAlign: 'center',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <AlertCircle size={28} color="#D97706" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--ink)' }}>Confirmation</h3>
                        <p style={{ color: 'var(--ink3)', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
                            {confirmModal.message}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setConfirmModal({ visible: false, message: '', onConfirm: null })}
                                className="btn btn-secondary"
                                style={{ padding: '10px 24px', fontWeight: '700' }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={async () => {
                                    const fn = confirmModal.onConfirm;
                                    setConfirmModal({ visible: false, message: '', onConfirm: null });
                                    if (fn) await fn();
                                }}
                                className="btn btn-primary"
                                style={{ padding: '10px 24px', fontWeight: '700' }}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODALE DE FEEDBACK (Succès / Erreur) ===== */}
            {feedbackModal.visible && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(15,23,42,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="animate-fade-in" style={{
                        background: '#fff', borderRadius: '20px', padding: '36px',
                        maxWidth: '400px', width: '90%', textAlign: 'center',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
                    }}>
                        {feedbackModal.type === 'success' ? (
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CheckCircle2 size={28} color="#059669" />
                            </div>
                        ) : (
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <AlertCircle size={28} color="#DC2626" />
                            </div>
                        )}
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--ink)' }}>
                            {feedbackModal.type === 'success' ? 'Succès' : 'Erreur'}
                        </h3>
                        <p style={{ color: 'var(--ink3)', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
                            {feedbackModal.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={() => setFeedbackModal({ visible: false, type: 'success', message: '' })}
                                className="btn btn-primary"
                                style={{ padding: '10px 32px', fontWeight: '700' }}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--ink)', marginBottom: '8px' }}>
                        Gestion Association
                    </h1>
                    <p style={{ color: 'var(--ink3)', fontWeight: '500', margin: 0 }}>
                        Pilotez vos événements, vos membres et votre trésorerie.
                        {association && (
                            <span style={{ 
                                marginLeft: '12px', 
                                padding: '4px 10px', 
                                borderRadius: '8px', 
                                fontSize: '12px', 
                                fontWeight: '800',
                                backgroundColor: association.plan === 'premium' ? 'var(--indigo-light)' : 'var(--surf3)',
                                color: association.plan === 'premium' ? 'var(--indigo)' : 'var(--ink3)',
                                border: '1px solid currentColor'
                            }}>
                                PLAN {association.plan?.toUpperCase()}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Premium Tabs & Action Buttons */}
            <div className="flex justify-between items-center hide-on-print" style={{ marginBottom: '32px' }}>
                <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    backgroundColor: 'var(--surf3)', 
                    padding: '6px', 
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '450px'
                }}>
                    {[
                        { id: 'events', label: "Événements", icon: <Calendar size={18} /> },
                        { id: 'members', label: "Adhérents", icon: <Users size={18} /> },
                        { id: 'finances', label: "Trésorerie", icon: <Wallet size={18} /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                flex: 1,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px',
                                padding: '12px',
                                borderRadius: '12px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: '0.2s',
                                backgroundColor: activeTab === tab.id ? '#fff' : 'transparent',
                                color: activeTab === tab.id ? 'var(--indigo)' : 'var(--ink3)',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3" style={{ alignItems: 'center' }}>
                    {association && association.plan === 'free' && association.payment_status !== 'EN_ATTENTE' && (
                        <button 
                            onClick={() => {
                                let userName = '';
                                try {
                                    const stored = localStorage.getItem('user');
                                    if (stored) userName = JSON.parse(stored).name || '';
                                } catch (e) {}
                                const msg = `Bonjour, je m'appelle ${userName} responsable de l'association ${association.name} souhaite passer au plan premium.`;
                                window.open(`https://wa.me/22243455259?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="btn"
                            style={{ 
                                backgroundColor: '#25D366', 
                                color: '#fff', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                fontWeight: '700',
                                padding: '12px 18px',
                                fontSize: '14px',
                                borderRadius: '12px',
                                height: 'fit-content'
                            }}
                        >
                            <WhatsappIcon size={18} /> Payer Premium (500 MRU)
                        </button>
                    )}
                    {association && association.plan === 'free' && association.payment_status === 'EN_ATTENTE' && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            backgroundColor: '#FEF3C7',
                            color: '#D97706',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '700',
                            height: 'fit-content',
                            border: '1px solid #FCD34D'
                        }}>
                            <Clock size={16} /> Premium en attente
                        </div>
                    )}
                    {activeTab === 'events' && (
                        <Link to="/create-event" className="btn btn-primary flex items-center gap-2" style={{ padding: '12px 18px', fontSize: '14px', borderRadius: '12px', height: 'fit-content', textDecoration: 'none' }}>
                            <Plus size={18} /> Nouvel Événement
                        </Link>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="surf-container" style={{ background: '#fff', borderRadius: '24px', border: '1px solid var(--borderl)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* TAB: EVENTS */}
                        {activeTab === 'events' && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--surf2)', borderBottom: '1px solid var(--borderl)' }}>
                                        <tr style={{ textAlign: 'left' }}>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>NOM</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>DATE</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>PARTICIPANTS</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map(e => (
                                            <tr key={e.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                                    <div style={{ fontWeight: '700', color: 'var(--ink)' }}>{e.title}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{e.location}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '14px', color: 'var(--ink2)', borderRight: '1px solid var(--borderl)' }}>
                                                    {new Date(e.date).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                                    <div className="flex items-center gap-2">
                                                        <Users size={14} className="text-secondary" />
                                                        <span style={{ fontWeight: '700' }}>{e.participant_count || 0}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div className="flex gap-3">
                                                        <Link to={`/events/${e.id}/participants`} title="Liste Inscrits"><Users size={18} style={{ color: 'var(--amber)' }} /></Link>
                                                        <Link to={`/edit-event/${e.id}`} title="Modifier l'événement"><Edit size={18} className="text-ink3" /></Link>
                                                        <button onClick={() => handleDeleteEvent(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)' }} title="Supprimer l'événement"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB: MEMBERS */}
                        {activeTab === 'members' && (
                            <div>
                                {/* Configuration de la cotisation (si Premium) */}
                                {association && association.plan === 'premium' && (
                                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--borderl)', background: 'var(--indigo-light)' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--indigo)', marginBottom: '8px' }}>
                                            Configuration de la Cotisation Annuelle
                                        </h3>
                                        <p style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: '16px' }}>
                                            Définissez le montant de la cotisation annuelle obligatoire pour les nouveaux adhérents de votre association.
                                        </p>
                                        <form onSubmit={handleUpdateSettings} className="flex gap-4" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                            <div style={{ flex: '1', minWidth: '200px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--ink2)', marginBottom: '6px' }}>
                                                    Montant de la cotisation (MRU)
                                                </label>
                                                <input 
                                                    type="number" 
                                                    name="membership_fee"
                                                    defaultValue={association.membership_fee || 0}
                                                    min="0"
                                                    step="0.01"
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '10px 14px', 
                                                        borderRadius: '10px', 
                                                        border: '1px solid var(--borderl)',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }}
                                                />
                                            </div>
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary"
                                                style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', height: '42px' }}
                                            >
                                                Mettre à jour
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Section : Demandes en attente */}
                                {pendingMembers.length > 0 && (
                                    <div style={{ borderBottom: '1px solid var(--borderl)', padding: '24px 32px' }}>
                                        <h3 style={{
                                            fontSize: '14px', fontWeight: 800,
                                            color: 'var(--amber)', textTransform: 'uppercase',
                                            letterSpacing: '0.5px', marginBottom: '16px',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}>
                                            <span style={{
                                                background: 'var(--amber)', color: '#fff',
                                                borderRadius: '50%', width: '20px', height: '20px',
                                                display: 'inline-flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '11px'
                                            }}>{pendingMembers.length}</span>
                                            Demandes d'adhésion en attente
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {pendingMembers.map(m => (
                                                <div key={m.id} style={{
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '14px 16px',
                                                    background: 'var(--surf2)',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--borderl)'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{m.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{m.email}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleApproveMember(m.id)}
                                                        className="btn btn-primary"
                                                        style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700 }}
                                                    >
                                                        Approuver
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Section : Membres approuvés */}
                                <div style={{ overflowX: 'auto' }}>
                                    {members.length === 0 && pendingMembers.length === 0 ? (
                                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink3)' }}>
                                            Aucun adhérent pour le moment.
                                        </div>
                                    ) : members.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: 'var(--surf2)', borderBottom: '1px solid var(--borderl)' }}>
                                                <tr style={{ textAlign: 'left' }}>
                                                    <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>ADHÉRENT</th>
                                                    <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>CONTACT</th>
                                                    {association && association.plan === 'premium' && (
                                                        <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>COTISATION</th>
                                                    )}
                                                    <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>DEPUIS LE</th>
                                                    <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {members.map(m => (
                                                    <tr key={m.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                        <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                                            <div style={{ fontWeight: '700', color: 'var(--ink)' }}>{m.name}</div>
                                                        </td>
                                                        <td style={{ padding: '20px 32px', fontSize: '14px', color: 'var(--ink2)', borderRight: '1px solid var(--borderl)' }}>
                                                            {m.email}
                                                        </td>
                                                        {association && association.plan === 'premium' && (
                                                            <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                                                {m.payment_status === 'pending' ? (
                                                                    <div className="flex flex-column gap-2">
                                                                        <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#FEF3C7', color: '#D97706', width: 'fit-content' }}>
                                                                            {m.price_applied} MRU (EN ATTENTE)
                                                                        </span>
                                                                        <button 
                                                                            onClick={() => handleValidateMembershipPayment(m.id)}
                                                                            className="btn btn-primary"
                                                                            style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '700', width: 'fit-content' }}
                                                                        >
                                                                            Valider Cotisation
                                                                        </button>
                                                                    </div>
                                                                ) : m.payment_status === 'validated' ? (
                                                                    <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#D1FAE5', color: '#059669' }}>
                                                                        {m.price_applied} MRU (PAYÉ)
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: 'var(--surf3)', color: 'var(--ink3)' }}>
                                                                        Gratuit
                                                                    </span>
                                                                )}
                                                            </td>
                                                        )}
                                                        <td style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>
                                                            {new Date(m.joined_at).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ padding: '20px 32px' }}>
                                                            <button 
                                                                onClick={() => handleRemoveMember(m.id)} 
                                                                className="btn btn-danger flex items-center gap-2" 
                                                                style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700' }}
                                                            >
                                                                <UserMinus size={14} color="#fff" /> RÉVOQUER
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {/* TAB: FINANCES */}
                        {activeTab === 'finances' && (
                            <div style={{ padding: '32px' }}>
                                {association?.plan === 'free' ? (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surf2)', borderRadius: '16px' }}>
                                        <Wallet size={48} color="var(--ink3)" style={{ margin: '0 auto 16px' }} />
                                        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Tableau de bord financier</h3>
                                        <p style={{ color: 'var(--ink3)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                                            Le suivi de la trésorerie et la validation des paiements sont des fonctionnalités réservées au plan Premium (500 MRU / mois).
                                        </p>
                                        
                                        {association.payment_status === 'EN_ATTENTE' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '12px', fontWeight: '700' }}>
                                                    <Clock size={18} /> Paiement en attente de validation par l'administrateur
                                                </div>
                                                {association.payment_proof_url && (
                                                    <a
                                                        href={`http://localhost:5000${association.payment_proof_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-secondary flex items-center gap-2"
                                                        style={{ width: 'fit-content', color: '#D97706' }}
                                                    >
                                                        <Eye size={16} /> Voir le reçu envoyé
                                                    </a>
                                                )}
                                                <label style={{ cursor: 'pointer', fontSize: '13px', color: 'var(--ink3)', marginTop: '8px' }}>
                                                    Modifier le reçu :
                                                    <input type="file" accept="image/*,.pdf" onChange={handleProofUpload} disabled={uploadingProof} style={{ display: 'block', marginTop: '4px' }} />
                                                </label>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                                <button 
                                                    onClick={() => {
                                                        let userName = '';
                                                        try {
                                                            const stored = localStorage.getItem('user');
                                                            if (stored) userName = JSON.parse(stored).name || '';
                                                        } catch (e) {}
                                                        const msg = `Bonjour, je m'appelle ${userName} responsable de l'association ${association.name} souhaite passer au plan premium.`;
                                                        window.open(`https://wa.me/22243455259?text=${encodeURIComponent(msg)}`, '_blank');
                                                    }}
                                                    className="btn"
                                                    style={{ 
                                                        backgroundColor: '#25D366', color: '#fff', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px'
                                                    }}
                                                >
                                                    <WhatsappIcon size={18} /> 1. Payer 500 MRU via WhatsApp
                                                </button>
                                                
                                                <div style={{ 
                                                    background: '#fff', padding: '24px', borderRadius: '16px', border: '1.5px dashed #FCD34D', maxWidth: '400px', width: '100%' 
                                                }}>
                                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <UploadCloud size={18} /> 2. Envoyer le reçu
                                                    </h4>
                                                    <p style={{ fontSize: '13px', color: '#78350F', marginBottom: '16px' }}>
                                                        Après avoir effectué le paiement, déposez la capture d'écran ici pour validation rapide.
                                                    </p>
                                                    <label style={{
                                                        display: 'inline-block', padding: '10px 20px', background: '#FEF3C7', color: '#B45309', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
                                                    }}>
                                                        {uploadingProof ? 'Envoi en cours...' : 'Choisir le reçu (Image ou PDF)'}
                                                        <input type="file" accept="image/*,.pdf" onChange={handleProofUpload} disabled={uploadingProof} style={{ display: 'none' }} />
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                {/* ── KPI Cards ─────────────────────── */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                                    {[
                                        {
                                            label: 'Trésorerie Événements',
                                            value: `${finances.totalRevenue?.toLocaleString() ?? 0} MRU`,
                                            icon: <Calendar size={22} />,
                                            color: 'var(--indigo)',
                                            bg: 'var(--indigo-light)'
                                        },
                                        {
                                            label: 'Dons reçus',
                                            value: `${donations.filter(d => d.status === 'VALIDE' && d.donation_type === 'MONETARY').reduce((s, d) => s + parseFloat(d.amount || 0), 0).toLocaleString()} MRU`,
                                            icon: <HeartHandshake size={22} />,
                                            color: '#059669',
                                            bg: '#D1FAE5'
                                        },
                                        {
                                            label: 'Cotisations perçues',
                                            value: `${contributions.filter(c => c.status === 'PAYE').reduce((s, c) => s + parseFloat(c.amount || 0), 0).toLocaleString()} MRU`,
                                            icon: <RefreshCw size={22} />,
                                            color: '#7C3AED',
                                            bg: '#EDE9FE'
                                        },
                                        {
                                            label: 'Dons en nature',
                                            value: `${donations.filter(d => d.donation_type === 'IN_KIND').length} don(s)`,
                                            icon: <Gift size={22} />,
                                            color: '#D97706',
                                            bg: '#FEF3C7'
                                        }
                                    ].map((kpi, i) => (
                                        <div key={i} style={{ background: '#fff', border: '1px solid var(--borderl)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ background: kpi.bg, color: kpi.color, borderRadius: '12px', padding: '12px', flexShrink: 0 }}>
                                                {kpi.icon}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '12px', color: 'var(--ink3)', fontWeight: '600', marginBottom: '2px' }}>{kpi.label}</p>
                                                <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink)' }}>{kpi.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Finance Sub-Tabs ───────────────── */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid var(--borderl)', paddingBottom: '0' }}>
                                    {[
                                        { id: 'events', label: 'Événements', icon: <Calendar size={15} /> },
                                        { id: 'donations', label: 'Dons', icon: <HeartHandshake size={15} /> },
                                        { id: 'contributions', label: 'Cotisations récurrentes', icon: <RefreshCw size={15} /> }
                                    ].map(st => (
                                        <button
                                            key={st.id}
                                            onClick={() => setFinanceSubTab(st.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '10px 18px', border: 'none', borderRadius: '10px 10px 0 0',
                                                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                                background: financeSubTab === st.id ? '#fff' : 'transparent',
                                                color: financeSubTab === st.id ? 'var(--indigo)' : 'var(--ink3)',
                                                borderBottom: financeSubTab === st.id ? '2px solid var(--indigo)' : '2px solid transparent',
                                                marginBottom: '-2px', transition: '0.15s'
                                            }}
                                        >
                                            {st.icon} {st.label}
                                        </button>
                                    ))}
                                </div>

                                {/* ── Sub-tab: Événements ───────────── */}
                                {financeSubTab === 'events' && (
                                <div style={{ border: '1px solid var(--borderl)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surf2)' }}>
                                             <tr style={{ textAlign: 'left' }}>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>DATE</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>PARTICIPANT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>ÉVÉNEMENT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>MONTANT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>STATUT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {finances.transactions.length === 0 ? (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink3)' }}>Aucune transaction</td></tr>
                                            ) : finances.transactions.map(t => (
                                                <tr key={t.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>{new Date(t.date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>{t.user_name}</td>
                                                    <td style={{ padding: '16px', fontSize: '14px', borderRight: '1px solid var(--borderl)' }}>{t.event_title}</td>
                                                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--indigo)', borderRight: '1px solid var(--borderl)' }}>
                                                        {t.payment_status === 'GRATUIT' ? <span style={{ color: 'var(--ink3)' }}>—</span> : `${t.amount} MRU`}
                                                    </td>
                                                    <td style={{ padding: '16px', borderRight: '1px solid var(--borderl)' }}>
                                                        {t.payment_status === 'EN_ATTENTE' && <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#FEF3C7', color: '#D97706' }}>EN ATTENTE</span>}
                                                        {t.payment_status === 'PAYE' && <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#D1FAE5', color: '#059669' }}>PAYÉ</span>}
                                                        {t.payment_status === 'GRATUIT' && <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: 'var(--surf3)', color: 'var(--ink3)' }}>GRATUIT</span>}
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        {t.payment_status === 'EN_ATTENTE' ? (
                                                            <button onClick={() => handleValidatePayment(t.id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}>Valider</button>
                                                        ) : <span style={{ fontSize: '12px', color: 'var(--ink3)' }}>—</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                )}

                                {/* ── Sub-tab: Dons ─────────────────── */}
                                {financeSubTab === 'donations' && (
                                <div style={{ border: '1px solid var(--borderl)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surf2)' }}>
                                            <tr style={{ textAlign: 'left' }}>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>DATE</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>DONATEUR</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>TYPE</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>MONTANT / DESCRIPTION</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>STATUT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {donations.length === 0 ? (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink3)' }}>Aucun don reçu pour l'instant</td></tr>
                                            ) : donations.map(d => (
                                                <tr key={d.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                                                    <td style={{ padding: '16px', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>
                                                        <div>{d.donor_name}</div>
                                                        {d.donor_email && <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{d.donor_email}</div>}
                                                    </td>
                                                    <td style={{ padding: '16px', borderRight: '1px solid var(--borderl)' }}>
                                                        {d.donation_type === 'MONETARY'
                                                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: '#EDE9FE', color: '#7C3AED', padding: '3px 10px', borderRadius: '6px', fontWeight: '700' }}><BadgeDollarSign size={12} /> Financier</span>
                                                            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: '#FEF3C7', color: '#D97706', padding: '3px 10px', borderRadius: '6px', fontWeight: '700' }}><Gift size={12} /> En nature</span>}
                                                    </td>
                                                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--indigo)', borderRight: '1px solid var(--borderl)' }}>
                                                        {d.donation_type === 'MONETARY' ? `${parseFloat(d.amount).toLocaleString()} MRU` : d.item_description}
                                                        {d.donation_type === 'MONETARY' && d.commission_amount && (
                                                            <div style={{ fontSize: '11px', color: 'var(--ink3)', fontWeight: '500' }}>Commission: {parseFloat(d.commission_amount).toLocaleString()} MRU</div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '16px', borderRight: '1px solid var(--borderl)' }}>
                                                        {d.status === 'EN_ATTENTE' && <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#FEF3C7', color: '#D97706' }}>EN ATTENTE</span>}
                                                        {d.status === 'VALIDE' && <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#D1FAE5', color: '#059669' }}>VALIDÉ</span>}
                                                        {d.status === 'REFUSE' && <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#FEE2E2', color: '#DC2626' }}>REFUSÉ</span>}
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        {d.status === 'EN_ATTENTE' ? (
                                                            <button onClick={() => handleValidateDonation(d.id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '700', background: '#059669' }}>Confirmer réception</button>
                                                        ) : <span style={{ fontSize: '12px', color: 'var(--ink3)' }}>—</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                )}

                                {/* ── Sub-tab: Cotisations récurrentes ─ */}
                                {financeSubTab === 'contributions' && (
                                <div style={{ border: '1px solid var(--borderl)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surf2)' }}>
                                            <tr style={{ textAlign: 'left' }}>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>PÉRIODE</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>MEMBRE</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>MONTANT DÛ</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>STATUT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contributions.length === 0 ? (
                                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink3)' }}>Aucune cotisation récurrente enregistrée</td></tr>
                                            ) : contributions.map(c => (
                                                <tr key={c.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>{c.period}</td>
                                                    <td style={{ padding: '16px', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>
                                                        <div>{c.member_name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{c.member_email}</div>
                                                    </td>
                                                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--indigo)', borderRight: '1px solid var(--borderl)' }}>{parseFloat(c.amount).toLocaleString()} MRU</td>
                                                    <td style={{ padding: '16px', borderRight: '1px solid var(--borderl)' }}>
                                                        {c.status === 'EN_ATTENTE' && <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#FEF3C7', color: '#D97706' }}>EN ATTENTE</span>}
                                                        {c.status === 'PAYE' && <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#D1FAE5', color: '#059669' }}>PAYÉ</span>}
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        {c.status === 'EN_ATTENTE' ? (
                                                            <button onClick={() => handleValidateContribution(c.id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}>Valider paiement</button>
                                                        ) : <span style={{ fontSize: '12px', color: 'var(--ink3)' }}>—</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                )}
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ResponsablePanel;
