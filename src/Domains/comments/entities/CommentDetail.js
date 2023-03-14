/* eslint-disable class-methods-use-this */
class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, isDelete, likeCount,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.replies = [];
    this.likeCount = likeCount;
  }

  _verifyPayload({
    id, username, date, content, isDelete, likeCount,
  }) {
    if (!id || !username || !date || !content
    || typeof isDelete === 'undefined'
    || typeof likeCount === 'undefined') {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof username !== 'string'
    || !(date instanceof Date)
    || typeof content !== 'string'
    || typeof isDelete !== 'boolean'
    || typeof likeCount !== 'number') {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetail;
