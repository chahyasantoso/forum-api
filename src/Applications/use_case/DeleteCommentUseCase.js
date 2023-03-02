class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { commentId, threadId, owner } = useCasePayload;
    await this._commentRepository.verifyOwner(commentId, threadId, owner);
    await this._commentRepository.deleteById(commentId, threadId);
  }
}

module.exports = DeleteCommentUseCase;
