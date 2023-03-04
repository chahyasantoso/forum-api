const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const addReply = new AddReply(useCasePayload);
    const { commentId, threadId } = addReply;
    await this._commentRepository.verifyExisting(commentId, threadId);
    return this._replyRepository.add(addReply);
  }
}

module.exports = AddReplyUseCase;
