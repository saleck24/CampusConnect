-- Création de la base
CREATE DATABASE IF NOT EXISTS campusconnect;
USE campusconnect;

-- =========================
-- TABLE : USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('invite', 'etudiant', 'responsable', 'admin') DEFAULT 'invite',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE : ASSOCIATIONS
-- =========================
CREATE TABLE IF NOT EXISTS associations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  logo_url VARCHAR(255),
  objectives TEXT,
  membership_conditions TEXT,
  is_validated BOOLEAN DEFAULT FALSE,
  plan ENUM('free', 'premium') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE : ASSOCIATION_MEMBERS
-- =========================
CREATE TABLE IF NOT EXISTS association_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  association_id INT NOT NULL,
  status ENUM('pending', 'approved', 'refused') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_assoc_members_user ON association_members(user_id);
CREATE INDEX idx_assoc_members_assoc ON association_members(association_id);

-- =========================
-- TABLE : EVENTS
-- =========================
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  association_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  location VARCHAR(200),
  max_participants INT,
  guest_price DECIMAL(10,2) DEFAULT 0.00,
  member_price DECIMAL(10,2) DEFAULT 0.00,
  is_paid BOOLEAN DEFAULT FALSE,
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_events_association ON events(association_id);

-- =========================
-- TABLE : REGISTRATIONS
-- =========================
CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  price_applied DECIMAL(10,2),
  payment_status ENUM('pending', 'validated', 'free') DEFAULT 'free',
  payment_proof_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(user_id, event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);

-- =========================
-- TABLE : COMMISSIONS
-- =========================
CREATE TABLE IF NOT EXISTS commissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  association_id INT NOT NULL,
  registration_id INT,
  membership_id INT, -- Optionnel, pour lier à l'adhésion si c'est le type de commission
  type ENUM('event', 'membership') NOT NULL,
  amount DECIMAL(10,2),
  rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL,
  FOREIGN KEY (membership_id) REFERENCES association_members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
