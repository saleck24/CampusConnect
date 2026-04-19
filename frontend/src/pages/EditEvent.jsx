import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Calendar, MapPin, AlignLeft, Users, CreditCard, Clock, AlertCircle, CheckCircle, Edit3 } from 'lucide-react';

const EditEvent = () => {
    const { id } = useParams();
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

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`events/detail/${id}`);
                const e = res.data.event;
                
                // Formater les dates pour le format attendu par <input type="datetime-local">
                const formatDate = (dateString) => {
                    if (!dateString) return '';
                    const d = new Date(dateString);
                    // Retrait de l'offset timezone local pour que l'input affiche exactement l'heure stockée.
                    // (L'input attend YYYY-MM-DDTHH:mm)
                    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                };

                setFormData({
                    title: e.title || '',
                    description: e.description || '',
                    date: formatDate(e.date),
                    end_date: formatDate(e.end_date),
                    location: e.location || '',
                    max_participants: e.max_participants || '',
                    is_paid: !!e.is_paid,
                    guest_price: e.guest_price || 0,
                    member_price: e.member_price || 0
                });
            } catch (err) {
                setError("Impossible de charger les détails de l'événement.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Validation basique
        if (new Date(formData.date) >= new Date(formData.end_date)) {
            setError("La date de fin doit être après la date de début.");
            setSubmitting(false);
            return;
        }

        try {
            await api.patch(`events/${id}`, formData);
            setSuccess(true);
            setTimeout(() => navigate('/responsable-panel'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Une erreur est survenue lors de la modification.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in mt-4 mb-4" style={{ maxWidth: '800px' }}>
            <div className="card">
                <h2 className="mb-4" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Edit3 /> Modifier l'événement
                </h2>

                {success ? (
                    <div className="text-center py-4">
                        <CheckCircle size={64} color="var(--color-accent)" style={{ margin: '0 auto 1.5rem' }} />
                        <h3 style={{ color: 'var(--color-accent)' }}>Événement modifié avec succès !</h3>
                        <p>Retour au tableau de bord...</p>
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
                                value={formData.title}
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
                                value={formData.description}
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
                                value={formData.date}
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
                                value={formData.end_date}
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
                                value={formData.location}
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
                                value={formData.max_participants}
                                placeholder="Illimité si vide"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center gap-2" style={{ gridColumn: '1 / -1' }}>
                            <input 
                                type="checkbox" name="is_paid" id="is_paid" 
                                checked={formData.is_paid}
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
                                        value={formData.guest_price}
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
                                        value={formData.member_price}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ gridColumn: '2 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button 
                                type="button" className="btn btn-secondary" style={{ flex: 1 }}
                                onClick={() => navigate('/responsable-panel')}
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" className="btn btn-primary" style={{ flex: 2 }}
                                disabled={submitting}
                            >
                                {submitting ? 'Vérification...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditEvent;
