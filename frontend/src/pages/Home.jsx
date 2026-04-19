import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({ users: 0, associations: 0, eventsThisMonth: 0, satisfaction: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('stats/public');
        setStats(response.data);
      } catch (error) {
        console.error('Erreur stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero" style={{ 
        padding: '120px 0 100px', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, var(--surf2), #fff)'
      }}>
        {/* Background Decorative Elements */}
        <div className="hero-grid-bg" style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(var(--borderl) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.4
        }}></div>
        <div className="hero-glow" style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }}></div>

        <div className="container" style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: '800', lineHeight: 1.05, marginBottom: '28px', color: 'var(--ink)' }}>
            La vie associative <br />
            <span style={{ 
                background: 'linear-gradient(135deg, var(--indigo) 0%, var(--indigo2) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>réinventée</span> pour votre <br />
            campus
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--ink3)', maxWidth: '580px', margin: '0 auto 44px', lineHeight: 1.6, fontWeight: '500' }}>
            Découvrez, rejoignez et participez à tout ce qui se passe autour de vous — en un seul endroit centralisé.
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
              Créer mon compte gratuit
            </Link>
            <Link to="/events" className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '16px' }}>
              Voir les événements
            </Link>
          </div>

          <div style={{ marginTop: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div className="flex" style={{ marginLeft: '12px' }}>
                  {(stats.recentInitials && stats.recentInitials.length > 0 ? stats.recentInitials : ['ME', 'SA', 'OB']).map((initials, i) => (
                      <div key={i} style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', 
                          background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 60%) 0%, hsl(${i * 60}, 80%, 40%) 100%)`, border: '2px solid #fff',
                          marginLeft: '-12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', color: '#fff', fontWeight: '800',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                          {initials}
                      </div>
                  ))}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--ink3)', fontWeight: '600' }}>
                <b style={{ color: 'var(--ink)' }}>{stats.users}+</b> étudiants déjà inscrits
              </span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container" style={{ padding: '40px 0 80px' }}>
        <div style={{ 
          background: 'var(--ink)', 
          borderRadius: '32px', 
          padding: '56px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          color: '#fff',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.15)'
        }}>
          <div className="text-center">
            <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--ff-display)', letterSpacing: '-0.03em' }}>
              {stats.associations}<span>+</span>
            </div>
            <div style={{ fontSize: '14px', opacity: 0.6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Associations actives</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--ff-display)', letterSpacing: '-0.03em' }}>
              {stats.eventsThisMonth}<span>+</span>
            </div>
            <div style={{ fontSize: '14px', opacity: 0.6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Événements ce mois</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--ff-display)', letterSpacing: '-0.03em' }}>
              {stats.users > 1000 ? (stats.users/1000).toFixed(1) + 'k' : stats.users}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Étudiants inscrits</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--ff-display)', letterSpacing: '-0.03em', color: 'var(--indigo2)' }}>
              {stats.satisfaction}<span>%</span>
            </div>
            <div style={{ fontSize: '14px', opacity: 0.6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container" style={{ padding: '80px 0' }}>
        <div className="text-center" style={{ marginBottom: '56px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>Pourquoi choisir CampusConnect ?</h2>
            <p style={{ color: 'var(--ink3)', maxWidth: '600px', margin: '0 auto' }}>Une plateforme pensée par des étudiants, pour des étudiants.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          <div className="acard" style={{ textAlign: 'left' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--indigo-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Calendar className="text-indigo" size={28} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>Événements centralisés</h3>
            <p style={{ fontSize: '15px', color: 'var(--ink3)', lineHeight: 1.6 }}>Toutes les activités du campus en un seul endroit. Ne manquez plus jamais une opportunité de vous engager ou de vous amuser.</p>
          </div>
          <div className="acard" style={{ textAlign: 'left' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Users style={{ color: '#10B981' }} size={28} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>Annuaire des associations</h3>
            <p style={{ fontSize: '15px', color: 'var(--ink3)', lineHeight: 1.6 }}>Rejoignez des communautés qui partagent vos passions et développez votre réseau au sein de l'université.</p>
          </div>
          <div className="acard" style={{ textAlign: 'left' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <BarChart3 style={{ color: '#F59E0B' }} size={28} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>Suivi de participation</h3>
            <p style={{ fontSize: '15px', color: 'var(--ink3)', lineHeight: 1.6 }}>Gérez vos inscriptions en toute simplicité et suivez votre implication dans la vie du campus au fil du temps.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container" style={{ padding: '100px 0' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--indigo) 0%, var(--indigo2) 100%)', 
          borderRadius: '40px', 
          padding: '80px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 32px 64px rgba(79, 70, 229, 0.2)'
        }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>Prêt à rejoindre la communauté ?</h2>
          <p style={{ opacity: 0.9, marginBottom: '40px', maxWidth: '500px', fontSize: '17px' }}>
            Créez votre profil en quelques secondes et accédez à tout ce que votre campus a à offrir.
          </p>
          <Link to="/register" className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '16px', background: '#fff', color: 'var(--indigo)', border: 'none' }}>
            Commencer maintenant <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
