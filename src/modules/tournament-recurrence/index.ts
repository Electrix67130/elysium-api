import fp from 'fastify-plugin';
import { z } from 'zod';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import TournamentRecurrenceService from './tournament_recurrence.service';
import { createTournamentRecurrenceSchema, updateTournamentRecurrenceSchema } from './tournament_recurrence.schema';

const crud = new CrudRouteBuilder({
  prefix: '/tournament-recurrences',
  service: (fastify) => new TournamentRecurrenceService(fastify.db),
  schemas: { create: createTournamentRecurrenceSchema, update: updateTournamentRecurrenceSchema },
  entityName: 'TournamentRecurrence',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, () => {
    const service = new TournamentRecurrenceService(fastify.db);

    // POST /tournament-recurrences/:id/generate — genere la prochaine occurrence
    fastify.post('/tournament-recurrences/:id/generate', async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

      const recurrence = await service.findById(id);
      if (!recurrence) return reply.notFound('TournamentRecurrence not found');

      if (!recurrence.is_active) {
        return reply.badRequest('This recurrence is inactive');
      }

      // Verifier que le tournoi source est officiel
      const sourceTournament = await fastify.db('tournament')
        .where({ id: recurrence.source_tournament_id })
        .first();

      if (!sourceTournament?.is_official) {
        return reply.badRequest('Only official tournaments can have recurrences');
      }

      const newTournament = await service.generateNextOccurrence(id);
      if (!newTournament) {
        return reply.badRequest('No more occurrences to generate (end date reached or missing source date)');
      }

      return reply.code(201).send(newTournament);
    });

    // POST /tournament-recurrences/:id/generate-all — genere toutes les occurrences en attente
    fastify.post('/tournament-recurrences/:id/generate-all', async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

      const recurrence = await service.findById(id);
      if (!recurrence) return reply.notFound('TournamentRecurrence not found');

      if (!recurrence.is_active) {
        return reply.badRequest('This recurrence is inactive');
      }

      const tournaments = await service.generateAllPendingOccurrences(id);
      return reply.code(201).send(tournaments);
    });

    // PATCH /tournament-recurrences/:id/deactivate — desactive la recurrence
    fastify.patch('/tournament-recurrences/:id/deactivate', async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

      const recurrence = await service.deactivate(id);
      if (!recurrence) return reply.notFound('TournamentRecurrence not found');

      return recurrence;
    });

    done();
  });
}, { name: 'tournament-recurrence-module' });
