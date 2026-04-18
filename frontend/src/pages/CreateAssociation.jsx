import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Building2, FileText, CheckCircle } from 'lucide-react';

const CreateAssociation = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        objectives: '',
        membership_conditions: ''
    });
    const [logo, setLogo] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setLogo(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('objectives', formData.objectives);
        data.append('membership_conditions', formData.membership_conditions);
        
        if (logo) {
            data.append('logo', logo);
        }

        try {
            const response = await api.post('associations/request', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatus({ type: 'success', message: response.data.message });
            setFormData({ name: '', description: '', objectives: '', membership_conditions: '' });
            setLogo(null);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Une erreur est survenue lors de la soumission.';
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in mt-4 mb-4">
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 className="mb-2" style={{ color: 'var(--color-primary)' }}>Demande de Création d'Association</h2>
                <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    Remplissez ce formulaire pour soumettre votre association à l'administration universitaire.
                    Une fois validée, vous obtiendrez le rôle de <strong>Responsable</strong> et l'association sera visible publiquement.
                </p>

                {status.message && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: status.type === 'error' ? '#FEF2F2' : '#F0FDF4',
                        color: status.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
                        border: `1px solid ${status.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {status.type === 'success' && <CheckCircle size={20} />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nom de l'association *</label>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={18} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                placeholder="Club Informatique Campus"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Logo officiel (Optionnel)</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description globale *</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                            placeholder="Décrivez l'association et ses activités principales en quelques phrases..."
                        ></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Objectifs visés</label>
                            <textarea 
                                name="objectives"
                                value={formData.objectives}
                                onChange={handleChange}
                                rows="3"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                placeholder="Promouvoir le développement local, etc."
                            ></textarea>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Conditions d'adhésion</label>
                            <textarea 
                                name="membership_conditions"
                                value={formData.membership_conditions}
                                onChange={handleChange}
                                rows="3"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                placeholder="Être étudiant en L3, payer une cotisation de 500 MRU, etc."
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading || status.type === 'success'}>
                            {loading ? 'Soumission...' : 'Soumettre le dossier'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateAssociation;
