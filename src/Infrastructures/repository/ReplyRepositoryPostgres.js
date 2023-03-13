const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async add(addReply) {
    const {
      commentId, threadId, content, owner,
    } = addReply;

    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: `INSERT INTO comments(id, content, thread_id, owner, reply_of_id) 
      VALUES($1, $2, $3, $4, $5) 
      RETURNING id, content, owner`,
      values: [id, content, threadId, owner, commentId],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async delete(replyId) {
    const query = {
      text: `UPDATE comments 
      SET is_delete = true 
      WHERE id = $1
      RETURNING id`,
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async verifyExisting(replyId, commentId, threadId) {
    const query = {
      text: `SELECT 1
      FROM comments
      WHERE id = $1 AND reply_of_id = $2 AND thread_id = $3`,
      values: [replyId, commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('Reply / Comment / Thread tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: `SELECT owner
      FROM comments
      WHERE id = $1`,
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('Reply tidak ditemukan');
    }
    if (owner !== result.rows[0].owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  /* eslint-disable camelcase */
  async getReplies(commentIds) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.date,
      users.username, comments.is_delete, comments.reply_of_id
      FROM comments
      LEFT JOIN users ON comments.owner = users.id
      WHERE comments.reply_of_id = ANY($1::text[])
      ORDER BY comments.date ASC`,
      /*
      text: `WITH RECURSIVE replies AS (
        SELECT
        id, content, date, owner, is_delete, reply_of_id
        FROM comments
        WHERE id = ANY($1::text[])
      UNION
        SELECT
        cm.id, cm.content, cm.date, cm.owner, cm.is_delete, cm.reply_of_id
        FROM comments cm
        INNER JOIN replies ON replies.id = cm.reply_of_id
      ) SELECT
          replies.id,
          replies.content,
          replies.date,
          users.username,
          replies.is_delete,
          replies.reply_of_id
        FROM replies
        LEFT JOIN users ON replies.owner = users.id
        WHERE replies.reply_of_id IS NOT NULL
        ORDER BY replies.date ASC`,
      */
      values: [commentIds],
    };
    const result = await this._pool.query(query);

    return new Map(result.rows.map(({
      id, content, date, username, is_delete, reply_of_id,
    }) => [
      id,
      new ReplyDetail({
        id, content, date, username, isDelete: is_delete, replyOfId: reply_of_id,
      }),
    ]));
  }
}

module.exports = ReplyRepositoryPostgres;
