import { Socket } from 'socket.io';
import { logger } from './logger';
import { sendGoogleChatMessage } from './webhook';

export function wrapEventHandler(
  eventName: string,
  handler: (...args: any[]) => Promise<void> | void
) {
  return async function wrappedHandler(...args: any[]) {
    try {
      await handler(...args);
    } catch (error) {
      logger.error(`Socket event error in ${eventName}:`, error);

      sendGoogleChatMessage(`🚨 Socket Event Error: ${eventName}\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}\n` +
        `Stack: ${error instanceof Error ? error.stack : 'No stack trace'}\n` +
        `Timestamp: ${new Date().toISOString()}`);
    }
  };
}

export function registerSocketEvent(
  socket: Socket,
  eventName: string,
  handler: (...args: any[]) => Promise<void> | void
): void {
  socket.on(eventName, wrapEventHandler(eventName, handler));
}