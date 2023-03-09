/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'a comment', date = '1/1/2023', threadId = 'thread-123', owner = 'user-123', isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, date, thread_id, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, threadId, owner, isDelete],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },

  async addReply({
    id = 'reply-123', content = 'a reply', date = '1/1/2023',
    threadId = 'thread-123', owner = 'user-123', commentId = 'comment-123', isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, date, thread_id, owner, reply_of_id, is_delete) VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, content, date, threadId, owner, commentId, isDelete],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanReplies() {
    await pool.query('DELETE FROM comments WHERE reply_of_id IS NOT NULL');
  },
};

module.exports = CommentsTableTestHelper;
