import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ConfirmEmail from './pages/ConfirmEmail';
import Annuaire from './pages/Annuaire';
import CreateAssociation from './pages/CreateAssociation';
import AdminPanel from './pages/AdminPanel';
import ResponsablePanel from './pages/ResponsablePanel';
import AssociationDetails from './pages/AssociationDetails';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventParticipants from './pages/EventParticipants';
import EventDetail from './pages/EventDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="page-wrapper">
          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/events/:id/participants" element={<EventParticipants />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/edit-event/:id" element={<EditEvent />} />
              <Route path="/associations" element={<Annuaire />} />
              <Route path="/associations/:id" element={<AssociationDetails />} />
              <Route path="/create-association" element={<CreateAssociation />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/responsable-panel" element={<ResponsablePanel />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/confirm/:token" element={<ConfirmEmail />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
