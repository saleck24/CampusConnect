import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, MapPin, Users as UsersIcon, Ticket, ArrowRight, Info, Loader2, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(null);

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
        } catch (error) {
            alert(error.response?.data?.message || "Erreur lors de l'inscription");
        } finally {
            setRegistering(null);
        }
    };

    if (loading) {
        return (
            <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin text-indigo" size={48} />
            </div>
        );
    }

    return (
        <div className="container animate-fade-in mt-4 mb-4" style={{ paddingTop: '40px' }}>
            <div className="flex justify-between items-end mb-4" style={{ marginBottom: '40px' }}>
                <div>
                    <div style={{ color: 'var(--indigo)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>À venir</div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--ff-display)' }}>Événements du campus</h1>
                </div>
                {user && (user.role === 'responsable' || user.role === 'admin') && (
                    <Link to="/create-event" className="btn btn-primary" style={{ gap: '8px' }}>
                        <Plus size={18} /> Créer un événement
                    </Link>
                )}
            </div>

            {events.length === 0 ? (
                <div className="acard" style={{ padding: '80px 40px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--surf2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Calendar size={32} color="var(--ink3)" />
                    </div>
                    <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Aucun événement prévu</h3>
                    <p style={{ color: 'var(--ink3)' }}>Revenez plus tard pour découvrir les prochaines activités !</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {events.map((event) => {
                        const eventDate = new Date(event.date);
                        const day = eventDate.getDate();
                        const month = eventDate.toLocaleString('fr-FR', { month: 'short' }).replace('.', '');
                        
                        return (
                            <div key={event.id} className="ecard flex flex-column">
                                {/* Visual Top */}
                                <div style={{ 
                                    height: '140px', 
                                    background: event.is_paid ? 'var(--amber)' : 'var(--indigo-light)',
                                    opacity: 0.9,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '48px'
                                }}>
                                    {event.is_paid ? '🏆' : '💻'}
                                    <div style={{ 
                                        position: 'absolute', top: '12px', left: '12px', 
                                        background: '#fff', borderRadius: '10px', padding: '6px 10px',
                                        textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{day}</div>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase' }}>{month}</div>
                                    </div>
                                    <div style={{ 
                                        position: 'absolute', top: '12px', right: '12px',
                                        padding: '4px 10px', borderRadius: 'var(--r3)', fontSize: '10px', fontWeight: 700,
                                        background: event.is_paid ? '#fef3c7' : '#d1fae5',
                                        color: event.is_paid ? '#92400e' : '#065f46'
                                    }}>
                                        {event.is_paid ? `${event.guest_price} MRU` : 'Gratuit'}
                                    </div>
                                </div>

                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                        {event.association_name}
                                    </div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.4 }}>
                                        {event.title}
                                    </h3>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                        <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--ink3)' }}>
                                            <MapPin size={14} className="text-indigo" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--ink3)' }}>
                                            <Calendar size={14} className="text-indigo" />
                                            <span>{eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ flex: 1, padding: '8px 16px', fontSize: '13px' }}
                                            onClick={() => handleRegister(event.id)}
                                            disabled={registering === event.id}
                                        >
                                            {registering === event.id ? 'Inscription...' : "S'inscrire"}
                                        </button>
                                        
                                        <Link 
                                            to={`/events/${event.id}`} 
                                            className="btn btn-ghost"
                                            style={{ padding: '8px' }}
                                            title="Plus d'infos"
                                        >
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Events;
