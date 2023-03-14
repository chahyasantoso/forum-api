const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

const testData = {
  user: { },
  token: { },
  thread: { },
};

describe('/threads endpoint', () => {
  beforeAll(async () => {
    testData.user = await ServerTestHelper.addUser({
      username: 'userA',
      password: 'xxx',
      fullname: 'user A full name',
    });

    testData.token = await ServerTestHelper.login({
      username: 'userA',
      password: 'xxx',
    });
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
  });

  describe('when POST /threads', () => {
    it('should response 401 when no authentication provided', async () => {
      // Arrange
      const requestPayload = {
        title: 'a title',
        body: 'a body',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'a title',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${testData.token.accessToken}`,
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
        title: 'a title',
        body: 123,
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${testData.token.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 400 when title is more than 100 character', async () => {
      // Arrange
      const requestPayload = {
        title: 'abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij',
        body: 'a body',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${testData.token.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'a title',
        body: 'a body',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${testData.token.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');

      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread).toHaveProperty('id');
      expect(responseJson.data.addedThread).toHaveProperty('title');
      expect(responseJson.data.addedThread).toHaveProperty('owner');

      expect(typeof responseJson.data.addedThread.id).toBe('string');
      expect(responseJson.data.addedThread.id).not.toEqual('');
      expect(typeof responseJson.data.addedThread.title).toBe('string');
      expect(responseJson.data.addedThread.title).not.toEqual('');
      expect(typeof responseJson.data.addedThread.owner).toBe('string');
      expect(responseJson.data.addedThread.owner).not.toEqual('');

      const rows = await ThreadsTableTestHelper.findThreadById(responseJson.data.addedThread.id);
      expect(rows).toHaveLength(1);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and returns thread detail', async () => {
      // Arrange
      const threadPayload = {
        title: 'a thread title',
        body: 'a thread body',
      };
      testData.thread = await ServerTestHelper.addThread(threadPayload, testData.token.accessToken);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${testData.thread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toHaveProperty('id');
      expect(responseJson.data.thread).toHaveProperty('title');
      expect(responseJson.data.thread).toHaveProperty('body');
      expect(responseJson.data.thread).toHaveProperty('date');
      expect(responseJson.data.thread).toHaveProperty('username');
      expect(responseJson.data.thread).toHaveProperty('comments');

      expect(typeof responseJson.data.thread.id).toBe('string');
      expect(responseJson.data.thread.id).not.toEqual('');
      expect(typeof responseJson.data.thread.title).toBe('string');
      expect(responseJson.data.thread.title).toEqual(threadPayload.title);
      expect(typeof responseJson.data.thread.body).toBe('string');
      expect(responseJson.data.thread.body).toEqual(threadPayload.body);
      expect(typeof responseJson.data.thread.date).toBe('string');
      expect(responseJson.data.thread.date).not.toEqual('');
      expect(typeof responseJson.data.thread.username).toBe('string');
      expect(responseJson.data.thread.username).toEqual(testData.user.username);
      expect(Array.isArray(responseJson.data.thread.comments)).toBe(true);
      expect(responseJson.data.thread.comments).toEqual([]);
    });
  });
});
