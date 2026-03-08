/**
 * Base service for CRUD operations.
 * Every module's service extends this class.
 *
 * Usage:
 *   class UserService extends BaseService {
 *     constructor(db) { super(db, 'user'); }
 *   }
 */
class BaseService {
  constructor(db, tableName) {
    this.db = db;
    this.table = tableName;
  }

  // --------------- READ ---------------

  async findAll({ page = 1, limit = 20, orderBy = 'created_at', order = 'desc' } = {}) {
    const offset = (page - 1) * limit;

    const [items, [{ count }]] = await Promise.all([
      this.db(this.table)
        .select('*')
        .orderBy(orderBy, order)
        .limit(limit)
        .offset(offset),
      this.db(this.table).count('* as count'),
    ]);

    return {
      data: items,
      meta: {
        total: parseInt(count, 10),
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id) {
    return this.db(this.table).where({ id }).first();
  }

  async findOne(where) {
    return this.db(this.table).where(where).first();
  }

  async findMany(where) {
    return this.db(this.table).where(where);
  }

  // --------------- CREATE ---------------

  async create(data) {
    const [row] = await this.db(this.table).insert(data).returning('*');
    return row;
  }

  async createMany(dataArray) {
    return this.db(this.table).insert(dataArray).returning('*');
  }

  // --------------- UPDATE ---------------

  async update(id, data) {
    const [row] = await this.db(this.table)
      .where({ id })
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return row;
  }

  // --------------- DELETE ---------------

  async delete(id) {
    const deleted = await this.db(this.table).where({ id }).del();
    return deleted > 0;
  }

  async softDelete(id) {
    return this.update(id, { deleted_at: this.db.fn.now() });
  }
}

module.exports = BaseService;
