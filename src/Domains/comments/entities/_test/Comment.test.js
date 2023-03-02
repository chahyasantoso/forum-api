const Comment = require('../Comment');

describe('a Comment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      username: 'user-123',
      content: 'a content',
    };

    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      username: 'user-123',
      date: '1/1/2023',
      content: true,
      isDelete: 'false',
    };

    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create comment object correctly', () => {
    const payload = {
      id: 'thread-123',
      username: 'user-123',
      date: '1/1/2023',
      content: 'a content',
      isDelete: false,
    };

    const {
      id, username, date, content,
    } = new Comment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
  });

  it('should create comment object with content set to **komentar telah dihapus** when isDelete is true', () => {
    const payload = {
      id: 'thread-123',
      username: 'user-123',
      date: '1/1/2023',
      content: 'a content',
      isDelete: true,
    };

    const {
      id, username, date, content,
    } = new Comment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**komentar telah dihapus**');
  });
});
