import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BarChart3, ArrowRight, Star, MessageSquarePlus } from 'lucide-react';
import api from '../services/api';
import ReviewModal from '../components/ReviewModal';
import SponsorModal from '../components/SponsorModal';
import { useAuth } from '../context/AuthContext';

// Known sponsor brand data (logos & colors)
const KNOWN_SPONSORS = {
  'Mauritel': {
    logo_url: '/logo_mauritel.svg',
    website_url: 'https://www.mauritel.mr'
  },
  'Mattel': {
    logo_url: '/logo_mattel.png',
    website_url: 'https://www.mattel.mr'
  },
  'Chinguitel': {
    logo_url: '/logo_chinguitel.png',
    website_url: 'https://www.chinguitel.mr'
  },
  'Banque Populaire de Mauritanie': {
    logo_url: '/logo_bpm.JPG',
    website_url: 'https://www.bpm.mr'
  },
  'ATH': {
    logo_url: '/logo_ATH.jfif',
    website_url: 'https://ath-academy.com/'
  }
};

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, associations: 0, eventsThisMonth: 0, satisfaction: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [activeSponsors, setActiveSponsors] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);


  // Use loading state to show a spinner while data is being fetched
  const LoadingOverlay = () => (
    <div className="loading-overlay">
      <div className="spinner" />
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reviewsRes, featuredRes, sponsorsRes] = await Promise.all([
            api.get('stats/public'),
            api.get('reviews/recent'),
            api.get('events/featured'),
            api.get('sponsors/active')
        ]);
        setStats(statsRes.data);
        setRecentReviews(reviewsRes.data);
        setFeaturedEvents(featuredRes.data);
        // Enrich sponsors with known brand data
        const enrichedSponsors = sponsorsRes.data.map(s => {
            const known = KNOWN_SPONSORS[s.name];
            if (!known) return s;
            return {
              ...s,
              logo_url: s.logo_url || known.logo_url,
              brand_color: s.brand_color || known.brand_color,
              website_url: s.website_url || known.website_url
            };
        });
        setActiveSponsors(enrichedSponsors);

        // Si l'utilisateur est connecté, on vérifie s'il peut laisser un avis
        if (user && user.role === 'etudiant') {
            try {
                const canReviewRes = await api.get('reviews/can-review');
                setCanReview(canReviewRes.data.canReview);
            } catch (err) {
                console.error('Erreur vérification avis:', err);
            }
        }
      } catch (error) {
        console.error('Erreur data home:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const refreshReviews = async () => {
      try {
          const reviewsRes = await api.get('reviews/recent');
          setRecentReviews(reviewsRes.data);
          
          const statsRes = await api.get('stats/public');
          setStats(statsRes.data);
      } catch (error) {
          console.error('Erreur refresh:', error);
      }
  };

  if (loading) return <LoadingOverlay />;
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

      {/* Événements Premium à la Une Carousel */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section style={{ padding: '60px 0 20px', background: 'var(--surf)', overflow: 'hidden' }}>
          <div className="container" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--ink)' }}>Événements à la une</h2>
              <p style={{ color: 'var(--ink3)', marginTop: '4px', fontSize: '15px' }}>Découvrez les activités phares de nos associations Premium partenaires</p>
            </div>
            <Link to="/events" className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Tout voir <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="hide-scrollbar" style={{ 
              display: 'flex', 
              gap: '24px', 
              overflowX: 'auto', 
              padding: '0 24px 24px', 
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
          }}>
              <div style={{ minWidth: 'calc((100vw - 1200px) / 2)', flexShrink: 0 }} className="hidden-mobile"></div>
              
              {featuredEvents.map((event, idx) => (
                  <div key={idx} style={{ 
                      minWidth: '340px', 
                      maxWidth: '340px', 
                      padding: '24px', 
                      scrollSnapAlign: 'start',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      background: '#fff',
                      borderRadius: '24px',
                      border: '1px solid var(--borderl)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                  }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ 
                              fontSize: '11px', 
                              background: 'var(--indigo-light)', 
                              color: 'var(--indigo)', 
                              fontWeight: '800', 
                              padding: '6px 12px', 
                              borderRadius: '20px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                          }}>
                              À la une
                          </span>
                          <div style={{ fontSize: '13px', color: 'var(--ink3)', fontWeight: '600' }}>
                              {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '12px', 
                              background: 'var(--surf2)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              overflow: 'hidden',
                              border: '1px solid var(--borderl)'
                          }}>
                              {event.association_logo ? (
                                  <img src={`${api.defaults.baseURL.replace('/api', '')}${event.association_logo}`} alt={event.association_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                  <span style={{ fontWeight: '800', color: 'var(--indigo)' }}>{event.association_name.slice(0, 2).toUpperCase()}</span>
                              )}
                          </div>
                          <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{event.association_name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Organisateur</div>
                          </div>
                      </div>

                      <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', marginBottom: '8px', lineHeight: 1.3 }}>{event.title}</h3>
                          <p style={{ fontSize: '14px', color: 'var(--ink2)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {event.description || 'Aucune description fournie.'}
                          </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--borderl)', paddingTop: '16px' }}>
                          <div style={{ fontSize: '13px', color: 'var(--ink3)', fontWeight: '500' }}>
                              Lieu : <b>{event.location || 'Sur le campus'}</b>
                          </div>
                          <div>
                              {event.is_paid ? (
                                  <span style={{ fontWeight: '800', color: 'var(--indigo)', fontSize: '15px' }}>{event.guest_price} MRU</span>
                              ) : (
                                  <span style={{ fontWeight: '800', color: '#10B981', fontSize: '15px' }}>Gratuit</span>
                              )}
                          </div>
                      </div>

                      <Link to={`/events`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '10px 0', borderRadius: '12px', fontSize: '14px' }}>
                          S'inscrire
                      </Link>
                  </div>
              ))}
              <div style={{ minWidth: '24px', flexShrink: 0 }}></div>
          </div>
        </section>
      )}

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
        
        {/* Bouton Donner son avis (si éligible) */}
        {canReview && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                <button onClick={() => setIsReviewModalOpen(true)} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '14px', background: 'var(--ink)', boxShadow: '0 8px 16px rgba(2, 6, 23, 0.2)' }}>
                    <MessageSquarePlus size={18} />
                    Donner mon avis sur la plateforme
                </button>
            </div>
        )}
      </section>

      {/* Avis Étudiants Carousel */}
      {recentReviews && recentReviews.length > 0 && (
          <section style={{ padding: '40px 0 80px', overflow: 'hidden' }}>
              <div className="container" style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Ce que les étudiants en pensent</h2>
              </div>
              <div className="hide-scrollbar" style={{ 
                  display: 'flex', 
                  gap: '24px', 
                  overflowX: 'auto', 
                  padding: '0 24px 24px', 
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch'
              }}>
                  {/* Pseudo padding left pour l'alignement avec le container */}
                  <div style={{ minWidth: 'calc((100vw - 1200px) / 2)', flexShrink: 0 }} className="hidden-mobile"></div>
                  
                  {recentReviews.map((review, idx) => (
                      <div key={idx} className="ecard" style={{ 
                          minWidth: '320px', 
                          maxWidth: '320px', 
                          padding: '24px', 
                          scrollSnapAlign: 'start',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px'
                      }}>
                          <div className="flex items-center gap-3">
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo) 0%, var(--indigo2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff', fontWeight: '800' }}>
                                  {review.author_initials}
                              </div>
                              <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                      <Star key={star} size={14} fill={star <= review.rating ? "var(--amber)" : "transparent"} color={star <= review.rating ? "var(--amber)" : "var(--borderl)"} />
                                  ))}
                              </div>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--ink2)', fontStyle: 'italic', flex: 1, lineHeight: 1.6 }}>
                              "{review.comment || 'Sans commentaire.'}"
                          </p>
                          <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>
                              {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                      </div>
                  ))}

                  <div style={{ minWidth: '24px', flexShrink: 0 }}></div>
              </div>
          </section>
      )}

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

      {/* Sponsors Section - Infinite CSS Marquee */}
      <section style={{ padding: '60px 0', background: 'var(--surf2)', overflow: 'hidden' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '12px' }}>
            Ils soutiennent la communauté étudiante
          </h2>
          <p style={{ color: 'var(--ink3)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 36px', fontWeight: '500' }}>
            Découvrez nos partenaires engagés pour le développement académique et professionnel de notre campus.
          </p>
        </div>

        {(() => {
          // Build the list of sponsors to display
          const displaySponsors = activeSponsors && activeSponsors.length > 0
            ? activeSponsors
            : Object.entries(KNOWN_SPONSORS).map(([name, data]) => ({ name, ...data }));
          // Duplicate for infinite scroll effect
          const doubled = [...displaySponsors, ...displaySponsors];
          const itemCount = displaySponsors.length;

          return (
            <div style={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              padding: '10px 0 20px',
              maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
            }}>
              <style>{`
                @keyframes sponsorScroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-${itemCount * 240}px); }
                }
                .sponsor-track {
                  display: flex;
                  gap: 24px;
                  width: max-content;
                  animation: sponsorScroll ${itemCount * 4}s linear infinite;
                }
                .sponsor-track:hover {
                  animation-play-state: paused;
                }
                .sponsor-card {
                  flex-shrink: 0;
                  width: 210px;
                  height: 90px;
                  border-radius: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 16px 20px;
                  border: 1px solid var(--borderl);
                  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
                  transition: transform 0.3s ease, box-shadow 0.3s ease;
                  text-decoration: none;
                  overflow: hidden;
                }
                .sponsor-card:hover {
                  transform: scale(1.08) translateY(-4px);
                  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
                }
              `}</style>
              <div className="sponsor-track">
                {doubled.map((sponsor, idx) => {
                  const isExternal = sponsor.logo_url && (
                    sponsor.logo_url.startsWith('http://') || 
                    sponsor.logo_url.startsWith('https://') || 
                    sponsor.logo_url.startsWith('/logo_')
                  );
                  const logoSrc = sponsor.logo_url
                    ? (isExternal ? sponsor.logo_url : `${api.defaults.baseURL.replace('/api', '')}${sponsor.logo_url}`)
                    : null;

                  return (
                    <a
                      key={idx}
                      href={sponsor.website_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sponsor-card"
                      style={{ background: 'var(--surf3)' }}
                    >
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={sponsor.name}
                          style={{
                            maxHeight: '55px',
                            maxWidth: '160px',
                            objectFit: 'contain',
                            filter: sponsor.brand_color ? 'brightness(0) invert(1)' : 'none'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling && (e.target.nextSibling.style.display = 'block');
                          }}
                        />
                      ) : null}
                      <span style={{
                        display: logoSrc ? 'none' : 'block',
                        fontWeight: '800',
                        fontSize: '15px',
                        color: sponsor.brand_color ? '#fff' : 'var(--ink)',
                        letterSpacing: '-0.01em',
                        textAlign: 'center'
                      }}>
                        {sponsor.name}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="container text-center">
          <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--ink3)', fontWeight: '600' }}>
            Vous êtes une entreprise ? Contactez l'administration pour{' '}
            <button 
              onClick={() => setIsSponsorModalOpen(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                font: 'inherit', 
                color: 'var(--indigo)', 
                textDecoration: 'underline', 
                fontWeight: '700', 
                cursor: 'pointer' 
              }}
            >
              devenir partenaire sponsor
            </button>{' '}
            (5 000 MRU / mois).
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

      <ReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)} 
          onReviewSubmitted={refreshReviews}
      />
      <SponsorModal 
          isOpen={isSponsorModalOpen} 
          onClose={() => setIsSponsorModalOpen(false)} 
      />
    </div>
  );
};

export default Home;
