import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Check, X, Building2, User } from 'lucide-react';

const AdminPanel = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // id of current action

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('associations/admin/pending');
            setRequests(response.data);
        } catch (error) {
            console.error("Erreur de récupération :", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (assoId, membershipId, requestorId, requestorEmail, actionType) => {
        setActionLoading(assoId);
        let motif = '';
        
        if (actionType === 'refuse') {
            motif = window.prompt("Motif du refus (sera envoyé par email) :");
            if (motif === null) {
                setActionLoading(null);
                return; // User cancelled prompt
            }
        }

        try {
            await api.post(`associations/admin/handle/${assoId}`, {
                action: actionType,
                requestor_id: requestorId,
                membership_id: membershipId,
                requestor_email: requestorEmail,
                motif: motif
            });
            // Remove from list
            setRequests(requests.filter(req => req.id !== assoId));
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors du traitement');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="container mt-4 text-center">Chargement des demandes...</div>;
    }

    return (
        <div className="container animate-fade-in mt-4">
            <h2 className="mb-4" style={{ color: 'var(--color-primary)' }}>Panel Administration</h2>
            
            <div className="card">
                <h3 className="mb-4" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                    Demandes d'Associations ({requests.length})
                </h3>

                {requests.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>Aucune demande en attente de validation.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {requests.map((req) => (
                            <div key={req.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: '#FAFAFA' }}>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="flex items-center gap-2" style={{ margin: 0, color: 'var(--color-text-main)' }}>
                                        <Building2 size={18} color="var(--color-primary)" />
                                        {req.name}
                                    </h4>
                                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', backgroundColor: '#FEF08A', color: '#854D0E', borderRadius: '12px', fontWeight: 600 }}>En attente</span>
                                </div>
                                
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{req.description}</p>
                                
                                <div className="flex items-center gap-2 mb-4" style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                                    <User size={14} color="var(--color-secondary)" />
                                    Demandeur : <strong>{req.requestor_name}</strong> ({req.requestor_email})
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        className="btn flex items-center gap-1" 
                                        style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
                                        onClick={() => handleAction(req.id, req.membership_id, req.requestor_id, req.requestor_email, 'approve')}
                                        disabled={actionLoading === req.id}
                                    >
                                        <Check size={16} /> 
                                        {actionLoading === req.id ? '...' : 'Valider'}
                                    </button>
                                    <button 
                                        className="btn btn-secondary flex items-center gap-1"
                                        style={{ color: 'var(--color-error)' }}
                                        onClick={() => handleAction(req.id, req.membership_id, req.requestor_id, req.requestor_email, 'refuse')}
                                        disabled={actionLoading === req.id}
                                    >
                                        <X size={16} /> Refuser
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
