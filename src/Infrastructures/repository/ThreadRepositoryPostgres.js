const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async add(addThread) {
    const { title, body, owner } = addThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: `INSERT INTO threads(id, title, body, owner) 
      VALUES($1, $2, $3, $4) 
      RETURNING id, title, owner`,
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);
    return new AddedThread(result.rows[0]);
  }

  async verifyExisting(threadId) {
    const query = {
      text: `SELECT 1
      FROM threads
      WHERE id = $1`,
      values: [threadId],
    };
    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }

  async getThreadDetail(threadId) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username 
      FROM threads
      LEFT JOIN users ON threads.owner = users.id
      WHERE threads.id = $1`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return new ThreadDetail(result.rows[0]);
  }
}

module.exports = ThreadRepositoryPostgres;
