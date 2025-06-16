import { Socket } from 'socket.io';
import { logger } from './logger';
import { sendGoogleChatMessage } from './webhook';

export function wrapSocketHandler(
  handler: (...args: any[]) => Promise<void> | void
) {
  return async (...args: any[]) => {
    try {
      await handler(...args);
    } catch (error) {
      const socket = args.find(arg => arg && arg.id && arg.handshake) as Socket;
      const eventName = handler.name || 'Unknown';
      
      logger.error(`Socket event error in ${eventName}:`, error);
      
      sendGoogleChatMessage(`🚨 Socket Event Error: ${eventName}\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}\n` +
        `Socket ID: ${socket?.id}\n` +
        `IP: ${socket?.handshake?.address}\n` +
        `User Agent: ${socket?.handshake?.headers?.['user-agent']}\n` +
        `Timestamp: ${new Date().toISOString()}`);
      
      if (socket && socket.connected) {
        socket.emit('error', {
          message: 'Internal server error occurred',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  };
}