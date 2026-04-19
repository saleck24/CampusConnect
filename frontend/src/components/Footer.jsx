import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail } from 'lucide-react';

const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const GithubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path><path d="M9 18c-4.5 1.6-5-2.5-5-2.5"></path></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;

const Footer = () => {
    return (
        <footer style={{ 
            backgroundColor: 'var(--ink)', 
            color: '#fff', 
            padding: '80px 0 40px',
            marginTop: '100px',
            borderTop: '6px solid var(--indigo)' // Ligne de séparation très visible
        }}>
            <div className="container">
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '48px',
                    marginBottom: '60px'
                }}>
                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                            <div style={{ background: 'var(--indigo)', padding: '8px', borderRadius: '10px' }}>
                                <GraduationCap size={20} color="white" />
                            </div>
                            <span style={{ fontWeight: '800', fontSize: '20px', fontFamily: 'var(--ff-display)', letterSpacing: '-0.02em' }}>
                                CampusConnect
                            </span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, maxWidth: '280px' }}>
                            La plateforme centrale pour dynamiser la vie étudiante et associative de votre campus.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Navigation</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link to="/events" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Événements</Link></li>
                            <li><Link to="/associations" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Annuaire</Link></li>
                            <li><Link to="/register" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Partenariats</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ressources</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link to="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Centre d'aide</Link></li>
                            <li><Link to="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Confidentialité</Link></li>
                            <li><Link to="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Conditions d'utilisation</Link></li>
                        </ul>
                    </div>

                    {/* Social/Newsletter */}
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nous suivre</h4>
                        <div className="flex gap-4">
                            <a href="#" style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', display: 'flex' }}><FacebookIcon /></a>
                            <a href="#" style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', display: 'flex' }}><GithubIcon /></a>
                            <a href="#" style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', display: 'flex' }}><LinkedinIcon /></a>
                        </div>
                    </div>
                </div>

                <div style={{ 
                    borderTop: '1px solid rgba(255,255,255,0.1)', 
                    paddingTop: '32px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                        © 2026 CampusConnect. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                        <Mail size={14} /> campustoconnected@gmail.com
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
