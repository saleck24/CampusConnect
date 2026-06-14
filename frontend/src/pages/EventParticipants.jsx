import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, ArrowLeft, Mail, Calendar, Printer, ShieldCheck, CreditCard, Phone, AlertCircle, Eye, CheckCircle } from 'lucide-react';

const EventParticipants = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [participants, setParticipants] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validatingId, setValidatingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ visible: false, registrationId: null });

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

    const handleValidatePayment = (registrationId) => {
        setConfirmModal({ visible: true, registrationId });
    };

    const confirmValidation = async () => {
        const registrationId = confirmModal.registrationId;
        setConfirmModal({ visible: false, registrationId: null });
        setValidatingId(registrationId);
        try {
            await api.put(`registrations/${registrationId}/validate`);
            // Mettre à jour le statut localement
            setParticipants(prev => prev.map(p =>
                p.registration_id === registrationId
                    ? { ...p, payment_status: 'PAYE' }
                    : p
            ));
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de la validation.");
        } finally {
            setValidatingId(null);
        }
    };

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
            <div className="hide-on-print" style={{ marginBottom: '32px' }}>
                <Link to={user?.role === 'admin' ? '/admin' : '/responsable-panel'} className="flex items-center gap-2 mb-4" style={{ color: 'var(--ink3)', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
                    <ArrowLeft size={16} /> {user?.role === 'admin' ? "Retour à l'administration" : "Retour à ma page asso"}
                </Link>
                
                <div className="flex justify-between" style={{ alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--ink)', marginBottom: '8px' }}>
                            Liste des Inscrits
                        </h1>
                        <p style={{ color: 'var(--indigo)', fontWeight: '700', fontSize: '18px', margin: 0 }}>
                            {event?.title || 'Chargement...'}
                        </p>
                    </div>
                    <button onClick={handlePrint} className="btn btn-primary flex items-center gap-2" style={{ padding: '6px 12px', fontSize: '12px', height: 'fit-content' }}>
                        <Printer size={14} /> Imprimer la liste
                    </button>
                </div>
            </div>

            <div className="surf-container" style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--borderl)' }}>
                <div style={{ padding: '24px 32px', background: 'var(--surf2)', borderBottom: '1px solid var(--borderl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex items-center gap-3">
                        <Users size={20} style={{ color: 'var(--amber)' }} />
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
                                    <th style={{ padding: '20px 32px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '700', textTransform: 'uppercase', borderRight: '1px solid var(--borderl)' }}>Participant</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '700', textTransform: 'uppercase', borderRight: '1px solid var(--borderl)' }}>Contact</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '700', textTransform: 'uppercase', borderRight: '1px solid var(--borderl)' }}>Date Inscription</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '700', textTransform: 'uppercase', borderRight: '1px solid var(--borderl)' }}>Paiement</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--borderl)', transition: '0.2s' }}>
                                        <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '15px' }}>{p.name}</div>
                                        </td>
                                        <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div className="flex items-center gap-2" style={{ fontSize: '14px', color: 'var(--ink2)' }}>
                                                    <Mail size={14} className="text-indigo" /> {p.email}
                                                </div>
                                                {p.phone && (
                                                    <div className="flex items-center gap-2" style={{ fontSize: '13px', color: 'var(--ink3)' }}>
                                                        <Phone size={13} className="text-indigo" /> {p.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px', fontSize: '13px', color: 'var(--ink3)', borderRight: '1px solid var(--borderl)' }}>
                                            {new Date(p.registered_at).toLocaleDateString()} {new Date(p.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '20px 32px', borderRight: '1px solid var(--borderl)' }}>
                                            {p.payment_status === 'GRATUIT' || p.price_applied === 0 ? (
                                                <div style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '6px',
                                                    padding: '6px 12px', 
                                                    borderRadius: '99px',
                                                    fontSize: '11px',
                                                    fontWeight: '800',
                                                    backgroundColor: '#D1FAE5',
                                                    color: '#059669'
                                                }}>
                                                    <ShieldCheck size={12} /> GRATUIT
                                                </div>
                                            ) : p.payment_status === 'PAYE' ? (
                                                <div style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '6px',
                                                    padding: '6px 12px', 
                                                    borderRadius: '99px',
                                                    fontSize: '11px',
                                                    fontWeight: '800',
                                                    backgroundColor: '#D1FAE5',
                                                    color: '#059669'
                                                }}>
                                                    <CreditCard size={12} /> PAYÉ ({p.price_applied} MRU)
                                                </div>
                                            ) : (
                                                <div style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '6px',
                                                    padding: '6px 12px', 
                                                    borderRadius: '99px',
                                                    fontSize: '11px',
                                                    fontWeight: '800',
                                                    backgroundColor: '#FEF3C7',
                                                    color: '#D97706'
                                                }}>
                                                    <AlertCircle size={12} /> EN ATTENTE ({p.price_applied} MRU)
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {p.payment_proof_url && (
                                                    <a
                                                        href={`http://localhost:5000${p.payment_proof_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            padding: '5px 10px',
                                                            borderRadius: '6px',
                                                            background: '#EFF6FF',
                                                            color: '#2563EB',
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        <Eye size={12} /> Voir le reçu
                                                    </a>
                                                )}
                                                {p.payment_status === 'EN_ATTENTE' && (
                                                    <button
                                                        onClick={() => handleValidatePayment(p.registration_id)}
                                                        disabled={validatingId === p.registration_id}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '8px 14px',
                                                            borderRadius: '8px',
                                                            background: 'linear-gradient(135deg, #10B981, #059669)',
                                                            color: '#fff',
                                                            fontSize: '12px',
                                                            fontWeight: '800',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                    >
                                                        <CheckCircle size={14} /> {validatingId === p.registration_id ? 'Validation...' : 'Valider le paiement'}
                                                    </button>
                                                )}
                                                {(p.payment_status === 'GRATUIT' || !p.payment_proof_url) && p.payment_status !== 'EN_ATTENTE' && (
                                                    <span style={{ fontSize: '12px', color: 'var(--ink3)' }}>—</span>
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

            {confirmModal.visible && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="animate-fade-in" style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', color: 'var(--ink)' }}>Confirmer le paiement</h3>
                        <p style={{ color: 'var(--ink3)', marginBottom: '32px', lineHeight: 1.6, fontSize: '15px' }}>
                            Êtes-vous sûr de vouloir valider le paiement pour ce participant ? Cette action est définitive.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setConfirmModal({ visible: false, registrationId: null })}
                                style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: '700' }}
                            >
                                Annuler
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={confirmValidation}
                                style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: '700', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none' }}
                            >
                                Oui, valider
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
