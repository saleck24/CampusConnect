import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, ArrowLeft, Mail, Calendar, Printer, ShieldCheck, CreditCard } from 'lucide-react';

const EventParticipants = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [participants, setParticipants] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Charger les détails de l'événement pour le titre
                const eventRes = await api.get(`events/detail/${id}`);
                setEvent(eventRes.data.event);

                // Charger les participants
                const response = await api.get(`events/${id}/participants`);
                setParticipants(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Erreur lors du chargement de la liste.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-10 text-center">
                <div className="surf-container" style={{ color: 'var(--rose)', padding: '40px' }}>
                    <p style={{ fontWeight: '700', fontSize: '18px' }}>{error}</p>
                    <Link to="/admin" className="btn btn-primary mt-4">Retour au panel</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
            <div className="flex justify-between items-end mb-20 hide-on-print">
                <div>
                    <Link to={user?.role === 'admin' ? '/admin' : '/responsable-panel'} className="flex items-center gap-2 mb-4" style={{ color: 'var(--ink3)', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
                        <ArrowLeft size={16} /> {user?.role === 'admin' ? "Retour à l'administration" : "Retour à ma page asso"}
                    </Link>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--ink)', marginBottom: '8px' }}>
                        Liste des Inscrits
                    </h1>
                    <p style={{ color: 'var(--indigo)', fontWeight: '700', fontSize: '18px' }}>
                        {event?.title || 'Chargement...'}
                    </p>
                </div>
                <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    <Printer size={16} /> Imprimer la liste
                </button>
            </div>

            <div className="surf-container" style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--borderl)' }}>
                <div style={{ padding: '24px 32px', background: 'var(--surf2)', borderBottom: '1px solid var(--borderl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex items-center gap-3">
                        <Users size={20} className="text-indigo" />
                        <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--ink)' }}>Total Participants : {participants.length}</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ fontSize: '13px', color: 'var(--ink3)' }}>
                        <Calendar size={14} /> {event ? new Date(event.date).toLocaleDateString() : ''}
                    </div>
                </div>

                {participants.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--ink3)' }}>
                        Aucun participant inscrit pour cet événement.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--borderl)' }}>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '700', textTransform: 'uppercase' }}>Participant</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '700', textTransform: 'uppercase' }}>Contact</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '700', textTransform: 'uppercase' }}>Date Inscription</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '700', textTransform: 'uppercase' }}>Paiement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--borderl)', transition: '0.2s' }}>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '15px' }}>{p.name}</div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div className="flex items-center gap-2" style={{ fontSize: '14px', color: 'var(--ink2)' }}>
                                                <Mail size={14} className="text-indigo" /> {p.email}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)' }}>
                                            {new Date(p.registered_at).toLocaleDateString()} {new Date(p.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '6px',
                                                padding: '6px 12px', 
                                                borderRadius: '99px',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                backgroundColor: p.price_applied > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: p.price_applied > 0 ? '#B45309' : 'var(--teal)'
                                            }}>
                                                {p.price_applied > 0 ? (
                                                    <><CreditCard size={12} /> PAYÉ ({p.price_applied} €)</>
                                                ) : (
                                                    <><ShieldCheck size={12} /> GRATUIT</>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    .hide-on-print { display: none !important; }
                    .page-wrapper { min-height: auto; }
                    .main-content { padding: 0; }
                    .surf-container { border: none !important; box-shadow: none !important; }
                    header, footer { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default EventParticipants;
