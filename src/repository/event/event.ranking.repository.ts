import { User } from '../../common/entity/user.entity';
import { redisClient } from '../../config/redis.config';

interface Ranking {
    i: number;
    a: number;
    f: number;
    t: number;
    n: string;
    score?: number; // redisClientClient에서 가져온 score 추가
}

function generateKey(roomNumber: string, match: string): string {
    return `${roomNumber}_${match}_RANKING`;
}

async function getAllRankings(rankingKey: string): Promise<Ranking[]> {
    const results = await redisClient.zrevrange(rankingKey, 0, -1, 'WITHSCORES');
    const rankings: Ranking[] = [];
    for (let i = 0; i < results.length; i += 2) {
        const memberStr = results[i];
        const score = parseFloat(results[i + 1]);
        const rankingObj = JSON.parse(memberStr) as Ranking;
        rankingObj.score = score;
        rankings.push(rankingObj);
    }
    return rankings;
}

function assignRanks(rankings: Ranking[]): (Ranking & { rank: number })[] {
    let currentRank = 0;
    let previousScore: number | null = null;
    return rankings.map((entry, index) => {
        if (previousScore === null || entry.score !== previousScore) {
            currentRank = index + 1;
            previousScore = entry.score || 0;
        }
        return { ...entry, rank: currentRank };
    });
}

export async function processRankings(roomNumber: string, match: string, teamIds: number[]): Promise<any> {
    const allRankings = await getAllRankings(generateKey(roomNumber, match));
    const overallRankings = assignRanks(allRankings);

    overallRankings.forEach((ranking, _) => {
        redisClient.zadd(
            generateKey(roomNumber, match) + '_CALCULATED', 
            ranking.rank || 999, 
            JSON.stringify(new User(ranking.i, ranking.a, ranking.f, ranking.t, ranking.n))
        );
    });
    
    const teamRankingList: (Ranking & { rank: number })[][] = [];

    for (const teamId of teamIds) {
        const teamRanking = assignRanks(allRankings.filter(r => r.t === teamId));
        teamRankingList.push(teamRanking);
    }

    return {
        overall: overallRankings,
        teamRankingList: teamRankingList,
    };
}

export function zaddScore(
    roomNumber: string,
    score: number,
    match: string,
    user: User,
): void {
    const rankingKey = generateKey(roomNumber, match);
    redisClient.zadd(rankingKey, score, JSON.stringify(user));
}

export async function zRevRank(
    roomNumber: string,
    match: string,
    user: User,
): Promise<number> {
    const rankingKey = generateKey(roomNumber, match) + "_CALCULATED";
    const ranking: string = await redisClient.zscore(rankingKey, JSON.stringify(user)) || "999";
    return parseInt(ranking);
}