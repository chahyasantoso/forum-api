const ThreadDetail = require('../ThreadDetail');

describe('a Thread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'a title',
      body: 'a body',
      username: 'user-123',
    };

    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: true,
      body: 123,
      date: 115263672772728,
      username: 'user-123',
    };

    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 100 character', () => {
    const payload = {
      id: 'thread-123',
      title: 'abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij',
      body: 'a body',
      date: '2023-01-01T00:00:00.000Z',
      username: 'user-123',
    };

    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.TITLE_LIMIT_CHAR');
  });

  it('should create threadDetail object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'a title',
      body: 'a body',
      date: '2023-01-01T00:00:00.000Z',
      username: 'user-123',
    };

    const {
      id, title, body, date, username,
    } = new ThreadDetail(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
