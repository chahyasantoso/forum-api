const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddComment(useCasePayload);
    const { threadId } = addComment;
    await this._threadRepository.verifyExisting(threadId);
    return this._commentRepository.add(addComment);
  }
}

module.exports = AddCommentUseCase;
