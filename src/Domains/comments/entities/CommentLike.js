class CommentLike {
  constructor(payload) {
    this._verifyPayload(payload);
    const { commentId, owner } = payload;

    this.commentId = commentId;
    this.owner = owner;
  }

  // eslint-disable-next-line class-methods-use-this
  _verifyPayload({ commentId, owner }) {
    if (!commentId || !owner) {
      throw new Error('COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string'
    || typeof owner !== 'string') {
      throw new Error('COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentLike;
