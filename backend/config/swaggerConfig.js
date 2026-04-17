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
        email: 'support@campusconnect.fr'
      },
    },
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
