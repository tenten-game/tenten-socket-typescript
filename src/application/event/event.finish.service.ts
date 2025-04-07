import { User } from "../../common/entity/user.entity";
import { EventFinishScorePostRequest } from "../../presentation/event/evnet.finish.controller";
import { getRoom } from "../../repository/common/room.repository";
import { processRankings, zaddScore, zRevRank } from "../../repository/event/event.ranking.repository";

export async function handleEventFinishScoreGet(roomNumber: string, match: string): Promise<void> {
    const room = await getRoom(roomNumber);
    const ranking = await processRankings(roomNumber, match, room.event?.eventTeams.map((team) => team.id) || []);
}

export function handleEventFinishScorePost(request: EventFinishScorePostRequest, roomNumber: string, user: User): void {
    zaddScore(roomNumber, request.score, request.match, user);
}

export function handleEventFinishRankingGet(roomNumber: string, user: User, match: string,): void {
    zRevRank(roomNumber, match, user)
}
