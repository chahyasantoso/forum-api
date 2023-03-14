const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

const testData = {
  users: [],
  tokens: [],
  threads: [],
  comments: [],
};

describe('/threads endpoint', () => {
  beforeAll(async () => {
    testData.users[0] = await ServerTestHelper.addUser({
      username: 'userA',
      password: 'xxx',
      fullname: 'user A full name',
    });

    testData.users[1] = await ServerTestHelper.addUser({
      username: 'userB',
      password: 'xxx',
      fullname: 'user B full name',
    });

    testData.tokens[0] = await ServerTestHelper.login({
      username: 'userA',
      password: 'xxx',
    });

    testData.tokens[1] = await ServerTestHelper.login({
      username: 'userB',
      password: 'xxx',
    });

    testData.threads[0] = await ServerTestHelper.addThread({
      title: 'a thred by user A',
      body: 'a body',
    }, testData.tokens[0].accessToken);

    testData.comments[0] = await ServerTestHelper.addComment({
      content: 'a comment by user A',
    }, testData.threads[0].id, testData.tokens[0].accessToken);
  });

  afterAll(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when no authentication provided', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/xxx/comments/${testData.comments[0].id}/likes`,
        headers: {
          Authorization: `Bearer ${testData.tokens[1].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 404 when comment is not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${testData.threads[0].id}/comments/xxx/likes`,
        headers: {
          Authorization: `Bearer ${testData.tokens[1].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 200 when a user likes a comment', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/likes`,
        headers: {
          Authorization: `Bearer ${testData.tokens[1].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    describe('after a user like a comment', () => {
      it('should response 200 and returns thread detail with comments likeCount', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'GET',
          url: `/threads/${testData.threads[0].id}`,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.thread).toBeDefined();
        expect(responseJson.data.thread.id).toEqual(testData.threads[0].id);
        expect(responseJson.data.thread.title).toEqual(testData.threads[0].title);
        expect(responseJson.data.thread.body).not.toEqual('');
        expect(responseJson.data.thread.date).not.toEqual('');
        expect(responseJson.data.thread.username).toEqual(testData.users[0].username);
        expect(responseJson.data.thread.comments).toBeDefined();
        expect(responseJson.data.thread.comments).toHaveLength(1);

        const [comment1] = responseJson.data.thread.comments;
        expect(comment1.id).toEqual(testData.comments[0].id);
        expect(comment1.content).toEqual(testData.comments[0].content);
        expect(comment1.date).not.toEqual('');
        expect(comment1.username).toEqual(testData.users[0].username);
        expect(comment1.likeCount).toBeDefined();
        expect(comment1.likeCount).toEqual(1);
      });
    });

    describe('after a user unlike a comment', () => {
      it('should response 200 and returns thread detail with comments likeCount', async () => {
        // Arrange
        await ServerTestHelper
          .like(testData.threads[0].id, testData.comments[0].id, testData.tokens[1].accessToken);

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'GET',
          url: `/threads/${testData.threads[0].id}`,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.thread).toBeDefined();
        expect(responseJson.data.thread.id).toEqual(testData.threads[0].id);
        expect(responseJson.data.thread.title).toEqual(testData.threads[0].title);
        expect(responseJson.data.thread.body).not.toEqual('');
        expect(responseJson.data.thread.date).not.toEqual('');
        expect(responseJson.data.thread.username).toEqual(testData.users[0].username);
        expect(responseJson.data.thread.comments).toBeDefined();
        expect(responseJson.data.thread.comments).toHaveLength(1);

        const [comment1] = responseJson.data.thread.comments;
        expect(comment1.id).toEqual(testData.comments[0].id);
        expect(comment1.content).toEqual(testData.comments[0].content);
        expect(comment1.date).not.toEqual('');
        expect(comment1.username).toEqual(testData.users[0].username);
        expect(comment1.likeCount).toBeDefined();
        expect(comment1.likeCount).toEqual(0);
      });
    });
  });
});
