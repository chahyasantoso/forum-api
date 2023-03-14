const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
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

    // add thread using userA accessToken
    testData.threads[0] = await ServerTestHelper.addThread({
      title: 'a title',
      body: 'a body',
    }, testData.tokens[0].accessToken);
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 when no authentication provided', async () => {
      // Arrange
      const requestPayload = {
        content: 'a comment',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${testData.threads[0].id}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'a title',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${testData.tokens[0].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${testData.threads[0].id}/comments`,
        payload: {},
        headers: {
          Authorization: `Bearer ${testData.tokens[0].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${testData.threads[0].id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${testData.tokens[0].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 201 and persisted comments', async () => {
      // Arrange
      const requestPayload = {
        content: 'a comment',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${testData.threads[0].id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${testData.tokens[0].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');

      expect(responseJson.data).toHaveProperty('addedComment');
      expect(responseJson.data.addedComment).toHaveProperty('id', expect.any(String));
      expect(responseJson.data.addedComment).toHaveProperty('content', requestPayload.content);
      expect(responseJson.data.addedComment).toHaveProperty('owner', testData.users[0].id);

      const rows = await CommentsTableTestHelper.findCommentById(responseJson.data.addedComment.id);
      expect(rows).toHaveLength(1);

      await CommentsTableTestHelper.cleanTable();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    beforeAll(async () => {
      // add comment with user A accessToken
      testData.comments[0] = await ServerTestHelper.addComment({
        content: 'comment by user A',
      }, testData.threads[0].id, testData.tokens[0].accessToken);

      // add comment with user B accessToken
      testData.comments[1] = await ServerTestHelper.addComment({
        content: 'comment by user B',
      }, testData.threads[0].id, testData.tokens[1].accessToken);
    });

    it('should response 401 when no authentication provided', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/xxx/comments/${testData.comments[0].id}`,
        headers: {
          Authorization: `Bearer ${testData.tokens[0].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${testData.threads[0].id}/comments/xxx`,
        headers: {
          Authorization: `Bearer ${testData.tokens[0].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 403 when a user try to delete another user comment', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}`,
        headers: {
          Authorization: `Bearer ${testData.tokens[1].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 200 when a user success deleting his own comment', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}`,
        headers: {
          Authorization: `Bearer ${testData.tokens[0].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when GET /threads/{threadId} after comment deletion', () => {
    it('should response 200 and returns thread detail with deleted comment', async () => {
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

      expect(responseJson.data).toHaveProperty('thread');
      expect(responseJson.data.thread).toHaveProperty('id', testData.threads[0].id);
      expect(responseJson.data.thread).toHaveProperty('title', testData.threads[0].title);
      expect(responseJson.data.thread).toHaveProperty('body', expect.any(String));
      expect(responseJson.data.thread).toHaveProperty('date', expect.any(String));
      expect(responseJson.data.thread).toHaveProperty('username', testData.users[0].username);
      expect(responseJson.data.thread).toHaveProperty('comments', expect.any(Array));
      expect(responseJson.data.thread.comments).toHaveLength(2);

      const [comment1, comment2] = responseJson.data.thread.comments;
      expect(comment1).toHaveProperty('id', testData.comments[0].id);
      expect(comment1).toHaveProperty('content', '**komentar telah dihapus**');
      expect(comment1).toHaveProperty('date', expect.any(String));
      expect(comment1).toHaveProperty('username', testData.users[0].username);
      expect(comment1).toHaveProperty('replies', []);
      expect(comment1).toHaveProperty('likeCount', 0);

      expect(comment2).toHaveProperty('id', testData.comments[1].id);
      expect(comment2).toHaveProperty('content', testData.comments[1].content);
      expect(comment2).toHaveProperty('date', expect.any(String));
      expect(comment2).toHaveProperty('username', testData.users[1].username);
      expect(comment2).toHaveProperty('replies', []);
      expect(comment2).toHaveProperty('likeCount', 0);
    });
  });
});
