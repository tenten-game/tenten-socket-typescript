export class RealTimeScorePostRequest {
    constructor(
        public score: number, 
        public match: number
    ) { }
}

export class RealTimeScoreGetRequest {
    constructor(
        public teamId: number, 
        public match: number
    ) { }
}

export class RealTimeScoreGetResponse {
    constructor(
        public teamId: number, 
        public score: number
    ) { }
}