import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import env from '@/config/env';

const PUBLIC_ROUTES = ['/health'];

async function apiKey(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    if (PUBLIC_ROUTES.includes(request.url)) return;

    // Pour WebSocket, l'API key est passee en query param (pas de headers custom possibles)
    const query = request.query as Record<string, string>;
    const key = request.headers['x-api-key'] || query.api_key;

    if (!key || key !== env.API_KEY) {
      return reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Invalid or missing API key',
      });
    }
  });
}

export default fp(apiKey, { name: 'api-key' });
