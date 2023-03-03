const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newComment = new NewComment(useCasePayload);
    const { threadId } = newComment;
    await this._threadRepository.verifyExisting(threadId);
    return this._commentRepository.add(newComment);
  }
}

module.exports = AddCommentUseCase;
