const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
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
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('add function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'a comment',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.add(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: addComment.content,
        owner: addComment.owner,
      }));
      const row = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(row).toHaveLength(1);
    });
  });

  describe('delete function', () => {
    it('should delete comment successfuly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action
      await commentRepositoryPostgres.delete('comment-123');

      // Assert
      const row = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(row[0].is_delete).toEqual(true);

      await CommentsTableTestHelper.cleanTable();
    });
  });

  describe('verifyExisting function', () => {
    beforeAll(async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'a comment',
        date: new Date('2023-01-01'),
        threadId: 'thread-123',
        owner: 'user-123',
        isDelete: false,
      });
    });
    it('should throw NotFoundError error when a comment and/or a thread is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyExisting('xxx', 'yyy'))
        .rejects
        .toThrow(NotFoundError);
      await expect(commentRepositoryPostgres.verifyExisting('comment-123', 'yyy'))
        .rejects
        .toThrow(NotFoundError);
      await expect(commentRepositoryPostgres.verifyExisting('xxx', 'thread-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should not throw error when a comment exist within a thread', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyExisting('comment-123', 'thread-123'))
        .resolves
        .not.toThrow();
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError error when a comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('xxx', 'user-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw Authorization error when a comment is not owned', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'xxx'))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should not throw error when a comment owned', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .resolves
        .not.toThrow();
    });
  });

  describe('getComments function', () => {
    beforeAll(async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        content: 'a comment',
        date: new Date('2023-02-01'),
        threadId: 'thread-123',
        owner: 'user-123',
        isDelete: false,
      });
    });
    it('should return array of CommentDetail', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action
      const comments = await commentRepositoryPostgres.getComments('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0]).toStrictEqual(new CommentDetail({
        id: 'comment-123',
        content: 'a comment',
        date: new Date('2023-01-01').toISOString(),
        username: 'userA',
        isDelete: false,
      }));

      expect(comments[1]).toStrictEqual(new CommentDetail({
        id: 'comment-456',
        content: 'a comment',
        date: new Date('2023-02-01').toISOString(),
        username: 'userA',
        isDelete: false,
      }));

      expect(new Date(comments[0].date).getTime())
        .toBeLessThan(new Date(comments[1].date).getTime());
    });
  });
});
