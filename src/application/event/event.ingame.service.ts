import { addRealTimeScore, getRealTimeScore } from "../../repository/event/event.realTimeScore.repository";
import { RealTimeScoreGetRequest, RealTimeScorePostRequest } from "./dto/request";
import { RealTimeScoreGetResponse } from "./dto/response";

export function handleEventInGameRealTimeScorePost(request: RealTimeScorePostRequest, roomNumber: string, teamId: number): void {
    addRealTimeScore(roomNumber, request.match, teamId, request.score);
}

export async function handleEventInGameRealTimeScoreGet(request: RealTimeScoreGetRequest, roomNumber: string): Promise<RealTimeScoreGetResponse> {
    const score = await getRealTimeScore(roomNumber, request.match, request.teamId);
    return new RealTimeScoreGetResponse(request.teamId, score);
}
