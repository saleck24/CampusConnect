import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Calendar, Users, Wallet, Trash2, Edit, Plus, 
    ArrowUpRight, Clock, CheckCircle, AlertCircle, Mail, UserMinus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ResponsablePanel = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [members, setMembers] = useState([]);
    const [finances, setFinances] = useState({ transactions: [], totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setStatusMsg({ type: '', text: '' });
        try {
            if (activeTab === 'events') {
                const res = await api.get('events/my-events');
                setEvents(res.data);
            } else if (activeTab === 'members') {
                const res = await api.get('associations/my-association/members');
                setMembers(res.data);
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

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Voulez-vous vraiment annuler cet événement ?")) return;
        try {
            await api.delete(`events/${id}`);
            setEvents(events.filter(e => e.id !== id));
            setStatusMsg({ type: 'success', text: 'Événement annulé.' });
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Erreur lors de la suppression.' });
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Révoquer l'adhésion de cet étudiant ?")) return;
        try {
            await api.delete(`associations/my-association/members/${userId}`);
            setMembers(members.filter(m => m.id !== userId));
            setStatusMsg({ type: 'success', text: 'Adhérent révoqué.' });
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Erreur lors de la révocation.' });
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
            {/* Header Dashboard */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--ink)', marginBottom: '8px' }}>
                        Gestion Association
                    </h1>
                    <p style={{ color: 'var(--ink3)', fontWeight: '500' }}>
                        Pilotez vos événements, vos membres et votre trésorerie.
                    </p>
                </div>
                {activeTab === 'events' && (
                    <Link to="/create-event" className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> Nouvel Événement
                    </Link>
                )}
            </div>

            {/* Premium Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                backgroundColor: 'var(--surf3)', 
                padding: '6px', 
                borderRadius: '16px',
                marginBottom: '32px',
                maxWidth: '600px'
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
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>NOM</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>DATE</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>PARTICIPANTS</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map(e => (
                                            <tr key={e.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontWeight: '700', color: 'var(--ink)' }}>{e.title}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{e.location}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '14px', color: 'var(--ink2)' }}>
                                                    {new Date(e.date).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div className="flex items-center gap-2">
                                                        <Users size={14} className="text-secondary" />
                                                        <span style={{ fontWeight: '700' }}>{e.participant_count || 0}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div className="flex gap-3">
                                                        <Link to={`/events/${e.id}/participants`} title="Liste Inscrits"><Users size={18} className="text-ink3" /></Link>
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
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--surf2)', borderBottom: '1px solid var(--borderl)' }}>
                                        <tr style={{ textAlign: 'left' }}>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>ADHÉRENT</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>CONTACT</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>DEPUIS LE</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map(m => (
                                            <tr key={m.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontWeight: '700', color: 'var(--ink)' }}>{m.name}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '14px', color: 'var(--ink2)' }}>
                                                    {m.email}
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>
                                                    {new Date(m.joined_at).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <button onClick={() => handleRemoveMember(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}>
                                                        <UserMinus size={16} /> RÉVOQUER
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB: FINANCES */}
                        {activeTab === 'finances' && (
                            <div style={{ padding: '32px' }}>
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
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700' }}>DATE</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700' }}>UTILISATEUR</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700' }}>MOTIF</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700' }}>MONTANT</th>
                                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700' }}>STATUT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {finances.transactions.map(t => (
                                                <tr key={t.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--ink3)' }}>{new Date(t.date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600' }}>{t.user_name}</td>
                                                    <td style={{ padding: '16px', fontSize: '14px' }}>{t.event_title}</td>
                                                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--indigo)' }}>{t.amount} MRU</td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ 
                                                            fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: '800',
                                                            background: t.payment_status === 'validated' ? 'var(--teal-light)' : 'var(--surf3)',
                                                            color: t.payment_status === 'validated' ? 'var(--teal)' : 'var(--ink3)'
                                                        }}>
                                                            {t.payment_status?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ResponsablePanel;
