import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Annuaire = () => {
    const [associations, setAssociations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssociations = async () => {
            try {
                const response = await api.get('associations');
                setAssociations(response.data);
            } catch (error) {
                console.error("Erreur de récupération :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssociations();
    }, []);

    if (loading) {
        return <div className="container mt-4 text-center">Chargement de l'annuaire...</div>;
    }

    return (
        <div className="container animate-fade-in mt-4">
            <h2 className="mb-4" style={{ color: 'var(--color-primary)' }}>Annuaire des Associations</h2>
            
            {associations.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <Info size={48} color="var(--color-text-muted)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--color-text-main)' }}>Aucune association</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Il n'y a pas encore d'associations validées sur la plateforme.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {associations.map((asso) => (
                        <div key={asso.id} className="card flex" style={{ flexDirection: 'column' }}>
                            {asso.logo_url && (
                                <img 
                                    src={asso.logo_url} 
                                    alt={`Logo ${asso.name}`} 
                                    style={{ width: '100%', height: '200px', objectFit: 'contain', marginBottom: '1rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#FAFAFA', border: '1px solid var(--color-border)' }}
                                />
                            )}
                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>{asso.name}</h3>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', flex: 1 }}>
                                {asso.description && asso.description.length > 100 
                                    ? asso.description.substring(0, 100) + '...' 
                                    : asso.description}
                            </p>
                            <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600 }}>Plan {asso.plan}</span>
                                <Link to={`/associations/${asso.id}`} className="btn btn-secondary flex items-center gap-1" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                    Voir plus <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Annuaire;
