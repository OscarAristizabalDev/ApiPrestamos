import 'express';

declare module 'express-serve-static-core' {
    interface Request {
        cookies: {
            [key: string]: string;
        };
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        cookies: {
            [key: string]: string;
        };
    }
}