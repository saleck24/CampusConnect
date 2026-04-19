const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API CampusConnect',
      version: '1.0.0',
      description: 'Documentation interactive de l\'API pour le projet CampusConnect. Cette interface permet de tester les endpoints de gestion des associations, utilisateurs et événements.',
      contact: {
        name: 'Support CampusConnect',
        email: 'campustoconnected@gmail.com'
      },
    },
    tags: [
      { name: 'Auth', description: 'Gestion de l\'authentification' },
      { name: 'Admin', description: 'Opérations réservées à l\'administrateur' },
      { name: 'Associations', description: 'Gestion des clubs et associations' },
      { name: 'Events', description: 'Gestion des événements du campus' },
      { name: 'Stats', description: 'Statistiques publiques de la plateforme' },
      { name: 'Reviews', description: 'Avis et retours d\'expérience' }
    ],
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de Développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  // Fichiers à scanner pour les annotations Swagger (JSDoc)
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
