export class EventLobbyStartGameRequest {
    gameNumber: number;
    match: string;

    constructor(gameNumber: number, match: string) {
        this.gameNumber = gameNumber;
        this.match = match;
    }
}