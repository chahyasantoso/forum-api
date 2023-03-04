const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    return this._threadRepository.add(new AddThread(useCasePayload));
  }
}

module.exports = AddThreadUseCase;
