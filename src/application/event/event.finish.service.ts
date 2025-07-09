import { User } from "../../common/entity/user.entity";
import { loggingTimeStamp } from "../../config/redis.config";
import { getRoom } from "../../repository/common/room.repository";
import { ProcessRankingsResult } from "../../repository/event/entity/rankings.entity";
import { processRankingsNoTotalRankings, storeRankingGetLog, addUserScore, getUserRanking } from "../../repository/event/event.ranking.repository";
import { EventFinishScorePostRequest } from "./dto/request";

export async function handleEventFinishScoreGet(roomNumber: string, match: number): Promise<ProcessRankingsResult> {
    const room = await getRoom(roomNumber);
    loggingTimeStamp(`${roomNumber}_${match}_LOG_RANKING_CALCULATE_BY_SOCKET`);
    const ranking: ProcessRankingsResult = await processRankingsNoTotalRankings(roomNumber, match, room.event?.eventTeams.map((team) => team.id) || []);
    return ranking;
}

export async function handleEventFinishScorePost(request: EventFinishScorePostRequest, roomNumber: string, userId: number): Promise<void> {
    await addUserScore(roomNumber, request.score, request.match, userId);
}

export async function handleEventFinishRankingGet(roomNumber: string, userId: number, match: number): Promise<number> {
    storeRankingGetLog(roomNumber, match, userId);
    const myranking = await getUserRanking(roomNumber, match, userId);
    return myranking;
}
