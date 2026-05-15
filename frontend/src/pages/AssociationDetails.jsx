import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Target, ClipboardList, ArrowLeft, Loader2, AlertCircle, Info, CheckCircle } from 'lucide-react';

const AssociationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [association, setAssociation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joinSuccess, setJoinSuccess] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);

    const handleJoin = async () => {
        if (!user) return navigate('/login');
        setJoinLoading(true);
        setJoinError('');
        try {
            await api.post(`associations/${id}/join`);
            setJoinSuccess(true);
        } catch (err) {
            setJoinError(err.response?.data?.message || 'Erreur lors de la demande d\'adhésion.');
        } finally {
            setJoinLoading(false);
        }
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`associations/${id}`);
                setAssociation(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Impossible de charger les détails.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <AlertCircle size={48} color="var(--color-error)" style={{ margin: '0 auto 1rem auto' }} />
                    <h2 style={{ color: 'var(--color-error)' }}>Erreur</h2>
                    <p>{error}</p>
                    <Link to="/associations" className="btn btn-primary mt-2 flex items-center gap-2 inline-flex" style={{ width: 'auto' }}>
                        <ArrowLeft size={18} /> Retour à l'annuaire
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in mt-4 mb-4">
            <Link to="/associations" className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <ArrowLeft size={18} /> Retour à l'annuaire
            </Link>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header with Logo */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '2rem', borderBottom: '1px solid var(--color-border)', textAlign: 'center' }}>
                    {association.logo_url ? (
                        <img 
                            src={association.logo_url} 
                            alt={association.name}
                            style={{ 
                                maxWidth: '250px', 
                                maxHeight: '150px', 
                                margin: '0 auto 1.5rem auto',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))'
                            }}
                        />
                    ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <Building2 color="white" size={40} />
                        </div>
                    )}
                    <h1 style={{ color: 'var(--color-text-main)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>{association.name}</h1>
                    <span style={{ 
                        padding: '0.3rem 0.8rem', 
                        backgroundColor: 'rgba(56, 189, 248, 0.1)', 
                        color: 'var(--color-accent)', 
                        borderRadius: '20px', 
                        fontWeight: 600,
                        fontSize: '0.9rem'
                    }}>
                        Association Certifiée
                    </span>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Description */}
                        <div>
                            <h3 className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-primary)' }}>
                                <Info size={20} /> Présentation
                            </h3>
                            <p style={{ lineHeight: '1.7', color: 'var(--color-text-main)' }}>
                                {association.description}
                            </p>
                        </div>

                        {/* Objectives */}
                        <div>
                            <h3 className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-primary)' }}>
                                <Target size={20} /> Nos Objectifs
                            </h3>
                            <p style={{ lineHeight: '1.7', color: 'var(--color-text-main)' }}>
                                {association.objectives || "Aucun objectif spécifique renseigné."}
                            </p>
                        </div>
                    </div>

                    <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

                    {/* Membership */}
                    <div>
                        <h3 className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-primary)' }}>
                            <ClipboardList size={20} /> Conditions d'adhésion
                        </h3>
                        <div style={{ 
                            backgroundColor: '#F1F5F9', 
                            padding: '1.5rem', 
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--color-accent)'
                         }}>
                            <p style={{ margin: 0, fontWeight: 500 }}>
                                {association.membership_conditions || "Ouvert à tous les étudiants du campus."}
                            </p>
                        </div>
                    </div>

                    {joinSuccess && (
                        <div style={{ 
                            position: 'fixed', 
                            bottom: '30px', 
                            right: '30px', 
                            zIndex: 9999, 
                            backgroundColor: '#DEF7EC', 
                            border: '1px solid #31C48D', 
                            color: '#03543F', 
                            padding: '1rem 1.5rem', 
                            borderRadius: '8px', 
                            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            animation: 'fadeIn 0.3s ease-out'
                        }}>
                            <CheckCircle size={28} />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Félicitations !</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Votre demande d'adhésion a bien été envoyée.</p>
                            </div>
                            <button onClick={() => setJoinSuccess(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#03543F', marginLeft: '1rem' }}>&times;</button>
                        </div>
                    )}

                    <div className="mt-4 flex flex-col items-end gap-2">
                        {joinError && <p style={{ color: 'var(--color-error)', margin: 0 }}>{joinError}</p>}
                        <button className="btn btn-primary" onClick={handleJoin} disabled={joinLoading || !user || joinSuccess}>
                            {joinLoading ? 'Envoi en cours...' : (!user ? 'Connectez-vous pour adhérer' : (joinSuccess ? 'Demande envoyée' : 'Devenir Membre'))}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociationDetails;
