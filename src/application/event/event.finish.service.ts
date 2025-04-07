import { User } from "../../common/entity/user.entity";
import { getRoom } from "../../repository/common/room.repository";
import { ProcessRankingsResult } from "../../repository/event/entity/rankings.entity";
import { processRankings, zaddScore, zRevRank } from "../../repository/event/event.ranking.repository";
import { EventFinishScorePostRequest } from "./dto/event.finish.dto";

export async function handleEventFinishScoreGet(roomNumber: string, match: string): Promise<ProcessRankingsResult> {
    const room = await getRoom(roomNumber);
    const ranking: ProcessRankingsResult = await processRankings(roomNumber, match, room.event?.eventTeams.map((team) => team.id) || []);
    return ranking;
}

export function handleEventFinishScorePost(request: EventFinishScorePostRequest, roomNumber: string, user: User): void {
    zaddScore(roomNumber, request.score, request.match, user);
}

export async function handleEventFinishRankingGet(roomNumber: string, user: User, match: string,): Promise<number> {
    return await zRevRank(roomNumber, match, user);
}
