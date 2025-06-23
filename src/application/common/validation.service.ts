import { User } from "../../common/entity/user.entity";
import { logger } from "../../util/logger";
import { sendGoogleChatMessage } from "../../util/webhook";

/**
 * Validates that an object contains all required fields
 */
export function validateRequiredFields(data: any, requiredFields: string[]): void {
  if (!data) throw new Error('Data is required for validation');
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Validates room number format and length
 */
export function validateRoomNumber(roomNumber: string): void {
  if (!roomNumber || typeof roomNumber !== 'string') {
    throw new Error('Room number must be a non-empty string');
  }

  if (roomNumber.length !== 8) {
    throw new Error('Room number must be 8 characters long');
  }
}

/**
 * Validates user object structure and data types
 */
export function validateUser(user: any): void {
  if (!user) throw new Error('User data is required for validation');
  
  const requiredFields = ['i', 'n', 't', 'a', 'f'];
  validateRequiredFields(user, requiredFields);
  
  if (typeof user.i !== 'number' || user.i <= 0) {
    throw new Error('User ID must be a positive number');
  }
  
  if (typeof user.n !== 'string' || user.n.length < 1 || user.n.length > 20) {
    throw new Error('User name must be a string between 1 and 20 characters');
  }
  
  if (typeof user.t !== 'number' || user.t < 0) {
    throw new Error('User team ID must be a non-negative number');
  }
}

/**
 * Validates icon ID is a non-negative number
 */
export function validateIconId(iconId: any): void {
  if (typeof iconId !== 'number' || iconId < 0) {
    throw new Error('Icon ID must be a non-negative number');
  }
}

/**
 * Validates team ID is a non-negative number
 */
export function validateTeamId(teamId: any): void {
  if (typeof teamId !== 'number' || teamId < 0) {
    throw new Error('Team ID must be a non-negative number');
  }
}

/**
 * Validates score is a non-negative number
 */
export function validateScore(score: any): void {
  if (typeof score !== 'number' || score < 0) {
    throw new Error('Score must be a non-negative number');
  }
}

/**
 * Safely parses JSON data with error handling
 */
export function safeParseJSON(data: any): any {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    logger.error('Failed to parse JSON:', error);
    sendGoogleChatMessage(`Error parsing JSON: ${error}, data: ${JSON.stringify(data)}`);
    throw new Error('Invalid JSON format');
  }
}

/**
 * Game-specific validation for normal game requests
 */
export class NormalGameValidator {
  static validateFloorData(floorData: any): void {
    if (typeof floorData !== 'number' || floorData < 1 || floorData > 10) {
      throw new Error('Floor data must be a number between 1 and 10');
    }
  }
}

/**
 * Event-specific validation for event game requests
 */
export class EventGameValidator {
  static validateMatchNumber(match: any): void {
    if (typeof match !== 'number' || match < 1) {
      throw new Error('Match number must be a positive number');
    }
  }
  
  static validateEventTeam(teamId: any, validTeamIds: number[]): void {
    validateTeamId(teamId);
    if (!validTeamIds.includes(teamId)) {
      throw new Error(`Team ID ${teamId} is not valid for this event`);
    }
  }
}