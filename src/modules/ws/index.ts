import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import WsHandler from './ws.handler';

export default fp((fastify: FastifyInstance, opts, done) => {
  const handler = new WsHandler(fastify.db, fastify.ws);

  fastify.get('/ws', { websocket: true }, async (socket, request) => {
    // Auth via query param (les browsers ne supportent pas les headers custom sur WS)
    const token = (request.query as Record<string, string>).token;
    if (!token) {
      socket.send(JSON.stringify({ type: 'error', message: 'Missing token' }));
      socket.close(4401, 'Unauthorized');
      return;
    }

    let user: { sub: string; email: string };
    try {
      user = fastify.jwt.verify(token) as { sub: string; email: string };
    } catch {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
      socket.close(4401, 'Unauthorized');
      return;
    }

    const userId = user.sub;

    // Enregistrer la connexion
    fastify.ws.add(userId, socket);
    await handler.handleConnect(userId);

    // Heartbeat ping/pong
    const pingInterval = setInterval(() => {
      if (socket.readyState === socket.OPEN) {
        socket.ping();
      }
    }, 30000);

    socket.on('message', async (raw: Buffer) => {
      try {
        await handler.handleMessage(userId, socket, raw.toString());
      } catch (err) {
        fastify.log.error(err, 'WebSocket message handler error');
        socket.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
      }
    });

    socket.on('close', async () => {
      clearInterval(pingInterval);
      fastify.ws.remove(userId, socket);
      try {
        await handler.handleDisconnect(userId);
      } catch (err) {
        fastify.log.error(err, 'WebSocket disconnect handler error');
      }
    });

    socket.on('error', (err: Error) => {
      fastify.log.error(err, 'WebSocket error');
    });
  });

  done();
}, { name: 'ws-module', dependencies: ['websocket', 'database'] });
