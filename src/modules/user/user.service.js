const BaseService = require('../../lib/base-service');

class UserService extends BaseService {
  constructor(db) {
    super(db, 'user');
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findByUsername(username) {
    return this.findOne({ username });
  }
}

module.exports = UserService;
