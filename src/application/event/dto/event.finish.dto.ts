export class EventFinishScoreGetRequest {
    constructor(
        public match: number,
    ) { }
}

export class EventFinishScorePostRequest {
    constructor(
        public score: number,
        public match: number,
    ) { }
}

export class EventFinishRankingGetResponse {
    constructor(
        public match: number,
        public ranking: number[],
    ) { }
}

export class EventFinishRankingGetRequest {
    constructor(
        public match: number,
    ) { }
}