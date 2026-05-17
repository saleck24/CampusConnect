import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Calendar, Users, Wallet, Trash2, Edit, Plus, 
    ArrowUpRight, Clock, CheckCircle, CheckCircle2, AlertCircle, Mail, UserMinus, Phone, X
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
    const [loading, setLoading] = useState(true);
    const [association, setAssociation] = useState(null);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    // Popup de succès et modale de confirmation
    const [successPopup, setSuccessPopup] = useState({ visible: false, message: '' });
    const [confirmModal, setConfirmModal] = useState({ visible: false, message: '', onConfirm: null });

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
                const res = await api.get('associations/my-association/finances');
                setFinances(res.data);
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
                showSuccess('Événement annulé avec succès.');
            } catch (error) {
                setStatusMsg({ type: 'error', text: 'Erreur lors de la suppression.' });
            }
        });
    };

    const handleRemoveMember = async (userId) => {
        askConfirm("Révoquer l'adhésion de cet étudiant ?", async () => {
            try {
                await api.delete(`associations/my-association/members/${userId}`);
                setMembers(members.filter(m => m.id !== userId));
                showSuccess('Adhérent révoqué avec succès.');
            } catch (error) {
                setStatusMsg({ type: 'error', text: 'Erreur lors de la révocation.' });
            }
        });
    };

    const handleValidatePayment = async (registrationId) => {
        askConfirm("Confirmer la validation de ce paiement ?", async () => {
            try {
                await api.put(`registrations/${registrationId}/validate`);
                loadData();
                showSuccess('Paiement effectué !');
            } catch (error) {
                setStatusMsg({ type: 'error', text: 'Erreur lors de la validation du paiement.' });
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
            setStatusMsg({ type: 'success', text: 'Adhésion approuvée !' });
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Erreur lors de l\'approbation.' });
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
                    {association && association.plan === 'free' && (
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
                            <WhatsappIcon size={18} /> Passer Premium
                        </button>
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
                                            Le suivi de la trésorerie et la validation des paiements sont des fonctionnalités réservées au plan Premium.
                                        </p>
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
                                                fontWeight: '700',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px',
                                                fontSize: '12px',
                                                height: 'fit-content'
                                            }}
                                        >
                                            <WhatsappIcon size={14} /> Passer Premium
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                {/* Treasury Summary Card */}
                                <div style={{ 
                                    background: 'var(--indigo)', 
                                    padding: '32px', 
                                    borderRadius: '20px', 
                                    color: '#fff', 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '40px',
                                    boxShadow: '0 12px 24px rgba(79, 70, 229, 0.2)'
                                }}>
                                    <div>
                                        <p style={{ opacity: 0.8, fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Trésorerie Totale</p>
                                        <h2 style={{ fontSize: '36px', fontWeight: '800' }}>{finances.totalRevenue.toLocaleString()} MRU</h2>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px' }}>
                                        <Wallet size={32} />
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Journal des Transactions</h3>
                                <div style={{ border: '1px solid var(--borderl)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surf2)' }}>
                                             <tr style={{ textAlign: 'left' }}>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>DATE</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>PARTICIPANT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>ÉVÉNEMENT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>MONTANT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>STATUT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700' }}>PAIEMENT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {finances.transactions.map(t => (
                                                <tr key={t.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>{new Date(t.date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>{t.user_name}</td>
                                                    <td style={{ padding: '16px', fontSize: '14px', borderRight: '1px solid var(--borderl)' }}>{t.event_title}</td>
                                                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--indigo)', borderRight: '1px solid var(--borderl)' }}>
                                                        {t.payment_status === 'GRATUIT' ? <span style={{ color: 'var(--ink3)' }}>—</span> : `${t.amount} MRU`}
                                                    </td>
                                                    <td style={{ padding: '16px', borderRight: '1px solid var(--borderl)' }}>
                                                        {t.payment_status === 'EN_ATTENTE' && (
                                                            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#FEF3C7', color: '#D97706' }}>EN ATTENTE</span>
                                                        )}
                                                        {t.payment_status === 'PAYE' && (
                                                            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: '#D1FAE5', color: '#059669' }}>PAYÉ</span>
                                                        )}
                                                        {t.payment_status === 'GRATUIT' && (
                                                            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', background: 'var(--surf3)', color: 'var(--ink3)' }}>GRATUIT</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        {t.payment_status === 'EN_ATTENTE' ? (
                                                            <button
                                                                onClick={() => handleValidatePayment(t.id)}
                                                                className="btn btn-primary"
                                                                style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}
                                                            >
                                                                Valider
                                                            </button>
                                                        ) : (
                                                            <span style={{ fontSize: '12px', color: 'var(--ink3)' }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
