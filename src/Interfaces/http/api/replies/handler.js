const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class ReplyHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const useCasePayload = {
      ...request.payload,
      ...request.params,
      owner: request.auth.credentials.id,
    };
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    const useCasePayload = {
      ...request.params,
      owner: request.auth.credentials.id,
    };
    await deleteReplyUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ReplyHandler;
