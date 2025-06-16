export const KEY_ROOM = (roomNumber: string) => `${roomNumber}`;

// 새로운 유저 관리 구조
export const KEY_USERLIST = (roomNumber: string) => `${roomNumber}_USERLIST`; // Sorted Set: user.id만 저장, score = teamId
export const KEY_USER_DATA = (roomNumber: string) => `${roomNumber}_USER_DATA`; // Hash: user.id → User 전체 데이터

export const KEY_EVENT_MATCH_RANKING = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING`;
export const KEY_EVENT_MATCH_RANKING_RESULT = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_RESULT`;
export const KEY_EVENT_MATCH_RANKING_CALCULATED = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_CALCULATED`;

export const KEY_EVENT_MATCH_RANKING_POSTED_LOG = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_POSTED_LOG`;
export const KEY_EVENT_MATCH_RANKING_CALCULATED_LOG = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_CALCULATED_LOG`;
export const KEY_EVENT_MATCH_RANKING_GET_LOG = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_GET_LOG`;

export const KEY_6030 = (roomNumber: string) => `${roomNumber}_6030`;
export const KEY_6040 = (roomNumber: string) => `${roomNumber}_6040`;

export const KEY_RANKING_CALULATE_BY_API = (roomNumber: string, match: string) => `${roomNumber}_${match}_LOG_RANKING_CALCULATE_BY_API`;
export const KEY_REALTIME_SCORE = (roomNumber: string, match: number, teamId: number) => `${roomNumber}_${match}_${teamId}_RTS`;