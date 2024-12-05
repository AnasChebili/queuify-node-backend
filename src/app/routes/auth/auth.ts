import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;

    // Find the user
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = fastify.jwt.sign(
      { id: user.id, username: user.username },
      { expiresIn: '1h' }
    );

    return reply.send({ token });
  });
}
