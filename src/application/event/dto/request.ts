import { User } from "../../../common/entity/user.entity";
import { EventType, RoomMode } from "../../../common/enums/enums";

// EVENT ROOM
export class EventRoomCreateRequest {
    constructor(
        public roomNumber: string,
        public event: Event
    ) { }
}

export class EventRoomReEnterRequest {
    constructor(
        public roomNumber: string,
    ) { }
}

export class Event {
    constructor(
        public id: number,
        public code: string,
        public displayName: string,
        public eventTeams: EventTeam[],
        public hostMainImageUrl: string,
        public mode: string,
        public participantMainImageUrl: string,
        public type: EventType,
        public isHostConnected: boolean,
    ) { }
}

export class EventTeam {
    constructor(
        public color: string,
        public displayName: string,
        public hidden: boolean,
        public hostMainImageUrl: string,
        public id: number,
        public name: string,
        public order: number,
        public participantMainImageUrl: string
    ) { }
}

export class EventRoomChangeModeRequest {
    constructor(
        public mode: RoomMode
    ) { }
}

export class EventRoomEnterRequest {
    constructor(
        public user: User,
        public roomNumber: string
    ) { }
}

// EVENT LOBBY
export class EventLobbyStartGameRequest {
    constructor(
        public gameNumber: number, 
        public match: number,
        public isPractice: boolean,
    ) { }
}

// EVENT INGAME
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

// EVENT FINISH
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

export class EventFinishRankingGetRequest {
    constructor(
        public match: number,
    ) { }
}