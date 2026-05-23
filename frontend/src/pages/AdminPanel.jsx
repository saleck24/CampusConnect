import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Building2, Users, Calendar, CheckCircle2, XCircle, 
    UserCog, ShieldCheck, Mail, AlertCircle, Trash2, Wallet, Edit3, Plus, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [finances, setFinances] = useState(null);
    const [sponsors, setSponsors] = useState([]);
    const [associations, setAssociations] = useState([]);
    const [sponsorForm, setSponsorForm] = useState(null); // null, or { name: '', website_url: '', ... }
    const [logoFile, setLogoFile] = useState(null);
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
                const res = await api.get('events/my-events');
                setEvents(res.data);
            } else if (activeTab === 'finances') {
                const res = await api.get('stats/admin/finances');
                setFinances(res.data);
            } else if (activeTab === 'sponsors') {
                const res = await api.get('sponsors');
                setSponsors(res.data);
            } else if (activeTab === 'subscriptions') {
                const res = await api.get('associations');
                setAssociations(res.data);
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

    const handleUpgradeAsso = async (id) => {
        if (!window.confirm("Confirmer la mise à niveau de cette association vers le Plan Premium pour 30 jours ?")) return;
        try {
            const res = await api.post(`associations/admin/upgrade/${id}`);
            setStatusMsg({ type: 'success', text: res.data.message });
            // Recharger les associations
            const associationsRes = await api.get('associations');
            setAssociations(associationsRes.data);
        } catch (error) {
            setStatusMsg({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à niveau.' });
        }
    };

    const handleSaveSponsor = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', sponsorForm.name || '');
        data.append('website_url', sponsorForm.website_url || '');
        data.append('amount_paid', sponsorForm.amount_paid || 5000);
        data.append('start_date', sponsorForm.start_date || '');
        data.append('end_date', sponsorForm.end_date || '');
        data.append('is_active', sponsorForm.is_active === undefined ? true : sponsorForm.is_active);
        if (logoFile) {
            data.append('logo', logoFile);
        }

        try {
            if (sponsorForm.id) {
                // Update
                await api.put(`sponsors/${sponsorForm.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setStatusMsg({ type: 'success', text: 'Sponsor mis à jour avec succès.' });
            } else {
                // Create
                await api.post('sponsors', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setStatusMsg({ type: 'success', text: 'Sponsor créé avec succès.' });
            }
            setSponsorForm(null);
            setLogoFile(null);
            // Recharger les sponsors
            const res = await api.get('sponsors');
            setSponsors(res.data);
        } catch (error) {
            setStatusMsg({ type: 'error', text: error.response?.data?.message || 'Erreur lors de l’enregistrement.' });
        }
    };

    const handleDeleteSponsor = async (id) => {
        if (!window.confirm("Supprimer définitivement ce sponsor ?")) return;
        try {
            await api.delete(`sponsors/${id}`);
            setSponsors(sponsors.filter(s => s.id !== id));
            setStatusMsg({ type: 'success', text: 'Sponsor supprimé.' });
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
                maxWidth: '850px'
            }}>
                {[
                    { id: 'requests', label: "Demandes", icon: <Building2 size={18} /> },
                    { id: 'users', label: "Utilisateurs", icon: <Users size={18} /> },
                    { id: 'events', label: "Événements", icon: <Calendar size={18} /> },
                    { id: 'finances', label: "Trésorerie", icon: <Wallet size={18} /> },
                    { id: 'sponsors', label: "Sponsors", icon: <Building2 size={18} /> },
                    { id: 'subscriptions', label: "Abonnements", icon: <ShieldCheck size={18} /> }
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
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>UTILISATEUR</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>RÔLE</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>STATUT</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>INSCRIPTION</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid var(--borderl)', transition: '0.2s' }}>
                                                <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
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
                                                <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
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
                                                        <option value="etudiant">Étudiant</option>
                                                        <option value="responsable">Responsable</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                                    <span 
                                                        style={{ 
                                                            display: 'inline-block',
                                                            padding: '6px 14px', borderRadius: '20px', 
                                                            fontSize: '12px', fontWeight: '700',
                                                            backgroundColor: u.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                                            color: u.is_active ? 'var(--teal)' : 'var(--rose)'
                                                        }}
                                                    >
                                                        {u.is_active ? 'ACTIF' : 'SUSPENDU'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <button
                                                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                                                        className="btn btn-warning"
                                                        style={{ 
                                                            padding: '6px 12px', 
                                                            fontSize: '12px', 
                                                            fontWeight: '700',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        <Edit3 size={12} /> Modifier
                                                    </button>
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
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>ÉVÉNEMENT</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>ASSO</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>DATE</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>INSCRITS</th>
                                            <th style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map(evt => (
                                            <tr key={evt.id} style={{ borderBottom: '1px solid var(--borderl)' }}>
                                                <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{evt.title}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{evt.location}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '13px', fontWeight: '600', color: 'var(--indigo)', borderRight: '1px solid var(--borderl)' }}>
                                                    {evt.association_name}
                                                </td>
                                                <td style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>
                                                    {new Date(evt.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                </td>
                                                <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink2)' }}>
                                                        {evt.participant_count} / {evt.max_participants || '∞'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div className="flex gap-2">
                                                        <Link to={`/events/${evt.id}/participants`} title="Voir participants" style={{ color: 'var(--amber)' }}>
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

                        {/* ---- TAB: FINANCES ---- */}
                        {activeTab === 'finances' && finances && (
                            <div style={{ padding: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                                    <div style={{ background: 'var(--indigo)', padding: '32px', borderRadius: '20px', color: '#fff', boxShadow: '0 12px 24px rgba(79, 70, 229, 0.2)' }}>
                                        <p style={{ opacity: 0.8, fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Commissions Dues (Plateforme)</p>
                                        <h2 style={{ fontSize: '36px', fontWeight: '800' }}>{Number(finances.totalPlatformCommissions).toLocaleString()} MRU</h2>
                                    </div>
                                    <div style={{ background: 'var(--surf2)', border: '1px solid var(--borderl)', padding: '32px', borderRadius: '20px', color: 'var(--ink)', boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)' }}>
                                        <p style={{ color: 'var(--ink3)', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>CA Global (Toutes Associations)</p>
                                        <h2 style={{ fontSize: '36px', fontWeight: '800' }}>{Number(finances.totalAssociationsRevenue).toLocaleString()} MRU</h2>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Détail par Association</h3>
                                <div style={{ border: '1px solid var(--borderl)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surf3)' }}>
                                            <tr style={{ textAlign: 'left' }}>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>ASSOCIATION</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>PLAN</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>REVENU GÉNÉRÉ</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--indigo)', fontWeight: '800' }}>COMMISSION DUE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {finances.associations.map(asso => (
                                                <tr key={asso.id} style={{ borderBottom: '1px solid var(--borderl)', background: '#fff', transition: '0.2s' }}>
                                                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>{asso.name}</td>
                                                    <td style={{ padding: '16px 24px', borderRight: '1px solid var(--borderl)' }}>
                                                        <span style={{ 
                                                            fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: '800',
                                                            background: asso.plan === 'premium' ? 'var(--indigo-light)' : 'var(--surf3)',
                                                            color: asso.plan === 'premium' ? 'var(--indigo)' : 'var(--ink3)'
                                                        }}>
                                                            {asso.plan?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', borderRight: '1px solid var(--borderl)' }}>{Number(asso.total_revenue).toLocaleString()} MRU</td>
                                                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '800', color: 'var(--indigo)' }}>{Number(asso.total_commission).toLocaleString()} MRU</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* ---- TAB: SPONSORS ---- */}
                        {activeTab === 'sponsors' && (
                            <div style={{ padding: '32px' }}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Gestion des Sponsors Corporatifs</h3>
                                    {!sponsorForm && (
                                        <button 
                                            onClick={() => setSponsorForm({ name: '', website_url: '', amount_paid: 5000, start_date: '', end_date: '', is_active: true })}
                                            className="btn btn-primary flex items-center gap-2"
                                            style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}
                                        >
                                            <Plus size={16} /> Ajouter un sponsor
                                        </button>
                                    )}
                                </div>

                                {sponsorForm ? (
                                    <div style={{ background: 'var(--surf2)', padding: '28px', borderRadius: '20px', border: '1px solid var(--borderl)', marginBottom: '32px' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>
                                            {sponsorForm.id ? "Modifier le sponsor" : "Ajouter un nouveau sponsor (5 000 MRU / mois)"}
                                        </h4>
                                        <form onSubmit={handleSaveSponsor} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--ink2)', marginBottom: '6px' }}>Nom de l'entreprise *</label>
                                                    <input 
                                                        type="text" 
                                                        value={sponsorForm.name || ''} 
                                                        onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                                                        required
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--ink2)', marginBottom: '6px' }}>Site web (URL)</label>
                                                    <input 
                                                        type="url" 
                                                        value={sponsorForm.website_url || ''} 
                                                        onChange={(e) => setSponsorForm({ ...sponsorForm, website_url: e.target.value })}
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600' }}
                                                        placeholder="https://example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--ink2)', marginBottom: '6px' }}>Montant payé (MRU) *</label>
                                                    <input 
                                                        type="number" 
                                                        value={sponsorForm.amount_paid || 5000} 
                                                        onChange={(e) => setSponsorForm({ ...sponsorForm, amount_paid: parseFloat(e.target.value) })}
                                                        required
                                                        min="0"
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--ink2)', marginBottom: '6px' }}>Logo corporatif</label>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => setLogoFile(e.target.files[0])}
                                                        style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', background: '#fff' }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--ink2)', marginBottom: '6px' }}>Date de début *</label>
                                                    <input 
                                                        type="date" 
                                                        value={sponsorForm.start_date ? sponsorForm.start_date.substring(0, 10) : ''} 
                                                        onChange={(e) => setSponsorForm({ ...sponsorForm, start_date: e.target.value })}
                                                        required
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--ink2)', marginBottom: '6px' }}>Date de fin *</label>
                                                    <input 
                                                        type="date" 
                                                        value={sponsorForm.end_date ? sponsorForm.end_date.substring(0, 10) : ''} 
                                                        onChange={(e) => setSponsorForm({ ...sponsorForm, end_date: e.target.value })}
                                                        required
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--ink2)', marginBottom: '6px' }}>Statut</label>
                                                    <select
                                                        value={sponsorForm.is_active === undefined ? 1 : (sponsorForm.is_active ? 1 : 0)}
                                                        onChange={(e) => setSponsorForm({ ...sponsorForm, is_active: e.target.value === '1' })}
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--borderl)', fontSize: '14px', fontWeight: '600' }}
                                                    >
                                                        <option value="1">Actif</option>
                                                        <option value="0">Inactif</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 justify-end mt-4">
                                                <button 
                                                    type="button" 
                                                    onClick={() => { setSponsorForm(null); setLogoFile(null); }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700' }}
                                                >
                                                    Annuler
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary"
                                                    style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700' }}
                                                >
                                                    Enregistrer
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : null}

                                <div style={{ border: '1px solid var(--borderl)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surf3)' }}>
                                            <tr style={{ textAlign: 'left' }}>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>ENTREPRISE</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>MONTANT TOTAL</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>PÉRIODE</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>STATUT</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700' }}>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sponsors.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink3)' }}>Aucun sponsor enregistré.</td>
                                                </tr>
                                            ) : (
                                                sponsors.map(s => (
                                                    <tr key={s.id} style={{ borderBottom: '1px solid var(--borderl)', background: '#fff' }}>
                                                        <td style={{ padding: '16px 24px', borderRight: '1px solid var(--borderl)' }}>
                                                            <div className="flex items-center gap-3">
                                                                {s.logo_url ? (
                                                                    <img src={`${api.defaults.baseURL.replace('/api', '')}${s.logo_url}`} alt={s.name} style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid var(--borderl)', borderRadius: '8px', padding: '2px', background: '#fff' }} />
                                                                ) : (
                                                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--surf3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--indigo)' }}>{s.name.slice(0, 2).toUpperCase()}</div>
                                                                )}
                                                                <div>
                                                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.name}</div>
                                                                    {s.website_url && (
                                                                        <a href={s.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--indigo)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                                                                            Voir site <ExternalLink size={12} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', color: 'var(--indigo)', borderRight: '1px solid var(--borderl)' }}>
                                                            {Number(s.amount_paid).toLocaleString()} MRU
                                                        </td>
                                                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink2)', borderRight: '1px solid var(--borderl)' }}>
                                                            Du {new Date(s.start_date).toLocaleDateString()} au {new Date(s.end_date).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ padding: '16px 24px', borderRight: '1px solid var(--borderl)' }}>
                                                            <span style={{ 
                                                                fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: '800',
                                                                background: s.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                                                color: s.is_active ? 'var(--teal)' : 'var(--rose)'
                                                            }}>
                                                                {s.is_active ? 'ACTIF' : 'INACTIF'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div className="flex gap-3">
                                                                <button 
                                                                    onClick={() => setSponsorForm(s)} 
                                                                    className="btn-ghost" 
                                                                    style={{ color: 'var(--indigo)', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }} 
                                                                    title="Modifier"
                                                                >
                                                                    <Edit3 size={16} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteSponsor(s.id)} 
                                                                    className="btn-ghost" 
                                                                    style={{ color: 'var(--rose)', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }} 
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ---- TAB: SUBSCRIPTIONS ---- */}
                        {activeTab === 'subscriptions' && (
                            <div style={{ padding: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>
                                    Gestion des Abonnements Premium
                                </h3>
                                <p style={{ fontSize: '14px', color: 'var(--ink3)', marginBottom: '24px', lineHeight: 1.6 }}>
                                    Les associations Premium paient <b>500 MRU / mois</b> pour accéder aux fonctionnalités avancées (événements payants, trésorerie complète, etc.).
                                    En tant qu'administrateur, vous pouvez valider le paiement mensuel d'une association pour activer ou prolonger son mode Premium de <b>30 jours</b> supplémentaires.
                                </p>

                                <div style={{ border: '1px solid var(--borderl)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surf3)' }}>
                                            <tr style={{ textAlign: 'left' }}>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>ASSOCIATION</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>PLAN ACTUEL</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700', borderRight: '1px solid var(--borderl)' }}>VALABLE JUSQU'AU</th>
                                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink3)', fontWeight: '700' }}>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {associations.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink3)' }}>Aucune association enregistrée.</td>
                                                </tr>
                                            ) : (
                                                associations.map(asso => {
                                                    const expires = asso.premium_until ? new Date(asso.premium_until) : null;
                                                    const isExpired = expires ? expires < new Date() : true;
                                                    const hasPremium = asso.plan === 'premium' && !isExpired;

                                                    return (
                                                        <tr key={asso.id} style={{ borderBottom: '1px solid var(--borderl)', background: '#fff' }}>
                                                            <td style={{ padding: '16px 24px', borderRight: '1px solid var(--borderl)' }}>
                                                                <div className="flex items-center gap-3">
                                                                    {asso.logo_url ? (
                                                                        <img src={`${api.defaults.baseURL.replace('/api', '')}${asso.logo_url}`} alt={asso.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--borderl)' }} />
                                                                    ) : (
                                                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--surf3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--indigo)' }}>{asso.name.slice(0, 2).toUpperCase()}</div>
                                                                    )}
                                                                    <div>
                                                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{asso.name}</div>
                                                                        <div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Créée le {new Date(asso.created_at).toLocaleDateString()}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px 24px', borderRight: '1px solid var(--borderl)' }}>
                                                                <span style={{ 
                                                                    fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: '800',
                                                                    background: hasPremium ? 'var(--indigo-light)' : 'var(--surf3)',
                                                                    color: hasPremium ? 'var(--indigo)' : 'var(--ink3)'
                                                                }}>
                                                                    {hasPremium ? 'PREMIUM (ACTIF)' : 'GRATUIT (FREE)'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--ink2)', borderRight: '1px solid var(--borderl)' }}>
                                                                {asso.premium_until ? (
                                                                    <span style={{ color: isExpired ? 'var(--rose)' : 'var(--teal)', fontWeight: '600' }}>
                                                                        {expires.toLocaleDateString()} {isExpired ? '(Expiré)' : ''}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: 'var(--ink3)' }}>—</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '16px 24px' }}>
                                                                <button
                                                                    onClick={() => handleUpgradeAsso(asso.id)}
                                                                    className="btn btn-primary"
                                                                    style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                                >
                                                                    <ShieldCheck size={14} /> {hasPremium ? 'Renouveler (+30j)' : 'Activer Premium'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
