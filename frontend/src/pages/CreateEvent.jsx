import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, MapPin, AlignLeft, Users, CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        end_date: '',
        location: '',
        max_participants: '',
        is_paid: false,
        guest_price: 0,
        member_price: 0
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation basique
        if (new Date(formData.date) >= new Date(formData.end_date)) {
            setError("La date de fin doit être après la date de début.");
            setLoading(false);
            return;
        }

        try {
            await api.post('events/create', formData);
            setSuccess(true);
            setTimeout(() => navigate('/events'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Une erreur est survenue lors de la création.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in mt-4 mb-4" style={{ maxWidth: '800px' }}>
            <div className="card">
                <h2 className="mb-4" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar /> Créer un nouvel événement
                </h2>

                {success ? (
                    <div className="text-center py-4">
                        <CheckCircle size={64} color="var(--color-accent)" style={{ margin: '0 auto 1.5rem' }} />
                        <h3 style={{ color: 'var(--color-accent)' }}>Événement créé avec succès !</h3>
                        <p>Redirection vers le catalogue...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        
                        {error && (
                            <div style={{ gridColumn: '1 / -1', padding: '1rem', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={20} /> {error}
                            </div>
                        )}

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="flex items-center gap-2 mb-1" style={{ fontWeight: 600 }}>Titre de l'événement</label>
                            <input 
                                type="text" name="title" required
                                placeholder="Ex: Grand gala annuel, Tournoi de foot..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="flex items-center gap-2 mb-1" style={{ fontWeight: 600 }}>
                                <AlignLeft size={16} /> Description détaillée
                            </label>
                            <textarea 
                                name="description" rows="4" required
                                placeholder="Expliquez ce que les participants vont vivre..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 mb-1" style={{ fontWeight: 600 }}>
                                <Clock size={16} /> Date & Heure Début
                            </label>
                            <input 
                                type="datetime-local" name="date" required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 mb-1" style={{ fontWeight: 600 }}>
                                <Clock size={16} /> Date & Heure Fin
                            </label>
                            <input 
                                type="datetime-local" name="end_date" required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 mb-1" style={{ fontWeight: 600 }}>
                                <MapPin size={16} /> Lieu / Salle
                            </label>
                            <input 
                                type="text" name="location" required
                                placeholder="Ex: Amphi B, Salle 102, Gymnase..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 mb-1" style={{ fontWeight: 600 }}>
                                <Users size={16} /> Nombre max de places
                            </label>
                            <input 
                                type="number" name="max_participants"
                                placeholder="Illimité si vide"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center gap-2" style={{ gridColumn: '1 / -1' }}>
                            <input 
                                type="checkbox" name="is_paid" id="is_paid" 
                                style={{ width: '1.2rem', height: '1.2rem' }}
                                onChange={handleChange}
                            />
                            <label htmlFor="is_paid" style={{ fontWeight: 600 }}>Événement payant ?</label>
                        </div>

                        {formData.is_paid && (
                            <>
                                <div>
                                    <label className="flex items-center gap-2 mb-1" style={{ fontWeight: 600 }}>
                                        <CreditCard size={16} /> Prix Étudiant / Invité
                                    </label>
                                    <input 
                                        type="number" name="guest_price"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 mb-1" style={{ fontWeight: 600 }}>
                                        <CreditCard size={16} /> Prix Membre Association
                                    </label>
                                    <input 
                                        type="number" name="member_price"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ gridColumn: '2 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button 
                                type="button" className="btn btn-secondary" style={{ flex: 1 }}
                                onClick={() => navigate('/events')}
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" className="btn btn-primary" style={{ flex: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Vérification disponibilité...' : 'Publier l\'événement'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateEvent;
