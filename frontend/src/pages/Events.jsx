import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, MapPin, Users as UsersIcon, Ticket, ArrowRight, Info, Loader2, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(null); // eventId being registered

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('events');
            setEvents(response.data);
        } catch (error) {
            console.error("Erreur récupération événements :", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (eventId) => {
        if (!user) {
            alert("Veuillez vous connecter pour vous inscrire !");
            return;
        }

        setRegistering(eventId);
        try {
            const response = await api.post(`events/register/${eventId}`);
            alert(response.data.message);
            // On pourrait rafraîchir ici pour mettre à jour les jauges si on avait le count actuel
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'inscription");
        } finally {
            setRegistering(null);
        }
    };

    if (loading) {
        return (
            <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
            </div>
        );
    }

    return (
        <div className="container animate-fade-in mt-4 mb-4">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 style={{ color: 'var(--color-primary)', fontSize: '2rem' }}>Catalogue des Événements</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Ne manquez rien de la vie sur le campus !</p>
                </div>
                {user && (user.role === 'responsable' || user.role === 'admin') && (
                    <a href="/create-event" className="btn btn-primary">Créer un événement</a>
                )}
            </div>

            {events.length === 0 ? (
                <div className="card text-center" style={{ padding: '4rem' }}>
                    <Calendar size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3>Aucun événement prévu</h3>
                    <p>Revenez plus tard pour découvrir les prochaines activités !</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {events.map((event) => (
                        <div key={event.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Header Info */}
                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span style={{ 
                                        padding: '0.2rem 0.6rem', 
                                        backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                                        color: 'var(--color-primary)', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 700, 
                                        borderRadius: '4px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {event.association_name}
                                    </span>
                                </div>
                                <h3 style={{ marginBottom: '1rem', height: '3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {event.title}
                                </h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        <Calendar size={18} color="var(--color-secondary)" />
                                        <span>{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        <MapPin size={18} color="var(--color-error)" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        <Ticket size={18} color="var(--color-accent)" />
                                        <span>{event.is_paid ? `Payant (${event.guest_price}MRU)` : 'Gratuit'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Action */}
                            <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ flex: 1 }}
                                    onClick={() => handleRegister(event.id)}
                                    disabled={registering === event.id}
                                >
                                    {registering === event.id ? 'Inscription...' : "S'inscrire"}
                                </button>
                                
                                {(user?.role === 'admin' || (user?.role === 'responsable' && user?.associationId === event.association_id)) && (
                                    <Link 
                                        to={`/events/${event.id}/participants`} 
                                        className="btn btn-secondary" 
                                        style={{ padding: '0.625rem', color: 'var(--color-primary)' }} 
                                        title="Voir les inscrits"
                                    >
                                        <UsersIcon size={18} />
                                    </Link>
                                )}

                                <button className="btn btn-secondary" style={{ padding: '0.625rem' }} title="Plus d'infos"
                                    onClick={() => window.location.href = `/events/${event.id}`}>
                                    <Info size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Events;
