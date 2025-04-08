import { User } from "../../../common/entity/user.entity";
import { EventType, RoomMode } from "../../../common/enums/enums";

export class EventRoomCreateRequest {
    constructor(
        public roomNumber: string,
        public event: Event
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
        public isHostConnected: boolean = true,
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
