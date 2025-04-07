export interface Ranking {
    i: number;      // userId
    a: number;      // arcadeIconId
    f: number;      // familyIconId
    t: number;      // teamId
    n: string;      // nickname
    score?: number; // Redis에서 가져온 점수
    rank?: number;  // 계산된 순위 (1부터 시작)
}

export interface RankingDTO {
    r: number;  // rank
    s: number;  // score
    u: number;  // userId
    a: number;  // arcadeIconId
    f: number;  // familyIconId
    n: string;  // nickname
    t: number;  // teamId
}

export interface TeamScore {
    id: number;         // teamId
    totalScore: number;
    averageScore: number;
}

export interface ProcessRankingsResult {
    winTeamId: number;
    teamScore: TeamScore[];
    totalRankings: RankingDTO[];
    teamTopRankings: { [teamId: number]: RankingDTO[] };
    teamBottomRankings: { [teamId: number]: RankingDTO[] };
    totalTopRankings: RankingDTO[];
    totalBottomRankings: RankingDTO[];
}

export const TOP_N = 10; 
