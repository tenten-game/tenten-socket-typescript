import { TOP_N } from '../../common/const/const';
import { User } from '../../common/entity/user.entity';
import { redisClient } from '../../config/redis.config';
import { ProcessRankingsResult, Ranking, RankingDTO, TeamScore } from './entity/rankings.entity';

export async function processRankingsNoTotalRankings(
    roomNumber: string,
    match: number,
    teamIds: number[],
): Promise<ProcessRankingsResult> {
    const rankingKey: string = generateKey(roomNumber, match);
    const calculatedKey: string = rankingKey + '_CALCULATED';
    const allRankings: Ranking[] = await getAllRankings(rankingKey);
    const overallRankings: (Ranking & { rank: number })[] = assignRanks(allRankings);

    overallRankings.forEach(ranking => {
        redisClient.zadd(
            calculatedKey,
            ranking.rank || -1,
            JSON.stringify(new User(ranking.i, ranking.a, ranking.f, ranking.t, ranking.n))
        );
    });

    const teamScore: TeamScore[] = [];
    const teamTopRankings: { [teamId: number]: RankingDTO[] } = {};
    const teamBottomRankings: { [teamId: number]: RankingDTO[] } = {};

    for (const teamId of teamIds) {
        const teamRankings = overallRankings.filter(r => r.t === teamId);
        const totalScore = teamRankings.reduce((sum, r) => sum + (r.score || 0), 0);
        const averageScore = teamRankings.length > 0 ? totalScore / teamRankings.length : 0;
        // 소수점 셋째 자리 반올림
        const roundedAverageScore = Math.round(averageScore * 100) / 100;
        teamScore.push({ id: teamId, totalScore, averageScore: roundedAverageScore });

        const sortedTeamRankings = teamRankings.sort((a, b) => (a.rank as number) - (b.rank as number));
        teamTopRankings[teamId] = sortedTeamRankings
            .slice(0, TOP_N)
            .map(r => ({
                r: r.rank as number,
                s: r.score as number,
                u: r.i,
                a: r.a,
                f: r.f,
                n: r.n,
                t: r.t,
            }));
        teamBottomRankings[teamId] = sortedTeamRankings
            .slice(-TOP_N)
            .map(r => ({
                r: r.rank as number,
                s: r.score as number,
                u: r.i,
                a: r.a,
                f: r.f,
                n: r.n,
                t: r.t,
            }));
    }

    let winTeamId = teamIds[0];
    let maxAverageScore = -Infinity;
    for (const ts of teamScore) { // 무승부일 경우도 처리
        if (ts.averageScore > maxAverageScore) {
            maxAverageScore = ts.averageScore;
            winTeamId = ts.id;
        } else if (ts.averageScore === maxAverageScore) {
            winTeamId = 0; // 무승부
        }
    }

    const totalTopRankings = overallRankings.slice(0, TOP_N).map(mapRankingToDTO);
    const totalBottomRankings = overallRankings.slice(-TOP_N).map(mapRankingToDTO);
    const totalMiddleRankings = overallRankings.slice(Math.floor(overallRankings.length / 2), Math.ceil(overallRankings.length / 2) + 1).map(mapRankingToDTO); // total Rankings 의 딱 중간 랭킹

    const response: ProcessRankingsResult = {
        winTeamId,
        teamScore,
        totalRankings: [], // 전체 랭킹은 필요없음
        teamTopRankings,
        teamBottomRankings: {}, // 팀 랭킹은 필요없음
        totalTopRankings,
        totalBottomRankings,
        totalMiddleRankings,
    };
    redisClient.set(`${rankingKey}_RESULT`, JSON.stringify(response));
    return response;
}

function mapRankingToDTO(ranking: Ranking): RankingDTO {
    return {
        r: ranking.rank as number,
        s: ranking.score as number,
        u: ranking.i,
        a: ranking.a,
        f: ranking.f,
        n: ranking.n,
        t: ranking.t,
    };
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

export function zaddScore(
    roomNumber: string,
    score: number,
    match: number,
    user: User,
): void {
    const rankingKey = generateKey(roomNumber, match);
    redisClient.zadd(rankingKey, score, JSON.stringify(user));
}

export async function zRevRank(
    roomNumber: string,
    match: number,
    user: User,
): Promise<number> {
    const rankingKey = generateKey(roomNumber, match) + "_CALCULATED";
    const ranking: string = (await redisClient.zscore(rankingKey, JSON.stringify(user))) || "-1";
    return parseInt(ranking);
}

function generateKey(roomNumber: string, match: number): string {
    return `${roomNumber}_${match}_RANKING`;
}


/*
export async function processRankings(
    roomNumber: string,
    match: number,
    teamIds: number[],
): Promise<ProcessRankingsResult> {
    const rankingKey = generateKey(roomNumber, match);
    const calculatedKey = rankingKey + '_CALCULATED';
    const allRankings = await getAllRankings(rankingKey);
    const overallRankings = assignRanks(allRankings);

    overallRankings.forEach(ranking => {
        redisClient.zadd(
            calculatedKey,
            ranking.rank || -1,
            JSON.stringify(new User(ranking.i, ranking.a, ranking.f, ranking.t, ranking.n))
        );
    });

    const totalRankings: RankingDTO[] = overallRankings.map(r => ({
        r: r.rank as number,
        s: r.score as number,
        u: r.i,
        a: r.a,
        f: r.f,
        n: r.n,
        t: r.t,
    }));

    const teamScore: TeamScore[] = [];
    const teamTopRankings: { [teamId: number]: RankingDTO[] } = {};
    const teamBottomRankings: { [teamId: number]: RankingDTO[] } = {};

    for (const teamId of teamIds) {
        const teamRankings = overallRankings.filter(r => r.t === teamId);
        const totalScore = teamRankings.reduce((sum, r) => sum + (r.score || 0), 0);
        const averageScore = teamRankings.length > 0 ? totalScore / teamRankings.length : 0;
        teamScore.push({ id: teamId, totalScore, averageScore });

        const sortedTeamRankings = teamRankings.sort((a, b) => (a.rank as number) - (b.rank as number));
        teamTopRankings[teamId] = sortedTeamRankings
            .slice(0, TOP_N)
            .map(r => ({
                r: r.rank as number,
                s: r.score as number,
                u: r.i,
                a: r.a,
                f: r.f,
                n: r.n,
                t: r.t,
            }));
        teamBottomRankings[teamId] = sortedTeamRankings
            .slice(-TOP_N)
            .map(r => ({
                r: r.rank as number,
                s: r.score as number,
                u: r.i,
                a: r.a,
                f: r.f,
                n: r.n,
                t: r.t,
            }));
    }

    let winTeamId = teamIds[0];
    let maxAverageScore = -Infinity;
    for (const ts of teamScore) {
        if (ts.averageScore > maxAverageScore) {
            maxAverageScore = ts.averageScore;
            winTeamId = ts.id;
        }
    }

    const totalTopRankings = totalRankings.slice(0, TOP_N);
    const totalBottomRankings = totalRankings.slice(-TOP_N);

    return {
        winTeamId,
        teamScore,
        totalRankings,
        teamTopRankings,
        teamBottomRankings,
        totalTopRankings,
        totalBottomRankings,
        totalMiddleRankings: [], // total Rankings 의 딱 중간 랭킹
    };
}

*/