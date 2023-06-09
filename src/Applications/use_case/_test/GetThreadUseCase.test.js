const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');

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

    const expectedThread = new ThreadDetail({
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      date: new Date('2023-01-01'),
      username: 'userA',
    });
    expectedThread.comments = [
      new CommentDetail({
        id: 'comment-123',
        username: 'userB',
        date: new Date('2023-01-01'),
        content: 'a comment by userB',
        isDelete: false,
        likeCount: 0,
      }),
    ];
    expectedThread.comments[0].replies = [
      new ReplyDetail({
        id: 'reply-123',
        username: 'userC',
        date: new Date('2023-01-01'),
        content: 'a reply by userC',
        isDelete: false,
        replyOfId: 'comment-123',
      }),
    ];
    delete expectedThread.comments[0].replies[0].replyOfId;

    const mockReturnedThreadDetail = new ThreadDetail({
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      date: new Date('2023-01-01'),
      username: 'userA',
    });

    const mockReturnedCommentsMap = new Map([
      [
        'comment-123',
        new CommentDetail({
          id: 'comment-123',
          username: 'userB',
          date: new Date('2023-01-01'),
          content: 'a comment by userB',
          isDelete: false,
          likeCount: 0,
        }),
      ],
    ]);

    const mockReturnedRepliesMap = new Map([
      [
        'reply-123',
        new ReplyDetail({
          id: 'reply-123',
          username: 'userC',
          date: new Date('2023-01-01'),
          content: 'a reply by userC',
          isDelete: false,
          replyOfId: 'comment-123',
        }),
      ],
    ]);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadDetail = jest.fn(() => Promise.resolve(mockReturnedThreadDetail));
    mockCommentRepository.getComments = jest.fn(() => Promise.resolve(mockReturnedCommentsMap));
    mockReplyRepository.getReplies = jest.fn(() => Promise.resolve(mockReturnedRepliesMap));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(thread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.getThreadDetail).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getComments).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getReplies)
      .toBeCalledWith(Array.from(mockReturnedCommentsMap.keys()));
  });
});
