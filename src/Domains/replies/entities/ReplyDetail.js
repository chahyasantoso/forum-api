class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, isDelete, replyOfId,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date.toISOString();
    this.content = isDelete ? '**balasan telah dihapus**' : content;
    this.replyOfId = replyOfId;
  }

  // eslint-disable-next-line class-methods-use-this
  _verifyPayload({
    id, username, date, content, isDelete, replyOfId,
  }) {
    if (!id || !username || !date || !content || !replyOfId
    || typeof isDelete === 'undefined') {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof username !== 'string'
    || !(date instanceof Date)
    || typeof content !== 'string'
    || typeof isDelete !== 'boolean'
    || typeof replyOfId !== 'string') {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyDetail;
