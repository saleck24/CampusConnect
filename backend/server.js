const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Chargement robuste du .env
try { 
    process.loadEnvFile(path.join(__dirname, '.env')); 
} catch(e) {
    console.log("Note: Fichier .env non chargé via loadEnvFile (déjà chargé ou absent)");
}

const app = express();
console.log(">>> [DEBUG] Serveur en cours d'exécution - Chargement des routes...");

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Raccourci vers les dossiers d'uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Documentation Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes API
const authRoutes = require('./routes/authRoutes');
const associationRoutes = require('./routes/associationRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const statsRoutes = require('./routes/statsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/associations', associationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/reviews', reviewRoutes);

// Routes de test
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API CampusConnect' });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: `Route non trouvée : ${req.method} ${req.originalUrl}` });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Une erreur serveur est survenue' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Serveur CampusConnect démarré sur le port ${PORT}`);
    console.log(`Routes actives sous /api/...`);
    console.log(`Documentation Swagger : http://localhost:${PORT}/api-docs`);
    console.log(`=========================================`);
});
