exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  pgm.addConstraint(
    'threads',
    'fk_threads.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('threads');
};
