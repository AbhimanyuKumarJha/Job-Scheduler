import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openAPISpec } from '../docs';

export const setupSwagger = (app: Express): void => {
    // Swagger UI options
    const swaggerOptions = {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Job Scheduler API Documentation',
        customfavIcon: '/favicon.ico',
    };

    // Serve Swagger UI
    app.use('/docs', swaggerUi.serve);
    app.get('/docs', swaggerUi.setup(openAPISpec, swaggerOptions));

    // Serve OpenAPI spec as JSON
    app.get('/docs/openapi.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(openAPISpec);
    });

    console.log('📚 Swagger documentation available at /docs');
    console.log('📄 OpenAPI spec available at /docs/openapi.json');
};
