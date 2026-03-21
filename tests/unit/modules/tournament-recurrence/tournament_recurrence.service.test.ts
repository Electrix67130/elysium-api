import TournamentRecurrenceService from '@/modules/tournament-recurrence/tournament_recurrence.service';

function createMockDb() {
  const mock = jest.fn(() => mock) as any;
  mock.where = jest.fn(() => mock);
  mock.orderBy = jest.fn(() => mock);
  mock.first = jest.fn();
  mock.insert = jest.fn(() => mock);
  mock.returning = jest.fn();
  mock.fn = { now: jest.fn(() => 'NOW()') };
  return mock;
}

describe('TournamentRecurrenceService', () => {
  let service: InstanceType<typeof TournamentRecurrenceService>;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new TournamentRecurrenceService(mockDb as unknown as import('knex').Knex);
  });

  it('should set table name to "tournament_recurrence"', () => {
    expect(service.table).toBe('tournament_recurrence');
  });

  describe('findBySourceTournamentId', () => {
    it('should query with source_tournament_id', async () => {
      mockDb.first.mockResolvedValue({ id: 'rec-1' });
      await service.findBySourceTournamentId('tid');
      expect(mockDb.where).toHaveBeenCalledWith({ source_tournament_id: 'tid' });
    });
  });

  describe('findActive', () => {
    it('should query with is_active true', async () => {
      mockDb.where.mockResolvedValue([]);
      await service.findActive();
      expect(mockDb.where).toHaveBeenCalledWith({ is_active: true });
    });
  });

  describe('deactivate', () => {
    it('should update is_active to false', async () => {
      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({ id: 'rec-1', is_active: false } as any);
      await service.deactivate('rec-1');
      expect(updateSpy).toHaveBeenCalledWith('rec-1', { is_active: false });
    });
  });

  describe('generateNextOccurrence', () => {
    it('should return undefined for non-existent recurrence', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(undefined);
      const result = await service.generateNextOccurrence('non-existent');
      expect(result).toBeUndefined();
    });

    it('should return undefined for inactive recurrence', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: 'rec-1',
        source_tournament_id: 'tid',
        recurrence_type: 'weekly',
        is_active: false,
        created_at: '',
        updated_at: '',
      });
      const result = await service.generateNextOccurrence('rec-1');
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-official source tournament', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: 'rec-1',
        source_tournament_id: 'tid',
        recurrence_type: 'weekly',
        is_active: true,
        created_at: '',
        updated_at: '',
      });
      mockDb.first.mockResolvedValue({ id: 'tid', is_official: false, date: '2026-03-20T20:00:00Z' });

      const result = await service.generateNextOccurrence('rec-1');
      expect(result).toBeUndefined();
    });

    it('should generate weekly occurrence with correct date', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: 'rec-1',
        source_tournament_id: 'tid',
        recurrence_type: 'weekly',
        is_active: true,
        created_at: '',
        updated_at: '',
      });

      // Source tournament query
      mockDb.first
        .mockResolvedValueOnce({
          id: 'tid',
          name: 'Weekly Cup',
          game_id: 'gid',
          organizer_id: 'oid',
          is_official: true,
          date: '2026-03-20T20:00:00.000Z',
          status: 'completed',
          max_players: 16,
        })
        // Last occurrence query (none)
        .mockResolvedValueOnce(null);

      const newTournament = { id: 'new-id', name: 'Weekly Cup', date: '2026-03-27T20:00:00.000Z' };
      mockDb.returning.mockResolvedValue([newTournament]);

      const result = await service.generateNextOccurrence('rec-1');
      expect(result).toEqual(newTournament);
      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'upcoming',
          recurrence_id: 'rec-1',
        }),
      );
    });

    it('should return undefined when next date exceeds recurrence_end_at', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: 'rec-1',
        source_tournament_id: 'tid',
        recurrence_type: 'weekly',
        recurrence_end_at: '2026-03-25T00:00:00Z',
        is_active: true,
        created_at: '',
        updated_at: '',
      });

      mockDb.first
        .mockResolvedValueOnce({
          id: 'tid',
          name: 'Weekly Cup',
          game_id: 'gid',
          organizer_id: 'oid',
          is_official: true,
          date: '2026-03-20T20:00:00.000Z',
        })
        .mockResolvedValueOnce(null);

      const result = await service.generateNextOccurrence('rec-1');
      expect(result).toBeUndefined();
    });

    it('should base next date on last occurrence when one exists', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: 'rec-1',
        source_tournament_id: 'tid',
        recurrence_type: 'monthly',
        is_active: true,
        created_at: '',
        updated_at: '',
      });

      mockDb.first
        .mockResolvedValueOnce({
          id: 'tid',
          name: 'Monthly Cup',
          game_id: 'gid',
          organizer_id: 'oid',
          is_official: true,
          date: '2026-01-15T20:00:00.000Z',
        })
        // Last occurrence exists
        .mockResolvedValueOnce({
          id: 'occ-3',
          date: '2026-03-15T20:00:00.000Z',
        });

      const newTournament = { id: 'new-id', date: '2026-04-15T20:00:00.000Z' };
      mockDb.returning.mockResolvedValue([newTournament]);

      const result = await service.generateNextOccurrence('rec-1');
      expect(result).toEqual(newTournament);
    });
  });
});
