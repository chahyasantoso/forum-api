class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { commentId, threadId, owner } = useCasePayload;

    await this._commentRepository.verifyExisting(commentId, threadId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.delete(commentId);
  }

  /* eslint-disable class-methods-use-this */
  _validatePayload(payload) {
    const { commentId, threadId, owner } = payload;
    if (!commentId || !threadId || !owner) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string'
    || typeof threadId !== 'string'
    || typeof owner !== 'string') {
      throw new Error('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentUseCase;
