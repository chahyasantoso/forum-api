const CommentLike = require('../../Domains/comments/entities/CommentLike');

class LikeCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { commentId, threadId, owner } = useCasePayload;

    await this._commentRepository.verifyExisting(commentId, threadId);

    const commentLike = new CommentLike({ commentId, owner });
    const hasLike = await this._commentRepository.hasExistingLike(commentLike);
    if (!hasLike) {
      await this._commentRepository.addLike(commentLike);
    } else {
      await this._commentRepository.deleteLike(commentLike);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _validatePayload(payload) {
    const { commentId, threadId, owner } = payload;
    if (!commentId || !threadId || !owner) {
      throw new Error('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string'
    || typeof threadId !== 'string'
    || typeof owner !== 'string') {
      throw new Error('LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LikeCommentUseCase;
