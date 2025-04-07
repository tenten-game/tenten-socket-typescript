export class RealTimeScorePostRequest {
    s: number;
    m: string;

    constructor(s: number, m: string) {
        this.s = s;
        this.m = m;
    }
}

export class RealTimeScoreGetRequest {
    teamId: number;
    match: string;

    constructor(teamId: number, match: string) {
        this.teamId = teamId;
        this.match = match;
    }
}

export class RealTimeScoreGetResponse {
    teamId: number;
    score: number;

    constructor(teamId: number, score: number) {
        this.teamId = teamId;
        this.score = score;
    }
}