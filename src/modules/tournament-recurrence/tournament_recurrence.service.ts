import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { TournamentRecurrenceRow } from './tournament_recurrence.schema';

class TournamentRecurrenceService extends BaseService<TournamentRecurrenceRow> {
  constructor(db: Knex) {
    super(db, 'tournament_recurrence');
  }

  async findBySourceTournamentId(sourceTournamentId: string): Promise<TournamentRecurrenceRow | undefined> {
    return this.findOne({ source_tournament_id: sourceTournamentId });
  }

  async findActive(): Promise<TournamentRecurrenceRow[]> {
    return this.findMany({ is_active: true } as Partial<TournamentRecurrenceRow>);
  }

  async deactivate(id: string): Promise<TournamentRecurrenceRow | undefined> {
    return this.update(id, { is_active: false } as Partial<TournamentRecurrenceRow>);
  }

  async generateNextOccurrence(recurrenceId: string): Promise<Record<string, unknown> | undefined> {
    const recurrence = await this.findById(recurrenceId);
    if (!recurrence || !recurrence.is_active) return undefined;

    const sourceTournament = await this.db('tournament')
      .where({ id: recurrence.source_tournament_id })
      .first();

    if (!sourceTournament) return undefined;
    if (!sourceTournament.is_official) return undefined;

    // Trouver la derniere occurrence generee (ou le source si aucune)
    const lastOccurrence = await this.db('tournament')
      .where({ recurrence_id: recurrenceId })
      .orderBy('date', 'desc')
      .first();

    const baseDate = lastOccurrence?.date
      ? new Date(lastOccurrence.date)
      : new Date(sourceTournament.date);

    // Calculer la prochaine date
    const nextDate = new Date(baseDate);
    if (recurrence.recurrence_type === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (recurrence.recurrence_type === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    // Verifier qu'on ne depasse pas la date de fin
    if (recurrence.recurrence_end_at && nextDate > new Date(recurrence.recurrence_end_at)) {
      return undefined;
    }

    // Cloner le tournoi source avec la nouvelle date
    const { id, created_at, updated_at, recurrence_id, ...templateData } = sourceTournament;

    const [newTournament] = await this.db('tournament')
      .insert({
        ...templateData,
        date: nextDate.toISOString(),
        status: 'upcoming',
        recurrence_id: recurrenceId,
      })
      .returning('*');

    return newTournament;
  }

  async generateAllPendingOccurrences(recurrenceId: string): Promise<Record<string, unknown>[]> {
    const generated: Record<string, unknown>[] = [];
    const now = new Date();

    let next = await this.generateNextOccurrence(recurrenceId);
    while (next && new Date(next.date as string) <= now) {
      generated.push(next);
      next = await this.generateNextOccurrence(recurrenceId);
    }

    // Generer aussi la prochaine occurrence future
    if (next) {
      generated.push(next);
    }

    return generated;
  }
}

export default TournamentRecurrenceService;
