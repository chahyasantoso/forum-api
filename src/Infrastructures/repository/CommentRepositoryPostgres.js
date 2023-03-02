const AddedComment = require('../../Domains/comments/entities/AddedComment');
const Comment = require('../../Domains/comments/entities/Comment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async add(newComment) {
    const { threadId, content, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: `INSERT INTO comments(id, content, date, thread_id, owner) 
        VALUES($1, $2, $3, $4, $5) 
        RETURNING id, content, owner`,
      values: [id, content, date, threadId, owner],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async deleteById(commentId, threadId) {
    const query = {
      text: `UPDATE comments 
        SET is_delete = true 
        WHERE id = $1 AND thread_id = $2
        RETURNING id`,
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('Comment/Thread tidak ditemukan');
    }
  }

  async getCommentById(commentId, threadId) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.date, users.username 
      FROM comments
      LEFT JOIN users ON comments.owner = users.id
      WHERE comments.id = $1 AND comments.thread_id = $2`,
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Comment/Thread tidak ditemukan');
    }
    return new Comment({ ...result.rows[0] });
  }

  async verifyOwner(commentId, threadId, owner) {
    const query = {
      text: `SELECT owner
        FROM comments
        WHERE id = $1 AND thread_id = $2`,
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('Comment/Thread tidak ditemukan');
    }
    if (owner !== result.rows[0].owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = CommentRepositoryPostgres;
