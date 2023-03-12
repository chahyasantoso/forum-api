/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_delete: {
      type: 'BOOLEAN',
      default: false,
    },
    reply_of_id: {
      type: 'VARCHAR(50)',
    },
  });
  pgm.addConstraint(
    'comments',
    'fk_comments.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id)',
  );
  pgm.addConstraint(
    'comments',
    'fk_comments.thread_id_threads.id',
    'FOREIGN KEY(thread_id) REFERENCES threads(id)',
  );
  pgm.addConstraint(
    'comments',
    'fk_comments.reply_of_id_comments.id',
    'FOREIGN KEY(reply_of_id) REFERENCES comments(id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
