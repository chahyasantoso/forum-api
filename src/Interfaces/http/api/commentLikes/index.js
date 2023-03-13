const CommentLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'commentLikes',
  register: async (server, { container }) => {
    const handler = new CommentLikesHandler(container);
    server.route(routes(handler));
  },
};
