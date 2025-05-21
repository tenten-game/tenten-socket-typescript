export class EventLobbyStartGameRequest {
    constructor(
        public gameNumber: number, 
        public match: number,
        public isPractice: boolean,
    ) { }
}

export class EventLobbyStartGameResponse {
    constructor(
        public gameNumber: number, 
        public match: number,
        public isPractice: boolean,
        public startTime: number,
    ) { }
}