import { FastifyInstance } from 'fastify';
export default async function (fastify: FastifyInstance) {
  fastify.get('/', { websocket: true }, (socket, request) => {
    socket.on('message', (message) => {
      socket.send('hi from server');
    });
  });
}
