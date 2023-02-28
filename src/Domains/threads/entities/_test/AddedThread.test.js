const AddedThread = require('../AddedThread');

describe('a AddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'a title',
      owner: 'user1',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: true,
      owner: 'user1',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 100 character', () => {
    const payload = {
      id: 'thread1',
      title: 'abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij',
      owner: 'user1',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should create addThread object correctly', () => {
    const payload = {
      id: 'thread1',
      title: 'a title',
      owner: 'owner1',
    };

    const { id, title, owner } = new AddedThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
