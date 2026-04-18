import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Calendar, MapPin, Users, Ticket, ArrowLeft, Loader2,
    AlertCircle, CheckCircle, Edit2, Trash2, UserMinus, UserPlus
} from 'lucide-react';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registrationCount, setRegistrationCount] = useState(0);
    const [isRegistered, setIsRegistered] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Edit mode state
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [editError, setEditError] = useState(null);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        setLoading(true);
        try {
            const res = await api.get(`events/detail/${id}`);
            setEvent(res.data.event);
            setRegistrationCount(res.data.registrationCount);
            setIsRegistered(res.data.isRegistered);
            setEditForm(res.data.event);
        } catch (err) {
            setError(err.response?.data?.message || "Événement introuvable.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) return navigate('/login');
        setActionLoading(true);
        try {
            await api.post(`events/register/${id}`);
            setIsRegistered(true);
            setRegistrationCount(c => c + 1);
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de l'inscription.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnregister = async () => {
        if (!window.confirm("Se désinscrire de cet événement ?")) return;
        setActionLoading(true);
        try {
            await api.delete(`events/unregister/${id}`);
            setIsRegistered(false);
            setRegistrationCount(c => c - 1);
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de la désinscription.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Annuler définitivement cet événement ? Les inscrits ne seront pas notifiés automatiquement.")) return;
        try {
            await api.delete(`events/${id}`);
            navigate('/events');
        } catch (err) {
            alert(err.response?.data?.message || "Erreur.");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError(null);
        try {
            await api.patch(`events/${id}`, editForm);
            setEditing(false);
            fetchEvent();
        } catch (err) {
            setEditError(err.response?.data?.message || "Erreur lors de la mise à jour.");
        }
    };

    const isOwner = user && (user.role === 'admin' || (user.role === 'responsable' && user.associationId === event?.association_id));
    const spotsLeft = event?.max_participants ? event.max_participants - registrationCount : null;

    if (loading) return (
        <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
            <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        </div>
    );

    if (error) return (
        <div className="container mt-4 text-center">
            <div className="card">
                <AlertCircle size={48} color="var(--color-error)" style={{ margin: '0 auto 1rem' }} />
                <p>{error}</p>
                <Link to="/events" className="btn btn-primary mt-2">Retour aux événements</Link>
            </div>
        </div>
    );

    return (
        <div className="container animate-fade-in mt-4 mb-4" style={{ maxWidth: '860px' }}>
            {/* Back + Actions */}
            <div className="flex justify-between items-center mb-4">
                <Link to="/events" className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    <ArrowLeft size={18} /> Retour
                </Link>
                {isOwner && !editing && (
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(true)} className="btn btn-secondary flex items-center gap-2">
                            <Edit2 size={16} /> Modifier
                        </button>
                        <button onClick={handleDelete} className="btn" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
                {isOwner && (
                    <Link to={`/events/${id}/participants`} className="btn btn-secondary flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                        <Users size={16} /> Voir inscrits ({registrationCount})
                    </Link>
                )}
            </div>

            {/* Edit Form */}
            {editing ? (
                <div className="card mb-4">
                    <h3 className="mb-4">Modifier l'événement</h3>
                    {editError && <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{editError}</p>}
                    <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontWeight: 600 }}>Titre</label>
                            <input type="text" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', marginTop: '0.25rem' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontWeight: 600 }}>Description</label>
                            <textarea rows="3" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'inherit', marginTop: '0.25rem' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600 }}>Début</label>
                            <input type="datetime-local" value={editForm.date ? editForm.date.slice(0, 16) : ''} onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', marginTop: '0.25rem' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600 }}>Fin</label>
                            <input type="datetime-local" value={editForm.end_date ? editForm.end_date.slice(0, 16) : ''} onChange={e => setEditForm({ ...editForm, end_date: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', marginTop: '0.25rem' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600 }}>Lieu</label>
                            <input type="text" value={editForm.location || ''} onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', marginTop: '0.25rem' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600 }}>Places max</label>
                            <input type="number" value={editForm.max_participants || ''} onChange={e => setEditForm({ ...editForm, max_participants: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', marginTop: '0.25rem' }} />
                        </div>
                        <div className="flex gap-2" style={{ gridColumn: '1 / -1' }}>
                            <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary" style={{ flex: 1 }}>Annuler</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Enregistrer les modifications</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="card">
                    {/* Header */}
                    <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {event.association_name}
                        </span>
                        <h1 style={{ fontSize: '1.8rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>{event.title}</h1>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
                                <Calendar size={20} color="var(--color-secondary)" />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                                        {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} → {new Date(event.end_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
                                <MapPin size={20} color="var(--color-error)" />
                                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
                                <Users size={20} color="var(--color-accent)" />
                                <div>
                                    <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{registrationCount}</span> inscrits
                                    {spotsLeft !== null && (
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: spotsLeft <= 5 ? 'var(--color-error)' : 'var(--color-accent)' }}>
                                            ({spotsLeft > 0 ? `${spotsLeft} places restantes` : '⚠️ Complet'})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
                                <Ticket size={20} color="var(--color-warning)" />
                                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                                    {event.is_paid ? `Payant — ${event.guest_price}MRU` : 'Gratuit'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '0.75rem' }}>À propos de cet événement</h3>
                        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>{event.description || 'Aucune description fournie.'}</p>
                    </div>

                    {/* Action Inscription */}
                    {user && !isOwner && (
                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                            {isRegistered ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                                        <CheckCircle size={20} /> Vous êtes inscrit à cet événement
                                    </div>
                                    <button onClick={handleUnregister} disabled={actionLoading} className="btn btn-secondary flex items-center gap-2" style={{ color: 'var(--color-error)' }}>
                                        <UserMinus size={16} /> {actionLoading ? '...' : 'Se désinscrire'}
                                    </button>
                                </div>
                            ) : (
                                <button onClick={handleRegister} disabled={actionLoading || spotsLeft === 0} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                                    <UserPlus size={18} style={{ marginRight: '8px' }} />
                                    {spotsLeft === 0 ? 'Événement complet' : (actionLoading ? 'Inscription...' : "S'inscrire à cet événement")}
                                </button>
                            )}
                        </div>
                    )}

                    {!user && (
                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Connectez-vous pour vous inscrire.</p>
                            <Link to="/login" className="btn btn-primary">Se connecter</Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventDetail;
