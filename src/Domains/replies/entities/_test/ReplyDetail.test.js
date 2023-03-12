const ReplyDetail = require('../ReplyDetail');

describe('a ReplyDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      username: 'user-123',
      content: 'a content',
    };

    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      username: 'user-123',
      date: '2023-01-01T00:00:00.000Z',
      content: true,
      isDelete: 'false',
      replyOfId: 123,
    };

    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create replyDetail object correctly', () => {
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: new Date('2023-01-01'),
      content: 'a content',
      isDelete: false,
      replyOfId: 'comment-123',
    };

    const {
      id, username, date, content, replyOfId,
    } = new ReplyDetail(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date.toISOString());
    expect(content).toEqual(payload.content);
    expect(replyOfId).toEqual(payload.replyOfId);
  });

  it('should create replyDetail object with content set to **balasan telah dihapus** when isDelete is true', () => {
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: new Date('2023-01-01'),
      content: 'a content',
      isDelete: true,
      replyOfId: 'comment-123',
    };

    const {
      id, username, date, content, replyOfId,
    } = new ReplyDetail(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date.toISOString());
    expect(content).toEqual('**balasan telah dihapus**');
    expect(replyOfId).toEqual(payload.replyOfId);
  });
});
