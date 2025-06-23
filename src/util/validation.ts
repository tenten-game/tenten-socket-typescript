// Re-export validation functions for backward compatibility
// New validation logic is in src/application/common/validation.service.ts
export { 
  validateRequiredFields as validateRequest,
  validateRoomNumber,
  validateUser,
  validateIconId,
  validateTeamId,
  validateScore,
  safeParseJSON
} from '../application/common/validation.service';