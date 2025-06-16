import { User } from '../../common/entity/user.entity';
import { redisClient } from '../../config/redis.config';
import { saveLogToFirestore } from '../../util/firestore';
import { KEY_EVENT_MATCH_RANKING, KEY_EVENT_MATCH_RANKING_CALCULATED, KEY_EVENT_MATCH_RANKING_GET_LOG, KEY_EVENT_MATCH_RANKING_POSTED_LOG, KEY_EVENT_MATCH_RANKING_RESULT } from '../../util/redis_key_generator';
import { ProcessRankingsResult, Ranking, RankingDTO, TeamScore } from './entity/rankings.entity';

const TOP_N = 10; 

export async function processRankingsNoTotalRankings(
    roomNumber: string,
    match: number,
    teamIds: number[],
): Promise<ProcessRankingsResult> {
    const allRankings: Ranking[] = await getAllRankings(KEY_EVENT_MATCH_RANKING(roomNumber, match));
    const overallRankings: (Ranking & { rank: number })[] = assignRanks(allRankings);
    const pipeline = redisClient.pipeline();
    overallRankings.forEach(ranking => {
        pipeline.zadd(
            KEY_EVENT_MATCH_RANKING_CALCULATED(roomNumber, match),
            ranking.rank || -1,
            JSON.stringify(new User(ranking.i, ranking.a, ranking.f, ranking.t, ranking.n))
        );
    });
    await pipeline.exec();

    const teamScore: TeamScore[] = [];
    const teamTopRankings: { [teamId: number]: RankingDTO[] } = {};
    const teamBottomRankings: { [teamId: number]: RankingDTO[] } = {};

    for (const teamId of teamIds) {
        const teamRankings = overallRankings.filter(r => r.t === teamId);
        const totalScore = teamRankings.reduce((sum, r) => sum + (r.score || 0), 0);
        const averageScore = teamRankings.length > 0 
          ? Math.round((totalScore / teamRankings.length) * 100) / 100 
          : 0;
        teamScore.push({ id: teamId, totalScore, averageScore: averageScore });

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

    let winTeamId = 0;
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
    await redisClient.set(KEY_EVENT_MATCH_RANKING_RESULT(roomNumber, match), JSON.stringify(response));
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

export async function zaddScore(
    roomNumber: string,
    score: number,
    match: number,
    user: User,
): Promise<void> {
    const now = Date.now();
    const userString = JSON.stringify(user);
    const pipeline = redisClient.pipeline();
    pipeline.zadd(KEY_EVENT_MATCH_RANKING_POSTED_LOG(roomNumber, match), now, userString);
    pipeline.zadd(KEY_EVENT_MATCH_RANKING(roomNumber, match), score, userString);
    await pipeline.exec();
}

export async function zRevRank(
    roomNumber: string,
    match: number,
    user: User,
): Promise<number> {
    const ranking: string = await redisClient.zscore(KEY_EVENT_MATCH_RANKING_CALCULATED(roomNumber, match), JSON.stringify(user)) || "-1";
    if (ranking === "-1") {
        const random = Math.floor(Math.random() * 1000000);
        saveLogToFirestore(
            `NURAK`,
            `${user.i}_${random}`,
            {
                i: user.i,
                t: user.t,
                n: roomNumber,
                m: match,
            },
        );
        throw Error(`$i: {user.i} match: ${match}`);
    }
    return parseInt(ranking);
}

export async function storeRankingGetLog(
    roomNumber: string,
    match: number,
    user: User,
): Promise<void> {
    await redisClient.zadd(KEY_EVENT_MATCH_RANKING_GET_LOG(roomNumber, match), Date.now(), JSON.stringify(user));
}
