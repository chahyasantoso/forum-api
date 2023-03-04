const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'userA',
      password: 'xxx',
      fullname: 'user A fullname',
    });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      date: '1/1/2023',
      owner: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      content: 'a comment',
      date: '1/1/2023',
      threadId: 'thread-123',
      owner: 'user-123',
    });
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('add function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        commentId: 'comment-123',
        threadId: 'thread-123',
        content: 'a comment',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.add(addReply);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: addReply.content,
        owner: addReply.owner,
      }));
      const row = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(row).toHaveLength(1);
    });
  });

  describe('delete function', () => {
    it('should delete reply successfuly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action
      await replyRepositoryPostgres.delete('reply-123');

      // Assert
      const row = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(row[0].is_delete).toEqual(true);

      await RepliesTableTestHelper.cleanTable();
    });
  });

  describe('verifyExisting function', () => {
    beforeAll(async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'a reply',
        date: '1/1/2023',
        threadId: 'thread-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });
    });

    it('should throw NotFoundError error when a reply / a comment / a thread is not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyExisting('xxx', 'yyy', 'zzz'))
        .rejects
        .toThrow(NotFoundError);
      await expect(replyRepositoryPostgres.verifyExisting('reply-123', 'comment-123', 'xxx'))
        .rejects
        .toThrow(NotFoundError);
      await expect(replyRepositoryPostgres.verifyExisting('reply-123', 'xxx', 'thread-123'))
        .rejects
        .toThrow(NotFoundError);
      await expect(replyRepositoryPostgres.verifyExisting('xxx', 'comment-123', 'thread-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should not throw error when a reply exist within comment and thread', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyExisting('reply-123', 'comment-123', 'thread-123'))
        .resolves
        .not.toThrow();
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError error when a reply is not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('xxx', 'user-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw Authorization error when a reply is not owned', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'xxx'))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should not throw error when a reply owned', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves
        .not.toThrow();
    });
  });

  describe('getReplies function', () => {
    it('should return array of ReplyDetail', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action
      const replies = await replyRepositoryPostgres.getReplies('comment-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toStrictEqual(new ReplyDetail({
        id: 'reply-123',
        content: 'a reply',
        date: '1/1/2023',
        username: 'userA',
        isDelete: false,
      }));
    });
  });
});
