import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

const ConfirmEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Vérification en cours...');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await api.get(`auth/confirm/${token}`);
                setStatus('success');
                setMessage(response.data.message);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Lien invalide ou expiré.');
            }
        };

        if (token) {
            verifyToken();
        }
    }, [token]);

    return (
        <div className="animate-fade-in flex justify-center items-center mt-4">
            <div className="card text-center" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                
                {status === 'loading' && (
                     <div style={{ color: 'var(--color-primary)' }}>
                        <h3>{message}</h3>
                        <p style={{ color: 'var(--color-text-muted)'}} className="mt-2">Veuillez patienter.</p>
                     </div>
                )}

                {status === 'success' && (
                    <div>
                        <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                        <h3 style={{ color: 'var(--color-text-main)' }}>Validation réussie</h3>
                        <p className="mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
                        <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>Se Connecter</Link>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <XCircle size={48} color="var(--color-error)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                        <h3 style={{ color: 'var(--color-error)' }}>Erreur</h3>
                        <p className="mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
                        <Link to="/register" className="btn btn-secondary" style={{ width: '100%' }}>Retourner à l'inscription</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfirmEmail;
