/* eslint-disable class-methods-use-this */
class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      commentId, threadId, content, owner,
    } = payload;

    this.commentId = commentId;
    this.threadId = threadId;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({
    commentId, threadId, content, owner,
  }) {
    if (!commentId || !threadId || !content || !owner) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string'
    || typeof threadId !== 'string'
    || typeof content !== 'string'
    || typeof owner !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReply;