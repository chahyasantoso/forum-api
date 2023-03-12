const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async add(addComment) {
    const { threadId, content, owner } = addComment;

    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: `INSERT INTO comments(id, content, thread_id, owner) 
      VALUES($1, $2, $3, $4) 
      RETURNING id, content, owner`,
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
  }

  async delete(commentId) {
    const query = {
      text: `UPDATE comments 
      SET is_delete = true 
      WHERE id = $1
      RETURNING id`,
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyExisting(commentId, threadId) {
    const query = {
      text: `SELECT 1
      FROM comments
      WHERE id = $1 AND thread_id = $2`,
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('Comment / Thread tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: `SELECT owner
      FROM comments
      WHERE id = $1`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('Comment tidak ditemukan');
    }
    if (owner !== result.rows[0].owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  /* eslint-disable camelcase */
  async getComments(threadId) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.date, users.username, comments.is_delete 
      FROM comments
      LEFT JOIN users ON comments.owner = users.id
      WHERE comments.thread_id = $1 AND comments.reply_of_id IS NULL
      ORDER BY comments.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);

    return result.rows.map(({
      id, content, date, username, is_delete,
    }) => new CommentDetail({
      id, content, date, username, isDelete: is_delete,
    }));
  }
}

module.exports = CommentRepositoryPostgres;
