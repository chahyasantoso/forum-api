/* eslint-disable class-methods-use-this */
class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, isDelete,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date.toISOString();
    this.content = isDelete ? '**balasan telah dihapus**' : content;
  }

  _verifyPayload({
    id, username, date, content, isDelete,
  }) {
    if (!id || !username || !date || !content
    || typeof isDelete === 'undefined') {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof username !== 'string'
    || !(date instanceof Date)
    || typeof content !== 'string'
    || typeof isDelete !== 'boolean') {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyDetail;
