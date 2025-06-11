// EVENT LOBBY
export class EventLobbyStartGameResponse {
    constructor(
        public gameNumber: number, 
        public match: number,
        public isPractice: boolean,
        public startTime: number,
        public gap: number,
    ) { }
}

// EVENT INGAME
export class RealTimeScoreGetResponse {
    constructor(
        public teamId: number, 
        public score: number
    ) { }
}

// EVENT FINISH
export class EventFinishRankingGetResponse {
    constructor(
        public match: number,
        public ranking: number[],
    ) { }
}