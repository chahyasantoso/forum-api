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

    const commentsMap = await this._commentRepository.getComments(threadId);
    const repliesMap = await this._replyRepository.getReplies(Array.from(commentsMap.keys()));

    const all = new Map([...commentsMap, ...repliesMap]);
    all.forEach((detail) => {
      const { replyOfId } = detail;
      if (replyOfId && all.has(replyOfId)) {
        const parent = all.get(replyOfId);
        parent.replies.push(detail);
        // eslint-disable-next-line no-param-reassign
        delete detail.replyOfId;
      }
    });

    threadDetail.comments = Array.from(commentsMap)
      .map(([id, commentDetail]) => commentDetail); // eslint-disable-line no-unused-vars

    return JSON.parse(JSON.stringify(threadDetail));
  }

  // eslint-disable-next-line class-methods-use-this
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
