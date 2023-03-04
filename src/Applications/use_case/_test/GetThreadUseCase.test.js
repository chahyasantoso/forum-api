const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {};
    const getThreadUseCase = new GetThreadUseCase({});

    // Action & Assert
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error if use case payload not meet data type spec', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 123,
    };
    const getThreadUseCase = new GetThreadUseCase({});

    // Action & Assert
    await expect(getThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating get thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockReturnedThreadDetail = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      date: '1/1/2023',
      username: 'userA',
    };

    const mockReturnedComments = [
      {
        id: 'comments-123',
        username: 'userB',
        date: '1/1/2023',
        content: 'a comment by userB',
      },
    ];

    const mockReturnedReplies = [
      {
        id: 'reply-123',
        username: 'userC',
        date: '1/1/2023',
        content: 'a reply by userC',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadDetail = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReturnedThreadDetail));
    mockCommentRepository.getComments = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReturnedComments));
    mockReplyRepository.getReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReturnedReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(thread).toStrictEqual({
      ...mockReturnedThreadDetail,
      comments:
      [
        {
          ...mockReturnedComments[0],
          replies: mockReturnedReplies,
        },
      ],
    });
    expect(mockThreadRepository.getThreadDetail).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getComments).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getReplies).toBeCalledWith(mockReturnedComments[0].id);
    expect(mockReplyRepository.getReplies).toBeCalledTimes(1);
  });
});
