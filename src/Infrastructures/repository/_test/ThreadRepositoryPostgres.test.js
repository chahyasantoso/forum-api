const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const Thread = require('../../../Domains/threads/entities/Thread');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'userA',
      password: 'xxx',
      fullname: 'user A fullname',
    });
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('add function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'a title',
        body: 'a body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.add(newThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'a title',
        owner: 'user-123',
      }));
      const row = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(row).toHaveLength(1);

      await ThreadsTableTestHelper.cleanTable();
    });
  });

  describe('verifyExisting function', () => {
    beforeAll(async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a title',
        body: 'a body',
        date: '1/1/2023',
        owner: 'user-123',
      });
    });

    it('should throw error when thread not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyExisting('xxx'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should not throw error when thread exists', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyExisting('thread-123'))
        .resolves
        .not.toThrow();
    });
  });

  describe('getThreadById function', () => {
    it('should throw error when thread not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('xxx'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should return a Thread', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');
      expect(thread).toStrictEqual(new Thread({
        id: 'thread-123',
        title: 'a title',
        body: 'a body',
        date: '1/1/2023',
        username: 'userA',
      }));
    });
  });
});
