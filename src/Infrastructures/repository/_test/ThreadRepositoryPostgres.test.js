const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');

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
      const addThread = new AddThread({
        title: 'a title',
        body: 'a body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.add(addThread);

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
        date: new Date('2023-01-01'),
        owner: 'user-123',
      });
    });

    it('should throw error when thread not exists', async () => {
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

  describe('getThreadDetail function', () => {
    it('should throw error when thread not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadDetail('xxx'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should return a ThreadDetail', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadDetail('thread-123');
      expect(thread).toStrictEqual(new ThreadDetail({
        id: 'thread-123',
        title: 'a title',
        body: 'a body',
        date: new Date('2023-01-01'),
        username: 'userA',
      }));
    });
  });
});
