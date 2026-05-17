import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.98)', 
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--borderl)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '16px 0'
        }}>
            <div className="container flex items-center" style={{ gap: '32px' }}>
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, var(--indigo) 0%, var(--indigo2) 100%)', 
                        padding: '8px', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                    }}>
                        <GraduationCap size={24} color="white" />
                    </div>
                    <span style={{ 
                        color: 'var(--ink)', 
                        fontWeight: '800', 
                        fontSize: '1.4rem', 
                        fontFamily: 'var(--ff-display)',
                        letterSpacing: '-0.03em'
                    }}>
                        Campus<span style={{ color: 'var(--indigo)' }}>Connect</span>
                    </span>
                </Link>
                
                {/* Navigation Links */}
                <nav className="hidden-mobile flex items-center gap-10" style={{ flex: 1, justifyContent: 'center' }}>
                    <Link to="/events" className="nav-link" style={{ color: 'var(--ink2)', fontWeight: '600', fontSize: '14px' }}>Événements</Link>
                    <Link to="/associations" className="nav-link" style={{ color: 'var(--ink2)', fontWeight: '600', fontSize: '14px' }}>Associations</Link>
                    {user && user.role === 'admin' && (
                        <Link to="/admin" className="nav-link" style={{ color: 'var(--amber)', fontWeight: '700', fontSize: '14px' }}>Tableau de bord</Link>
                    )}
                    {user && user.role === 'responsable' && (
                        <Link to="/responsable-panel" className="nav-link" style={{ color: 'var(--indigo)', fontWeight: '700', fontSize: '14px' }}>Tableau de bord</Link>
                    )}
                    {user && user.role === 'etudiant' && (
                        <Link to="/create-association" className="nav-link" style={{ color: 'var(--indigo)', fontWeight: '700', fontSize: '14px' }}>Demande d'Asso</Link>
                    )}
                </nav>

                {/* Actions Section */}
                <div className="flex items-center" style={{ marginLeft: 'auto' }}>
                    {user ? (
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2" style={{ background: 'var(--surf3)', padding: '8px 16px', borderRadius: 'var(--r3)', border: '1px solid var(--borderl)' }}>
                                <UserIcon size={16} className="text-indigo" />
                                <span style={{ color: 'var(--ink2)', fontWeight: '700', fontSize: '13px' }}>{user.name}</span>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    borderRadius: '6px',
                                    marginLeft: '4px',
                                    backgroundColor: user.role === 'admin' 
                                        ? 'var(--amber-light)' 
                                        : user.role === 'responsable' 
                                            ? 'var(--indigo)' 
                                            : 'var(--teal-light)',
                                    color: user.role === 'admin' 
                                        ? 'var(--amber)' 
                                        : user.role === 'responsable' 
                                            ? '#fff' 
                                            : 'var(--teal)',
                                    padding: user.role === 'responsable' ? '3px 8px' : '2px 6px',
                                    boxShadow: user.role === 'responsable' ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
                                    textTransform: 'uppercase'
                                }}>
                                    {user.role}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="btn btn-ghost btn-logout" style={{ padding: '10px 16px', borderRadius: '12px' }}>
                                <LogOut size={16} />
                                <span className="hidden-mobile">Déconnexion</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="btn btn-ghost" style={{ padding: '10px 24px', borderRadius: '12px' }}>Connexion</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '12px' }}>Commencer</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
