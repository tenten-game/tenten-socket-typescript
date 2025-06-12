export const KEY_ROOM = (roomNumber: string) => `${roomNumber}`;

export const KEY_USERLIST = (roomNumber: string) => `${roomNumber}_USERLIST`;
export const KEY_USER_IDS = (roomNumber: string) => `${roomNumber}_USER_IDS`;

export const KEY_EVENT_MATCH_RANKING = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING`;
export const KEY_EVENT_MATCH_RANKING_RESULT = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_RESULT`;
export const KEY_EVENT_MATCH_RANKING_CALCULATED = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_CALCULATED`;

export const KEY_EVENT_MATCH_RANKING_POSTED_LOG = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_POSTED_LOG`;
export const KEY_EVENT_MATCH_RANKING_CALCULATED_LOG = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_CALCULATED_LOG`;
export const KEY_EVENT_MATCH_RANKING_GET_LOG = (roomNumber: string, match: number) => `${roomNumber}_${match}_RANKING_GET_LOG`;

export const KEY_6030 = (roomNumber: string) => `${roomNumber}_6030`;
export const KEY_6040 = (roomNumber: string) => `${roomNumber}_6040`;
