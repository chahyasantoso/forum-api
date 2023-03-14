const CommentLike = require('../CommentLike');

describe('a CommentLike entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      commentId: 'comment-123',
    };

    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      commentId: 123,
      owner: 'user-123',
    };

    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentLike object correctly', () => {
    const payload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const { commentId, owner } = new CommentLike(payload);

    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});
