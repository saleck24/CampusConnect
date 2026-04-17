import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, CalendarDays, Users, LogOut, User as UserIcon } from 'lucide-react';
import './App.css'; // Optional page-specific overrides if needed

import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import ConfirmEmail from './pages/ConfirmEmail';
import Annuaire from './pages/Annuaire';
import CreateAssociation from './pages/CreateAssociation';
import AdminPanel from './pages/AdminPanel';
import AssociationDetails from './pages/AssociationDetails';

// --- Placeholder Pages ---
const Home = () => (
  <div className="animate-fade-in text-center mt-4">
    <h1 className="mb-2" style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>
      CampusConnect
    </h1>
    <p className="mb-4" style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
      La plateforme centralisée pour réinventer la vie associative et estudiantine sur votre campus.
    </p>
    <div className="flex justify-center gap-4">
      <Link to="/events" className="btn btn-primary">Explorer les événements</Link>
      <Link to="/associations" className="btn btn-secondary">Découvrir les associations</Link>
    </div>
  </div>
);

const Events = () => <div className="animate-fade-in container mt-4"><h2>Catalogue des événements</h2><p>Bientôt disponible...</p></div>;

// --- Navbar Component ---
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
        <header style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div className="container flex items-center justify-between" style={{ height: '70px' }}>
            <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--color-text-main)', fontWeight: '700', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
              <GraduationCap size={32} color="var(--color-primary)" />
              CampusConnect
            </Link>
            
            <nav className="flex gap-4 items-center">
              <Link to="/events" className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)', fontWeight: '500' }}>
                <CalendarDays size={18} />
                Événements
              </Link>
              <Link to="/associations" className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)', fontWeight: '500' }}>
                <Users size={18} />
                Associations
              </Link>
              {user && (
                 <Link to="/create-association" className="flex items-center gap-2" style={{ color: 'var(--color-accent)', fontWeight: '500' }}>
                   Demande d'Asso
                 </Link>
              )}
               {user && user.role === 'admin' && (
                 <Link to="/admin" className="flex items-center gap-2" style={{ color: 'var(--color-error)', fontWeight: '500' }}>
                   Panel Admin
                 </Link>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="flex items-center gap-1" style={{ color: 'var(--color-text-main)', fontWeight: '500' }}>
                    <UserIcon size={18} />
                    {user.name}
                  </span>
                  <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
                    <LogOut size={18} />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary flex items-center gap-2">
                  <LogIn size={18} />
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </header>
  );
};

// --- Main App Component ---
function App() {
  return (
    <Router>
      <AuthProvider>
      <div className="page-wrapper">
        <Navbar />

        <main className="main-content container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/associations" element={<Annuaire />} />
            <Route path="/associations/:id" element={<AssociationDetails />} />
            <Route path="/create-association" element={<CreateAssociation />} />
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirm/:token" element={<ConfirmEmail />} />
          </Routes>
        </main>
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
