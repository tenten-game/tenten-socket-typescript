export class RealTimeScorePostRequest {
    constructor(
        public score: number, 
        public match: string
    ) { }
}

export class RealTimeScoreGetRequest {
    constructor(
        public teamId: number, 
        public match: string
    ) { }
}

export class RealTimeScoreGetResponse {
    constructor(
        public teamId: number, 
        public score: number
    ) { }
}