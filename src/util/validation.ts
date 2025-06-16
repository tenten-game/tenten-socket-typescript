import { logger } from './logger';
import { sendGoogleChatMessage } from './webhook';

export function validateRequest(data: any, requiredFields: string[]) {
  if (!data) throw new Error('Data is required for validation');
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

export function validateRoomNumber(roomNumber: string) {
  if (!roomNumber || typeof roomNumber !== 'string') {
    throw new Error('Room number must be a non-empty string');
  }

  if (roomNumber.length !== 8) {
    throw new Error('Room number must be 8 characters long');
  }
}

export function validateUser(user: any) {
  if (!user) throw new Error('User data is required for validation');
  const requiredFields = ['i', 'n', 't', 'a', 'f'];
  validateRequest(user, requiredFields);
  if (typeof user.i !== 'number' || user.i <= 0) throw new Error('User ID must be a positive number');
  if (typeof user.n !== 'string' || user.n.length < 1 || user.n.length > 20) throw new Error('User name must be a string between 1 and 20 characters');
  if (typeof user.t !== 'number' || user.t < 0) throw new Error('User team ID must be a non-negative number');
}

export function validateIconId(iconId: any) {
  if (typeof iconId !== 'number' || iconId < 0) throw new Error('Icon ID must be a non-negative number');
}

export function validateTeamId(teamId: any) {
  if (typeof teamId !== 'number' || teamId < 0) throw new Error('Team ID must be a non-negative number');
}

export function validateScore(score: any) {
  if (typeof score !== 'number' || score < 0) throw new Error('Score must be a non-negative number');
}

export function safeParseJSON(data: any): any {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    logger.error('Failed to parse JSON:', error);
    sendGoogleChatMessage(`Error parsing JSON: ${error}, data: ${JSON.stringify(data)}`);
    throw new Error('Invalid JSON format');
  }
}