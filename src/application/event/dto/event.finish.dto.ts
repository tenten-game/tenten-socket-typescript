export default class EventFinishScoreGetRequest {
    constructor(
        public match: string,
    ) { }
}

export interface EventFinishScorePostRequest {
    score: number;
    match: string;
}

export interface EventFinishRankingGetResponse {
    ranking: number;
}

export interface EventFinishRankingGetRequest {
    match: string;
}