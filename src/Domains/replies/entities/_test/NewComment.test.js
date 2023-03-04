const NewComment = require('../NewComment');

describe('a NewComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'a content',
      owner: 'user-123',
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      threadId: 123,
      content: true,
      owner: 'user-123',
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newComment object correctly', () => {
    const payload = {
      threadId: 'thread-123',
      content: 'a content',
      owner: 'owner-123',
    };

    const { threadId, content, owner } = new NewComment(payload);

    expect(threadId).toEqual(payload.threadId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
