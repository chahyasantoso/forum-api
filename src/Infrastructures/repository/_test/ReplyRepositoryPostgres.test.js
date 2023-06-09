const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

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
      date: new Date('2023-01-01'),
      owner: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      content: 'a comment',
      date: new Date('2023-01-01'),
      threadId: 'thread-123',
      owner: 'user-123',
      isDelete: false,
    });
  });

  afterAll(async () => {
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
      const row = await CommentsTableTestHelper.findReplyById('reply-123');
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
      const row = await CommentsTableTestHelper.findReplyById('reply-123');
      expect(row[0].is_delete).toEqual(true);

      await CommentsTableTestHelper.cleanReplies();
    });
  });

  describe('verifyExisting function', () => {
    beforeAll(async () => {
      await CommentsTableTestHelper.addReply({
        id: 'reply-123',
        content: 'a reply',
        date: new Date('2023-01-01'),
        threadId: 'thread-123',
        owner: 'user-123',
        commentId: 'comment-123',
        isDelete: false,
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
    beforeAll(async () => {
      await CommentsTableTestHelper.addReply({
        id: 'reply-456',
        content: 'a reply',
        date: new Date('2023-02-01'),
        threadId: 'thread-123',
        owner: 'user-123',
        commentId: 'comment-123',
        isDelete: false,
      });
    });
    it('should return Map of ReplyDetail', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action
      const repliesMap = await replyRepositoryPostgres.getReplies(['comment-123']);

      // Assert
      expect(repliesMap).toBeInstanceOf(Map);
      expect(repliesMap.size).toEqual(2);

      const reply1 = repliesMap.get('reply-123');
      expect(reply1).toStrictEqual(new ReplyDetail({
        id: 'reply-123',
        content: 'a reply',
        date: new Date('2023-01-01'),
        username: 'userA',
        isDelete: false,
        replyOfId: 'comment-123',
      }));

      const reply2 = repliesMap.get('reply-456');
      expect(reply2).toStrictEqual(new ReplyDetail({
        id: 'reply-456',
        content: 'a reply',
        date: new Date('2023-02-01'),
        username: 'userA',
        isDelete: false,
        replyOfId: 'comment-123',
      }));

      expect(new Date(reply1.date).getTime())
        .toBeLessThan(new Date(reply2.date).getTime());
    });
  });
});
