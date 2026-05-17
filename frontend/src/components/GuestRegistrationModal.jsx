import React, { useState } from 'react';
import api from '../services/api';
import { X, User, Mail, Phone, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Modal d'inscription pour les visiteurs non connectés.
 * Affiche un formulaire (nom, email, téléphone) et un bouton WhatsApp
 * qui envoie un message pré-rempli au responsable de l'association.
 */
const GuestRegistrationModal = ({ event, onClose }) => {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleWhatsApp = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
            setError('Veuillez remplir tous les champs avant de continuer.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            // Enregistrer l'inscription en base
            await api.post(`events/register/${event.id}`, {
                guest_name: form.name,
                guest_email: form.email,
                guest_phone: form.phone
            });

            // Construire le message WhatsApp automatique
            const message = `Bonjour, je m'appelle ${form.name}, je souhaite m'inscrire à l'événement "${event.title}", qui commence le ${formatDate(event.date)} jusqu'au ${formatDate(event.end_date)} à ${event.location}.${event.is_paid ? ` Prix : ${event.guest_price} MRU.` : ' (Événement gratuit)'}`;

            // Numéro du responsable (récupéré depuis l'event)
            const phone = (event.responsible_phone || '').replace(/\D/g, '');
            const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            setSuccess(true);
            // Ouvrir WhatsApp après un court délai
            setTimeout(() => window.open(waUrl, '_blank'), 500);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: '#fff',
                borderRadius: '24px',
                width: '100%', maxWidth: '480px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    background: 'var(--indigo)',
                    padding: '24px 28px',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                            Inscription Invité
                        </p>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.3, margin: 0 }}>
                            {event.title}
                        </h2>
                        {event.is_paid && (
                            <div style={{
                                marginTop: '10px',
                                background: 'rgba(255,255,255,0.15)',
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 700
                            }}>
                                {event.guest_price} MRU
                            </div>
                        )}
                        {!event.is_paid && (
                            <div style={{
                                marginTop: '10px',
                                background: 'rgba(255,255,255,0.15)',
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 700
                            }}>
                                Gratuit
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.15)', border: 'none',
                        borderRadius: '10px', padding: '8px', cursor: 'pointer',
                        color: '#fff', display: 'flex', alignItems: 'center'
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '28px' }}>
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <CheckCircle size={56} color="#10B981" style={{ margin: '0 auto 16px' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                                Inscription enregistrée !
                            </h3>
                            <p style={{ color: 'var(--ink3)', marginBottom: '20px' }}>
                                WhatsApp s'ouvre avec le message pré-rempli pour le responsable.
                            </p>
                            <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
                        </div>
                    ) : (
                        <>
                            <p style={{ color: 'var(--ink3)', fontSize: '14px', marginBottom: '20px' }}>
                                Renseignez vos coordonnées. Un message WhatsApp sera envoyé automatiquement au responsable de l'association.
                            </p>

                            {error && (
                                <div style={{
                                    background: '#FEE2E2', color: '#991B1B',
                                    padding: '12px 16px', borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    marginBottom: '16px', fontSize: '14px'
                                }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {/* Champ Nom */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                                    <User size={14} /> Nom complet *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Ex : Ahmed Ould Mohamed"
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        borderRadius: '10px', border: '1.5px solid var(--borderl)',
                                        fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Champ Email */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                                    <Mail size={14} /> Email *
                                    <span style={{ fontWeight: 400, color: 'var(--ink3)', fontSize: '12px' }}>(pour recevoir votre ticket)</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Ex : ahmed@example.com"
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        borderRadius: '10px', border: '1.5px solid var(--borderl)',
                                        fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Champ Téléphone */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                                    <Phone size={14} /> Numéro de téléphone *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Ex : +222 XX XX XX XX"
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        borderRadius: '10px', border: '1.5px solid var(--borderl)',
                                        fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Bouton WhatsApp */}
                            <button
                                onClick={handleWhatsApp}
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px',
                                    backgroundColor: loading ? '#86efac' : '#25D366',
                                    color: '#fff', border: 'none',
                                    borderRadius: '12px', fontSize: '15px',
                                    fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '10px', transition: '0.2s',
                                    boxShadow: '0 4px 15px rgba(37,211,102,0.3)'
                                }}
                            >
                                {/* Logo WhatsApp SVG */}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                {loading ? 'Inscription en cours...' : 'Payer via WhatsApp'}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--ink3)', marginTop: '12px' }}>
                                WhatsApp s'ouvrira avec le message pré-rempli pour le responsable.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuestRegistrationModal;
