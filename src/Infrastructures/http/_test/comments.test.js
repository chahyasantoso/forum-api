const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

const testData = {
  tokens: [],
  threads: [],
  comments: [],
};

describe('/threads endpoint', () => {
  beforeAll(async () => {
    await ServerTestHelper.addUser({
      username: 'userA',
      password: 'xxx',
      fullname: 'user A full name',
    });

    await ServerTestHelper.addUser({
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

    it('should response 404 when thread not exists', async () => {
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
      expect(responseJson.data.addedComment).toBeDefined();
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

    it('should response 404 when comment/thread not found', async () => {
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
});
