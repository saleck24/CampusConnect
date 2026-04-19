import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Building2, Users, Calendar, CheckCircle2, XCircle, 
    UserCog, ShieldCheck, Mail, AlertCircle, Trash2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setStatusMsg({ type: '', text: '' });
        try {
            if (activeTab === 'requests') {
                const res = await api.get('associations/admin/pending');
                setRequests(res.data);
            } else if (activeTab === 'users') {
                const res = await api.get('users');
                setUsers(res.data);
            } else if (activeTab === 'events') {
                // Pour l'admin, on utilise l'endpoint qui remonte tout
                const res = await api.get('events/my-events');
                setEvents(res.data);
            }
        } catch (error) {
            console.error(`Erreur chargement ${activeTab}:`, error);
            setStatusMsg({ type: 'error', text: 'Impossible de charger les données.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAssoAction = async (assoId, membershipId, requestorId, requestorEmail, actionType) => {
        let motif = '';
        if (actionType === 'refuse') {
            motif = window.prompt("Motif du refus :");
            if (motif === null) return;
        }
        try {
            await api.post(`associations/admin/handle/${assoId}`, {
                action: actionType,
                requestor_id: requestorId,
                membership_id: membershipId,
                requestor_email: requestorEmail,
                motif
            });
            setRequests(requests.filter(req => req.id !== assoId));
            setStatusMsg({ type: 'success', text: `Demande ${actionType === 'approve' ? 'validée' : 'refusée'} avec succès.` });
        } catch (error) {
            setStatusMsg({ type: 'error', text: error.response?.data?.message || 'Erreur lors de l’action.' });
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.patch(`users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setStatusMsg({ type: 'success', text: 'Rôle mis à jour.' });
        } catch (error) {
            setStatusMsg({ type: 'error', text: "Erreur lors du changement de rôle." });
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        try {
            await api.patch(`users/${userId}/status`, { is_active: newStatus });
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: newStatus } : u));
            setStatusMsg({ type: 'success', text: `Utilisateur ${newStatus ? 'activé' : 'désactivé'}.` });
        } catch (error) {
            setStatusMsg({ type: 'error', text: "Erreur statut." });
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Annuler définitivement cet événement ?")) return;
        try {
            await api.delete(`events/${id}`);
            setEvents(events.filter(e => e.id !== id));
            setStatusMsg({ type: 'success', text: 'Événement annulé.' });
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Erreur lors de la suppression.' });
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
            {/* Header section */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--ink)', marginBottom: '8px' }}>
                        Administration
                    </h1>
                    <p style={{ color: 'var(--ink3)', fontWeight: '500' }}>
                        Gérez les utilisateurs, les associations et la vie du campus.
                    </p>
                </div>
                {statusMsg.text && (
                    <div style={{ 
                        padding: '10px 20px', 
                        borderRadius: '12px', 
                        fontSize: '14px', 
                        fontWeight: '600',
                        backgroundColor: statusMsg.type === 'error' ? 'var(--rose)' : 'var(--teal)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {statusMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        {statusMsg.text}
                    </div>
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
                    { id: 'requests', label: "Demandes", icon: <Building2 size={18} /> },
                    { id: 'users', label: "Utilisateurs", icon: <Users size={18} /> },
                    { id: 'events', label: "Événements", icon: <Calendar size={18} /> }
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
            <div className="surf-container" style={{ 
                background: '#fff', 
                borderRadius: '24px', 
                border: '1px solid var(--borderl)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                        <p style={{ color: 'var(--ink3)', fontWeight: '500' }}>Chargement des données...</p>
                    </div>
                ) : (
                    <div style={{ padding: '0' }}>
                        {/* ---- TAB: REQUESTS ---- */}
                        {activeTab === 'requests' && (
                            <div style={{ padding: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>
                                    Demandes de création d'association ({requests.length})
                                </h3>
                                {requests.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink3)' }}>
                                        Aucune demande en attente pour le moment.
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        {requests.map(req => (
                                            <div key={req.id} style={{ 
                                                padding: '24px', 
                                                border: '1px solid var(--borderl)', 
                                                borderRadius: '16px',
                                                display: 'flex',
                                                justifyContent: 'between',
                                                alignItems: 'center',
                                                gap: '24px'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 style={{ margin: 0, fontWeight: '700' }}>{req.name}</h4>
                                                        <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--indigo-light)', color: 'var(--indigo)', borderRadius: '99px', fontWeight: '700' }}>EN ATTENTE</span>
                                                    </div>
                                                    <p style={{ fontSize: '14px', color: 'var(--ink3)', lineHeight: '1.5' }}>{req.description}</p>
                                                    <div className="flex items-center gap-2 mt-4" style={{ fontSize: '13px', color: 'var(--ink2)' }}>
                                                        <Mail size={14} /> {req.requestor_email}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="btn btn-primary" onClick={() => handleAssoAction(req.id, req.membership_id, req.requestor_id, req.requestor_email, 'approve')}>
                                                        Valider
                                                    </button>
                                                    <button className="btn btn-secondary" style={{ color: 'var(--rose)' }} onClick={() => handleAssoAction(req.id, req.membership_id, req.requestor_id, req.requestor_email, 'refuse')}>
                                                        Refuser
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ---- TAB: USERS ---- */}
                        {activeTab === 'users' && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', background: 'var(--surf2)', borderBottom: '1px solid var(--borderl)' }}>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>UTILISATEUR</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>RÔLE</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>STATUT</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>INSCRIPTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid var(--borderl)', transition: '0.2s' }}>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div className="flex items-center gap-3">
                                                        <div style={{ 
                                                            width: '40px', height: '40px', borderRadius: '12px', 
                                                            background: 'var(--surf3)', display: 'flex', 
                                                            alignItems: 'center', justifyContent: 'center',
                                                            color: 'var(--indigo)', fontWeight: '700'
                                                        }}>
                                                            {u.name.substring(0,2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '14px' }}>{u.name}</div>
                                                            <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <select 
                                                        value={u.role} 
                                                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                        style={{ 
                                                            padding: '8px 12px', borderRadius: '10px', 
                                                            border: '1px solid var(--borderl)', 
                                                            fontSize: '13px', fontWeight: '600',
                                                            background: 'var(--surf2)', color: 'var(--ink)'
                                                        }}
                                                    >
                                                        <option value="invite">Invité</option>
                                                        <option value="etudiant">Étudiant</option>
                                                        <option value="responsable">Responsable</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <button 
                                                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                                                        style={{ 
                                                            padding: '6px 14px', borderRadius: '20px', 
                                                            border: 'none', fontSize: '12px', fontWeight: '700',
                                                            cursor: 'pointer',
                                                            backgroundColor: u.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                                            color: u.is_active ? 'var(--teal)' : 'var(--rose)'
                                                        }}
                                                    >
                                                        {u.is_active ? 'ACTIF' : 'SUSPENDU'}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ---- TAB: EVENTS ---- */}
                        {activeTab === 'events' && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', background: 'var(--surf2)', borderBottom: '1px solid var(--borderl)' }}>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>ÉVÉNEMENT</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>ASSO</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>DATE</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>INSCRITS</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map(evt => (
                                            <tr key={evt.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{evt.title}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{evt.location}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '13px', fontWeight: '600', color: 'var(--indigo)' }}>
                                                    {evt.association_name}
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>
                                                    {new Date(evt.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink2)' }}>
                                                        {evt.participant_count} / {evt.max_participants || '∞'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div className="flex gap-2">
                                                        <Link to={`/events/${evt.id}/participants`} title="Voir participants" style={{ color: 'var(--ink3)' }}>
                                                            <Users size={18} />
                                                        </Link>
                                                        <button onClick={() => handleDeleteEvent(evt.id)} style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer' }} title="Annuler">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
