import React, { useState } from 'react';
import { CheckCircle, Send, X, BadgeDollarSign, Gift } from 'lucide-react';
import api from '../services/api';

/**
 * Modal component for making a donation (monetary or in‑kind).
 * Props:
 *   - association: object containing at least { id, name }
 *   - onClose: function to close the modal
 */
const DonateModal = ({ association, onClose }) => {
  const [step, setStep] = useState(1); // 1 = select type, 2 = form, 3 = success
  const [donationType, setDonationType] = useState('MONETARY');
  const [form, setForm] = useState({
    donor_name: '',
    donor_email: '',
    amount: '',
    item_description: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post(`donations/${association.id}`, { ...form, donation_type: donationType });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi du don.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'fadeInDown 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '28px 32px', color: '#fff', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <X size={16} />
          </button>
          <h3>Faire un don à {association.name}</h3>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          {step === 3 ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={48} color="#059669" />
              <h3 style={{ marginTop: '16px' }}>Merci pour votre soutien !</h3>
              <p style={{ margin: '16px 0' }}>Votre don a bien été enregistré.</p>
              <button className="btn btn-primary" onClick={onClose}>Fermer</button>
            </div>
          ) : step === 1 ? (
            <>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quel type de don souhaitez-vous faire ?</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'MONETARY', label: 'Don financier', icon: <BadgeDollarSign size={24} />, desc: 'Virement ou espèces', color: '#7C3AED', bg: '#EDE9FE' },
                  { id: 'IN_KIND', label: 'Don en nature', icon: <Gift size={24} />, desc: 'Matériel, nourriture...', color: '#D97706', bg: '#FEF3C7' }
                ].map(t => (
                  <div
                    key={t.id}
                    onClick={() => setDonationType(t.id)}
                    style={{
                      padding: '20px 16px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: '2px solid',
                      borderColor: donationType === t.id ? t.color : 'var(--borderl)',
                      background: donationType === t.id ? t.bg : '#fff',
                      transition: '0.2s',
                      transform: donationType === t.id ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <div style={{ color: t.color, marginBottom: '8px' }}>{t.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: t.color }}>{t.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--ink3)', marginTop: '4px' }}>{t.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', background: '#059669' }}>Continuer →</button>
            </>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Votre nom *</label>
                <input type="text" name="donor_name" className="form-input" placeholder="Prénom et nom" value={form.donor_name} onChange={handleChange} required />
              </div>
              <div>
                <label className="form-label">Email (facultatif)</label>
                <input type="email" name="donor_email" className="form-input" placeholder="pour recevoir une confirmation" value={form.donor_email} onChange={handleChange} />
              </div>
              {donationType === 'MONETARY' ? (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Montant (MRU) *</label>
                  <input type="number" name="amount" className="form-input" placeholder="ex: 1000" min="1" value={form.amount} onChange={handleChange} required />
                </div>
              ) : (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description du bien *</label>
                  <input type="text" name="item_description" className="form-input" placeholder="ex: 20 chaises, un frigo, des livres..." value={form.item_description} onChange={handleChange} required />
                </div>
              )}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message (facultatif)</label>
                <textarea name="message" className="form-input" rows={3} placeholder="Un mot d'encouragement..." value={form.message} onChange={handleChange} style={{ resize: 'vertical' }} />
              </div>
              {error && (
                <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>{error}</div>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>← Retour</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Envoi...' : <><Send size={16} /> Envoyer mon don</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonateModal;
