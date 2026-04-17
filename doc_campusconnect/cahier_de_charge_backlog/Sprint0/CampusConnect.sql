 -- Création de la base
CREATE DATABASE IF NOT EXISTS gestion_evenements;
USE gestion_evenements;

-- =========================
-- TABLE : USERS
-- =========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ETUDIANT', 'RESPONSABLE', 'ADMIN') NOT NULL,
    est_valide BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE INDEX idx_users_email ON users(email);

-- =========================
-- TABLE : ASSOCIATIONS
-- =========================
CREATE TABLE associations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    responsable_id INT UNIQUE,

    CONSTRAINT fk_associations_responsable
    FOREIGN KEY (responsable_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Index FK
CREATE INDEX idx_associations_responsable ON associations(responsable_id);

-- =========================
-- TABLE : EVENTS
-- =========================
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    association_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,

    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,

    location VARCHAR(150),
    max_participants INT CHECK (max_participants > 0),

    statut ENUM('ACTIF', 'ANNULE', 'TERMINE') DEFAULT 'ACTIF',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_events_association
    FOREIGN KEY (association_id) REFERENCES associations(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Index FK + recherche fréquente
CREATE INDEX idx_events_association ON events(association_id);
CREATE INDEX idx_events_dates ON events(date_debut, date_fin);

-- =========================
-- TABLE : REGISTRATIONS
-- =========================
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,

    statut ENUM('CONFIRME', 'ANNULE') DEFAULT 'CONFIRME',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_registrations_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    CONSTRAINT fk_registrations_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    UNIQUE (user_id, event_id)
) ENGINE=InnoDB;

-- Index pour performances
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);