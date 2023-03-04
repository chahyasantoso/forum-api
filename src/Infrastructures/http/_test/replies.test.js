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
  replies: [],
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

    // add comment to thread using userA accessToken
    testData.comments[0] = await ServerTestHelper.addComment({
      content: 'a comment by userA',
    }, testData.threads[0].id, testData.tokens[0].accessToken);
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when no authentication provided', async () => {
      // Arrange
      const requestPayload = {
        content: 'a reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/replies`,
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
        content: 'a reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/xxx/comments/${testData.comments[0].id}/replies`,
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

    it('should response 404 when comment not exists', async () => {
      // Arrange
      const requestPayload = {
        content: 'a reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${testData.threads[0].id}/comments/xxx/replies`,
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
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/replies`,
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
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/replies`,
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

    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'a reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${testData.tokens[0].accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedReply).toBeDefined();

      CommentsTableTestHelper.cleanReplies();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    beforeAll(async () => {
      // add reply to comment with user A accessToken
      testData.replies[0] = await ServerTestHelper.addReply({
        content: 'reply by user A',
      }, testData.comments[0].id, testData.threads[0].id, testData.tokens[0].accessToken);

      // add reply to comment with user B accessToken
      testData.replies[1] = await ServerTestHelper.addReply({
        content: 'reply by user B',
      }, testData.comments[0].id, testData.threads[0].id, testData.tokens[1].accessToken);
    });

    it('should response 401 when no authentication provided', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/replies/${testData.replies[0].id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when reply/comment/thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/replies/xxx`,
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

    it('should response 403 when a user try to delete another user reply', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/replies/${testData.replies[0].id}`,
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

    it('should response 200 when a user success deleting his own reply', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${testData.threads[0].id}/comments/${testData.comments[0].id}/replies/${testData.replies[0].id}`,
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

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and returns thread detail', async () => {
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

      const [comment] = responseJson.data.thread.comments;
      expect(comment.id).toEqual(testData.comments[0].id);
      expect(comment.content).toEqual(testData.comments[0].content);
      expect(comment.date).not.toEqual('');
      expect(comment.username).toEqual(testData.users[0].username);
      expect(comment.replies).toBeDefined();
      expect(comment.replies).toHaveLength(2);

      const [reply1, reply2] = comment.replies;
      expect(reply1.id).toEqual(testData.replies[0].id);
      expect(reply1.content).toEqual('**balasan telah dihapus**');
      expect(reply1.date).not.toEqual('');
      expect(reply1.username).toEqual(testData.users[0].username);

      expect(reply2.id).toEqual(testData.replies[1].id);
      expect(reply2.content).toEqual(testData.replies[1].content);
      expect(reply2.date).not.toEqual('');
      expect(reply2.username).toEqual(testData.users[1].username);
    });
  });
});
