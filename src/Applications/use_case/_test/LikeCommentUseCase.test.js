const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLike = require('../../../Domains/comments/entities/CommentLike');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {};
    const likeCommentUseCase = new LikeCommentUseCase({});

    // Action & Assert
    await expect(likeCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not meet data type spec', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 123,
      threadId: 'xxx',
      owner: true,
    };
    const likeCommentUseCase = new LikeCommentUseCase({});

    // Action & Assert
    await expect(likeCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.verifyExisting = jest.fn(() => Promise.resolve());
    mockCommentRepository.hasExistingLike = jest.fn(() => Promise.resolve(false));
    mockCommentRepository.addLike = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyExisting)
      .toBeCalledWith(
        useCasePayload.commentId,
        useCasePayload.threadId,
      );
    expect(mockCommentRepository.hasExistingLike)
      .toBeCalledWith(new CommentLike({
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      }));
    expect(mockCommentRepository.addLike)
      .toBeCalledWith(new CommentLike({
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      }));
  });

  it('should orchestrating unlike comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.verifyExisting = jest.fn(() => Promise.resolve());
    mockCommentRepository.hasExistingLike = jest.fn(() => Promise.resolve(true));
    mockCommentRepository.deleteLike = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyExisting)
      .toBeCalledWith(
        useCasePayload.commentId,
        useCasePayload.threadId,
      );
    expect(mockCommentRepository.hasExistingLike)
      .toBeCalledWith(new CommentLike({
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      }));
    expect(mockCommentRepository.deleteLike)
      .toBeCalledWith(new CommentLike({
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      }));
  });
});
