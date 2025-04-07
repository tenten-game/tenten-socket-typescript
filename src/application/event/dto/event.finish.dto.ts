export class EventFinishScoreGetRequest {
    constructor(
        public match: string,
    ) { }
}

export class EventFinishScorePostRequest {
    constructor(
        public score: number,
        public match: string,
    ) { }
}

export class EventFinishRankingGetResponse {
    constructor(
        public match: string,
        public ranking: number[],
    ) { }
}

export class EventFinishRankingGetRequest {
    constructor(
        public match: string,
    ) { }
}