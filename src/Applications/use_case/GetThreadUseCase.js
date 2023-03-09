class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const { threadId } = useCasePayload;
    const threadDetail = await this._threadRepository.getThreadDetail(threadId);

    const comments = await this._commentRepository.getComments(threadId);
    await Promise.all(comments.map(async (comment, index) => {
      comments[index].replies = await this._replyRepository.getReplies(comment.id);
    }));
    threadDetail.comments = comments;

    return threadDetail;
  }

  /* eslint-disable class-methods-use-this */
  _validatePayload(payload) {
    const { threadId } = payload;
    if (!threadId) {
      throw new Error('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThreadUseCase;
