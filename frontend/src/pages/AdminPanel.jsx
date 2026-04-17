import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Building2, User, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'requests') fetchRequests();
        else if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'events') fetchEvents();
    }, [activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('associations/admin/pending');
            setRequests(response.data);
        } catch (error) {
            console.error("Erreur requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('users');
            setUsers(response.data);
        } catch (error) {
            console.error("Erreur users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('events/my-events');
            setEvents(response.data);
        } catch (error) {
            console.error("Erreur events:", error);
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
                action: actionType, requestor_id: requestorId,
                membership_id: membershipId, requestor_email: requestorEmail, motif
            });
            setRequests(requests.filter(req => req.id !== assoId));
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.patch(`users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            alert("Erreur lors du changement de rôle");
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            await api.patch(`users/${userId}/status`, { is_active: newStatus });
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: newStatus } : u));
        } catch (error) {
            alert("Erreur lors du changement de statut");
        }
    };

    return (
        <div className="container animate-fade-in mt-4 mb-4">
            <h2 className="mb-4" style={{ color: 'var(--color-primary)' }}>Panel Administration</h2>

            {/* Onglets */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => setActiveTab('requests')} className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
                    <Building2 size={18} style={{ marginRight: '8px' }} /> Demandes d'Asso
                </button>
                <button onClick={() => setActiveTab('users')} className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
                    <Users size={18} style={{ marginRight: '8px' }} /> Utilisateurs
                </button>
                <button onClick={() => setActiveTab('events')} className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
                    <Calendar size={18} style={{ marginRight: '8px' }} /> Événements
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <p className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>
                ) : (
                    <>
                        {/* ---- ONGLET DEMANDES ---- */}
                        {activeTab === 'requests' && (
                            <>
                                <h3 className="mb-4" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                                    Demandes en attente ({requests.length})
                                </h3>
                                {requests.length === 0 ? (
                                    <p style={{ color: 'var(--color-text-muted)' }}>Aucune demande en attente.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {requests.map((req) => (
                                            <div key={req.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: '#FAFAFA' }}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 style={{ margin: 0 }}>{req.name}</h4>
                                                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', backgroundColor: '#FEF08A', color: '#854D0E', borderRadius: '12px' }}>En attente</span>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{req.description}</p>
                                                <div className="flex gap-2">
                                                    <button className="btn" style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '0.4rem 0.8rem' }}
                                                        onClick={() => handleAssoAction(req.id, req.membership_id, req.requestor_id, req.requestor_email, 'approve')}>
                                                        Valider
                                                    </button>
                                                    <button className="btn btn-secondary" style={{ color: 'var(--color-error)', padding: '0.4rem 0.8rem' }}
                                                        onClick={() => handleAssoAction(req.id, req.membership_id, req.requestor_id, req.requestor_email, 'refuse')}>
                                                        Refuser
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ---- ONGLET UTILISATEURS ---- */}
                        {activeTab === 'users' && (
                            <>
                                <h3 className="mb-4" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                                    Utilisateurs ({users.length})
                                </h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                                                <th style={{ padding: '1rem' }}>Nom</th>
                                                <th style={{ padding: '1rem' }}>Email</th>
                                                <th style={{ padding: '1rem' }}>Rôle</th>
                                                <th style={{ padding: '1rem' }}>Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div className="flex items-center gap-2">
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <User size={16} color="var(--color-text-muted)" />
                                                            </div>
                                                            {u.name}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{u.email}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <select value={u.role} onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                            style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                                            <option value="invite">Invité</option>
                                                            <option value="etudiant">Étudiant</option>
                                                            <option value="responsable">Responsable</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <button onClick={() => handleToggleStatus(u.id, u.is_active)} className="btn"
                                                            style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', backgroundColor: u.is_active ? '#DCFCE7' : '#FEE2E2', color: u.is_active ? '#166534' : '#991B1B', border: 'none' }}>
                                                            {u.is_active ? 'Actif' : 'Inactif'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* ---- ONGLET ÉVÉNEMENTS ---- */}
                        {activeTab === 'events' && (
                            <>
                                <h3 className="mb-4" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                                    Tous les Événements ({events.length})
                                </h3>
                                {events.length === 0 ? (
                                    <p style={{ color: 'var(--color-text-muted)' }}>Aucun événement enregistré.</p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--color-border)' }}>
                                                    <th style={{ padding: '1rem' }}>Événement</th>
                                                    <th style={{ padding: '1rem' }}>Association</th>
                                                    <th style={{ padding: '1rem' }}>Date</th>
                                                    <th style={{ padding: '1rem' }}>Lieu</th>
                                                    <th style={{ padding: '1rem', textAlign: 'center' }}>Inscrits</th>
                                                    <th style={{ padding: '1rem' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {events.map(evt => (
                                                    <tr key={evt.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{evt.title}</td>
                                                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--color-primary)' }}>{evt.association_name}</td>
                                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                            {new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{evt.location}</td>
                                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.6rem', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700 }}>
                                                                <Users size={14} /> {evt.participant_count}{evt.max_participants ? ` / ${evt.max_participants}` : ''}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1rem' }}>
                                                            <Link to={`/events/${evt.id}/participants`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                                                                Voir inscrits
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
