import { Knex } from 'knex';
import BaseService from '@/lib/base-service';
import { UserRow } from './user.schema';

class UserService extends BaseService<UserRow> {
  constructor(db: Knex) {
    super(db, 'user');
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    return this.findOne({ email });
  }

  async findByUsername(username: string): Promise<UserRow | undefined> {
    return this.findOne({ username });
  }
}

export default UserService;
