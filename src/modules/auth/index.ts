import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import AuthService from './auth.service';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema';

export default fp((fastify: FastifyInstance, _opts, done) => {
  const authService = new AuthService(fastify);

  // POST /auth/register
  fastify.post('/auth/register', async (request, reply) => {
    const data = registerSchema.parse(request.body);
    const result = await authService.register(data);
    return reply.code(201).send(result);
  });

  // POST /auth/login
  fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body);
    const result = await authService.login(email, password);
    return reply.send(result);
  });

  // POST /auth/refresh
  fastify.post('/auth/refresh', async (request, reply) => {
    const { refresh_token } = refreshSchema.parse(request.body);
    const result = await authService.refresh(refresh_token);
    return reply.send(result);
  });

  // POST /auth/logout (protected)
  fastify.post('/auth/logout', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await authService.logout(request.user.sub);
    return reply.code(204).send();
  });

  // GET /auth/me (protected)
  fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await fastify.db('user').where({ id: request.user.sub }).first();
    if (!user) return reply.notFound('User not found');
    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  });

  done();
}, { name: 'auth-module' });
