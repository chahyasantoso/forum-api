const CommentDetail = require('../CommentDetail');

describe('a CommentDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      username: 'user-123',
      content: 'a content',
    };

    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      username: 'user-123',
      date: '2023-01-01T00:00:00.000Z',
      content: true,
      isDelete: 'false',
    };

    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create commentDetail object correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      date: new Date('2023-01-01'),
      content: 'a content',
      isDelete: false,
    };

    const {
      id, username, date, content,
    } = new CommentDetail(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
  });

  it('should create commentDetail object with content set to **komentar telah dihapus** when isDelete is true', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      date: new Date('2023-01-01'),
      content: 'a content',
      isDelete: true,
    };

    const {
      id, username, date, content,
    } = new CommentDetail(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**komentar telah dihapus**');
  });
});
