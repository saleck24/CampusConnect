# CampusConnect 🎓

**CampusConnect** est une plateforme web moderne conçue pour dynamiser la vie estudiantine et associative. Elle permet aux étudiants de découvrir les événements du campus, de s'impliquer dans des associations et de centraliser les échanges au sein des établissements universitaires.

## 🚀 Fonctionnalités Actuelles (Sprint 1)

### Authentification & Sécurité
- Inscription et signature d'e-mail pour activation.
- Connexion sécurisée via JWT (JSON Web Token).
- Gestion des rôles (Invité, Étudiant, Responsable, Administrateur).

### Vie Associative
- Annuaire public des associations validées.
- Formulaire complet de demande de création d'association (avec upload de logo).
- Panel d'administration pour la validation et le suivi des demandes.

## 🛠️ Stack Technique

- **Frontend** : React.js (Vite), Lucide-React for icons, Vanilla CSS (Premium Design).
- **Backend** : Node.js, Express.js.
- **Base de données** : MySQL.
- **Emailing** : Nodemailer (SMTP Gmail).

## 📦 Installation

### Pré-requis
- Node.js (v20+)
- WampServer ou MySQL (port 3306)

### Lancement du Projet

1. **Base de données** : Importez le fichier `/sql/CampusConnect.sql` dans votre MySQL.
2. **Backend** :
   ```bash
   cd backend
   npm install
   # Configurez votre .env sur le modèle de .env.example
   node server.js
   ```
3. **Frontend** :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📝 Auteurs
Projet développé dans le cadre d'un projet universitaire.
