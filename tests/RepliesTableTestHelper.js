/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'a reply', date = '1/1/2023', threadId = 'thread-123', owner = 'user-123', commentId = 'comment-123',
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, date, thread_id, owner, reply_of_id) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, threadId, owner, commentId],
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

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE reply_of_id IS NOT NULL');
  },
};

module.exports = RepliesTableTestHelper;
