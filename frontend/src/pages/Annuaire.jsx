import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Info, ArrowRight, Loader2, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Annuaire = () => {
    const [associations, setAssociations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredAssociations = associations.filter(asso => 
        asso.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin text-indigo" size={48} />
            </div>
        );
    }

    return (
        <div className="container animate-fade-in mt-4 mb-4" style={{ paddingTop: '40px' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{ color: 'var(--indigo)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Communauté</div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--ff-display)', marginBottom: '24px' }}>Associations du campus</h1>
                
                <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--ink3)' }} />
                    <input 
                        type="text" 
                        placeholder="Rechercher un club ou une association..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 20px 14px 48px',
                            borderRadius: '16px',
                            border: '1.5px solid var(--borderl)',
                            background: '#fff',
                            outline: 'none',
                            fontSize: '15px'
                        }}
                    />
                </div>
            </div>
            
            {filteredAssociations.length === 0 ? (
                <div className="acard" style={{ padding: '80px 40px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--surf2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Users size={32} color="var(--ink3)" />
                    </div>
                    <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Aucune association trouvée</h3>
                    <p style={{ color: 'var(--ink3)' }}>Essayez un autre terme de recherche ou revenez plus tard.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                    {filteredAssociations.map((asso) => (
                        <Link key={asso.id} to={`/associations/${asso.id}`} style={{ textDecoration: 'none' }}>
                            <div className="acard flex flex-column h-100">
                                <div style={{ 
                                    width: '64px', height: '64px', borderRadius: '16px', 
                                    background: 'var(--indigo-light)', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                                    fontSize: '28px', overflow: 'hidden'
                                }}>
                                    {asso.logo_url ? (
                                        <img src={asso.logo_url} alt={asso.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        '🏛️'
                                    )}
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--ink)' }}>{asso.name}</h3>
                                <div style={{ fontSize: '12px', color: 'var(--ink3)', marginBottom: '12px' }}>{asso.plan || 'Membre'} du réseau</div>
                                <div style={{ marginTop: 'auto' }}>
                                    <span style={{ 
                                        display: 'inline-block', padding: '4px 12px', 
                                        borderRadius: 'var(--r3)', background: 'var(--indigo-light)', 
                                        color: 'var(--indigo)', fontSize: '11px', fontWeight: 700 
                                    }}>
                                        Explorer <ArrowRight size={10} style={{ marginLeft: '4px' }} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Annuaire;
