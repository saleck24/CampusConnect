import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Users, ArrowLeft, Mail, Calendar, Loader2, Download, Printer } from 'lucide-react';

const EventParticipants = () => {
    const { id } = useParams();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await api.get(`events/${id}/participants`);
                setParticipants(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Erreur lors du chargement de la liste.");
            } finally {
                setLoading(false);
            }
        };
        fetchParticipants();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4 text-center">
                <div className="card" style={{ color: 'var(--color-error)' }}>
                    {error}
                    <div className="mt-2">
                        <Link to="/events" className="btn btn-primary">Retour aux événements</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in mt-4 mb-4">
            <div className="flex justify-between items-center mb-4 hide-on-print">
                <Link to="/events" className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    <ArrowLeft size={18} /> Retour
                </Link>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2">
                        <Printer size={18} /> Imprimer la liste
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-6" style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
                    <h2 className="flex items-center gap-3" style={{ color: 'var(--color-primary)' }}>
                        <Users size={32} /> Liste des Inscrits ({participants.length})
                    </h2>
                </div>

                {participants.length === 0 ? (
                    <div className="text-center py-8">
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Aucun participant inscrit pour le moment.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--color-border)' }}>
                                    <th style={{ padding: '1rem' }}>Nom / Prénom</th>
                                    <th style={{ padding: '1rem' }}>E-mail</th>
                                    <th style={{ padding: '1rem' }}>Date d'inscription</th>
                                    <th style={{ padding: '1rem' }}>Statut Paiement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{p.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <a href={`mailto:${p.email}`} className="flex items-center gap-2" style={{ color: 'var(--color-secondary)' }}>
                                                <Mail size={14} /> {p.email}
                                            </a>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
                                            {new Date(p.registered_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                fontSize: '0.8rem', 
                                                padding: '0.2rem 0.6rem', 
                                                borderRadius: '12px',
                                                backgroundColor: p.price_applied > 0 ? '#FEF3C7' : '#DCFCE7',
                                                color: p.price_applied > 0 ? '#92400E' : '#166534',
                                                fontWeight: 600
                                            }}>
                                                {p.price_applied > 0 ? `Payé (${p.price_applied}MRU)` : 'Gratuit'}
                                            </span>
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
                    .card { box-shadow: none; border: none; }
                }
            `}</style>
        </div>
    );
};

export default EventParticipants;
