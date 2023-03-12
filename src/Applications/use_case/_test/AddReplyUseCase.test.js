const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add new comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      content: 'a content',
      owner: 'user-123',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyExisting = jest.fn(() => Promise.resolve());
    mockReplyRepository.add = jest.fn(() => Promise.resolve(mockAddedReply));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
    expect(mockCommentRepository.verifyExisting)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockReplyRepository.add)
      .toBeCalledWith(new AddReply(useCasePayload));
  });
});
