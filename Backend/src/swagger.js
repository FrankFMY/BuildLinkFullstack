const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fullstack API',
            version: '1.0.0',
            description: 'Документация REST API (auth, ads)',
        },
        servers: [{ url: 'http://localhost:8000' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
