import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { TeamMembershipRow } from './team-membership.schema';

class TeamMembershipService extends BaseService<TeamMembershipRow> {
  constructor(db: Knex) {
    super(db, 'team_membership');
  }

  async findByUserId(userId: string): Promise<TeamMembershipRow[]> {
    return this.findMany({ user_id: userId });
  }

  async findByTeamId(teamId: string): Promise<TeamMembershipRow[]> {
    return this.findMany({ team_id: teamId });
  }

  async findByUserAndTeam(userId: string, teamId: string): Promise<TeamMembershipRow | undefined> {
    return this.findOne({ user_id: userId, team_id: teamId });
  }
}

export default TeamMembershipService;
