# CampusConnect 🎓
> **Plateforme intégrée de gestion de la vie associative et estudiantine.**

CampusConnect est une solution logicielle Fullstack conçue pour répondre aux défis de visibilité et d'organisation des associations universitaires (FST). Elle centralise les flux d'informations, automatise la gestion des inscriptions et optimise la réservation des ressources communes.

---

## 📂 Structure du Projet

L'architecture est strictement découplée pour séparer la logique métier (Backend) de l'interface utilisateur (Frontend).

```text
CampusConnect/
├── backend/                # API REST Node.js & Express
│   ├── config/             # Configurations (Swagger, Database)
│   ├── controllers/        # Logique métier (Auth, Events, Assos)
│   ├── middlewares/        # Sécurité (JWT, RBAC, Uploads)
│   ├── models/             # Abstraction SQL (Requêtes préparées)
│   ├── routes/             # Définition des endpoints API
│   ├── uploads/            # Stockage local des images (logos)
│   └── server.js           # Point d'entrée du serveur
├── frontend/               # Interface React & Vite
│   ├── src/
│   │   ├── components/     # Composants UI réutilisables
│   │   ├── context/        # État global (AuthContext)
│   │   ├── pages/          # Vues principales (Events, Admin, Profile)
│   │   ├── services/       # Client API (Axios instance)
│   │   └── styles/         # Design System (Vanilla CSS)
│   └── vite.config.js      # Configuration Proxy & Build
└── sql/                    # Schémas et migrations de base de données
```

---

## 🛠️ Stack Technique & Justifications

- **Frontend** : `React 18` + `Vite`. Choix de la performance et d'un cycle de rendu optimisé.
- **Backend** : `Node.js` + `Express`. Architecture asynchrone pour gérer de multiples requêtes simultanées.
- **Base de Données** : `MySQL`. Choix de la robustesse transactionnelle pour garantir l'intégrité des inscriptions.
- **Design** : `Vanilla CSS`. Maîtrise totale de l'UI/UX sans dépendances lourdes, garantissant une identité visuelle "Premium".
- **Documentation** : `Swagger / OpenAPI 3.0`. Standardisation de la communication technique.

---

## 🚀 Fonctionnalités Clés (Basées sur le Cahier des Charges)

### 🔐 Identity & Access Management (IAM)
- **Authentification Stateless** : Sécurisée par JSON Web Tokens (JWT).
- **RBAC (Role-Based Access Control)** : Gestion fine des droits pour 4 types d'utilisateurs (*Invité, Étudiant, Responsable, Admin*).
- **Vérification d'identité** : Activation de compte par double opt-in email (Nodemailer).

### 📅 Gestion des Événements & Ressources
- **Algorithme d'Anti-Conflit** : Vérification en temps réel de la disponibilité des salles et des créneaux horaires lors de la création d'événements.
- **Life-Cycle Management** : Création, modification, annulation logique et archivage automatique des événements passés.
- **Tracking des Inscriptions** : Gestion des jauges de capacité et génération de listes de présence pour les responsables.

### 🏢 Centre d'Administration
- **Validation Asynchrone** : Circuit de validation des nouvelles associations par l'équipe CampusConnect.
- **Gouvernance** : Outils de modération des utilisateurs et des contenus.

---

## 📖 Documentation API

L'API est entièrement documentée et testable via l'interface interactive Swagger.
- **URL Locale** : `http://localhost:5000/api-docs`

---

## 📦 Installation & Déploiement

### 1. Pré-requis
- Node.js (v20+)
- Serveur MySQL (WampServer, XAMPP ou installation native)

### 2. Initialisation du Backend
```bash
cd backend
npm install
# Créez votre fichier .env basé sur .env.example
node server.js
```

### 3. Initialisation du Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 Contexte du Projet
CampusConnect a été développé dans le cadre d'un projet universitaire, en suivant strictement les pratiques et les règles du **framework agile Scrum**. Le développement a été rythmé par des itérations (Sprints) permettant d'assurer une livraison continue de valeur métier, conformément aux spécifications du cahier des charges interne.

---
