class ThreadDetail {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      id, title, body, date, username,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = [];
  }

  /* eslint-disable class-methods-use-this */
  _verifyPayload({
    id, title, body, date, username,
  }) {
    if (!id || !title || !body || !date || !username) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
        || typeof title !== 'string'
        || typeof body !== 'string'
        || !(date instanceof Date)
        || typeof username !== 'string') {
      throw new Error('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (title.length > 100) {
      throw new Error('THREAD_DETAIL.TITLE_LIMIT_CHAR');
    }
  }
}

module.exports = ThreadDetail;
