const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
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

    testData.threads[0] = await ServerTestHelper.addThread({
      title: 'a thred by user A',
      body: 'a body',
    }, testData.tokens[0].accessToken);

    testData.comments[0] = await ServerTestHelper.addComment({
      content: 'a comment by user A',
    }, testData.threads[0].id, testData.tokens[0].accessToken);

    testData.comments[1] = await ServerTestHelper.addComment({
      content: 'a comment by user B',
    }, testData.threads[0].id, testData.tokens[1].accessToken);
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
});
