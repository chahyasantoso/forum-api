class Comments {
  constructor(payload) {
    // payload shoud be array of CommentDetail
    for (let i = 0; i < payload.length; i += 1) {
      this[payload.id] = payload[i];
    }
  }
}

module.exports = Comments;
