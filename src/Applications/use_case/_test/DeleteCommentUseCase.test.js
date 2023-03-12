const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not meet data type spec', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 123,
      threadId: 'xxx',
      owner: true,
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyExisting = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve());
    mockCommentRepository.delete = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyExisting).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockCommentRepository.delete).toBeCalledWith(useCasePayload.commentId);
  });
});
