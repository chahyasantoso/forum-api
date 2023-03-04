class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const {
      replyId, commentId, threadId, owner,
    } = useCasePayload;

    await this._replyRepository.verifyExisting(replyId, commentId, threadId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.delete(replyId);
  }

  /* eslint-disable class-methods-use-this */
  _validatePayload(payload) {
    const {
      replyId, commentId, threadId, owner,
    } = payload;

    if (!replyId || !commentId || !threadId || !owner) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof replyId !== 'string'
    || typeof commentId !== 'string'
    || typeof threadId !== 'string'
    || typeof owner !== 'string') {
      throw new Error('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;
