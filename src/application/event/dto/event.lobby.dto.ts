export class EventLobbyStartGameRequest {
    constructor(
        public gameNumber: number, 
        public match: number,
        public isPractice: boolean,
    ) { }
}