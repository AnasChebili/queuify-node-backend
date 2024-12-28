import { WebSocket as WebSocketType } from '@fastify/websocket';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { Connection } from 'pg';
import { ChatMessageSchema } from '../../../schemas/chat-schema';
import { z } from 'zod';
import { timeStamp } from 'console';
import { WebSocket } from 'ws';

const connectedClients = new Set<WebSocketType>();

export default async function (fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/ws-status',
    {
      schema: {
        response: {
          200: z.object({
            connections: z.number(),
            status: z.literal('active'),
          }),
        },
      },
    },
    async () => {
      return {
        connections: connectedClients.size,
        status: 'active' as const,
      };
    }
  );
  fastify.get('/chat', { websocket: true }, (socket, request) => {
    connectedClients.add(socket);
    const welcomeMessage = {
      type: 'join',
      username: 'System',
      content: 'Welcome to the chat!',
      timestamp: new Date().toISOString(),
    };
    socket.send(JSON.stringify(ChatMessageSchema.parse(welcomeMessage)));
    socket.on('message', (message) => {
      const data = ChatMessageSchema.parse(message);
      const chatMessage = {
        type: 'message',
        username: data.username,
        content: data.content,
        timeStamp: new Date().toISOString(),
      };

      connectedClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(ChatMessageSchema.parse(chatMessage)));
        }
      });
    });
    socket.on('close', () => {
      connectedClients.delete(socket);
      const leaveMessage = {
        type: 'leave',
        username: 'System',
        content: 'a user has left the chat',
        timeStamp: new Date().toISOString(),
      };
      connectedClients.forEach((client) => {
        if (client.readyState == WebSocket.OPEN) {
          client.send(JSON.stringify(ChatMessageSchema.parse(leaveMessage)));
        }
      });
    });
  });
}
