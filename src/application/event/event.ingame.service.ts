import { addRealTimeScore, getRealTimeScore } from "../../repository/event/event.realTimeScore.repository";
import { RealTimeScoreGetRequest, RealTimeScoreGetResponse, RealTimeScorePostRequest } from "./dto/event.ingame.dto";

export function handleEventInGameRealTimeScorePost(request: RealTimeScorePostRequest, roomNumber: string, teamId: number): void {
    addRealTimeScore(roomNumber, request.m, teamId, request.s);
}

export async function handleEventInGameRealTimeScoreGet(request: RealTimeScoreGetRequest, roomNumber: string): Promise<RealTimeScoreGetResponse> {
    const score = await getRealTimeScore(roomNumber, request.match, request.teamId);
    return new RealTimeScoreGetResponse(request.teamId, score);
}
