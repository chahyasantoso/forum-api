/* istanbul ignore file */
const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

const ServerTestHelper = {
  async addUser(addUserPayload) {
    const server = await createServer(container);
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: addUserPayload,
    });
    const { addedUser } = JSON.parse(response.payload).data;
    return addedUser;
  },

  async login(loginPayload) {
    const server = await createServer(container);
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: loginPayload,
    });
    const { accessToken, refreshToken } = JSON.parse(response.payload).data;
    return { accessToken, refreshToken };
  },

  async addThread(addThreadPayload, accessToken) {
    const server = await createServer(container);
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: addThreadPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { addedThread } = JSON.parse(response.payload).data;
    return addedThread;
  },

  async addComment(addCommentPayload, threadId, accessToken) {
    const server = await createServer(container);
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: addCommentPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { addedComment } = JSON.parse(response.payload).data;
    return addedComment;
  },

  async addReply(addReplyPayload, commentId, threadId, accessToken) {
    const server = await createServer(container);
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: addReplyPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { addedReply } = JSON.parse(response.payload).data;
    return addedReply;
  },

  async like(threadId, commentId, accessToken) {
    const server = await createServer(container);
    await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};

module.exports = ServerTestHelper;
