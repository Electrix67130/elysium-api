import fp from 'fastify-plugin';
import websocket from '@fastify/websocket';
import { FastifyInstance } from 'fastify';
import ConnectionManager from '@/lib/connection-manager';

declare module 'fastify' {
  interface FastifyInstance {
    ws: ConnectionManager;
  }
}

async function websocketPlugin(fastify: FastifyInstance) {
  fastify.register(websocket);
  const manager = new ConnectionManager();
  fastify.decorate('ws', manager);
}

export default fp(websocketPlugin, { name: 'websocket', dependencies: ['jwt', 'database'] });
