import { User } from "../../../common/entity/user.entity";
import { EventType, RoomMode } from "../../../common/enums/enums";

export class EventRoomCreateRequest {
    roomNumber: string;
    event: Event;

    constructor(roomNumber: string, event: Event) {
        this.roomNumber = roomNumber;
        this.event = event;
    }
}

export class Event {
    id: number;
    code: string;
    displayName: string;
    eventTeams: EventTeam[];
    hostMainImageUrl: string;
    mode: string;
    participantMainImageUrl: string;
    type: EventType;

    constructor(
        id: number,
        code: string,
        displayName: string,
        eventTeams: EventTeam[],
        hostMainImageUrl: string,
        mode: string,
        participantMainImageUrl: string,
        type: EventType
    ) {
        this.id = id;
        this.code = code;
        this.displayName = displayName;
        this.eventTeams = eventTeams;
        this.hostMainImageUrl = hostMainImageUrl;
        this.mode = mode;
        this.participantMainImageUrl = participantMainImageUrl;
        this.type = type;
    }
}

export class EventTeam {
    color: string;
    displayName: string;
    hidden: boolean;
    hostMainImageUrl: string;
    id: number;
    name: string;
    order: number;
    participantMainImageUrl: string;

    constructor(
        color: string,
        displayName: string,
        hidden: boolean,
        hostMainImageUrl: string,
        id: number,
        name: string,
        order: number,
        participantMainImageUrl: string
    ) {
        this.color = color;
        this.displayName = displayName;
        this.hidden = hidden;
        this.hostMainImageUrl = hostMainImageUrl;
        this.id = id;
        this.name = name;
        this.order = order;
        this.participantMainImageUrl = participantMainImageUrl;
    }
}

export class EventRoomChangeModeRequest {
    mode: RoomMode;

    constructor(mode: RoomMode) {
        this.mode = mode;
    }
}

export class EventRoomEnterRequest {
    user: User;
    roomNumber: string;

    constructor(
        user: User,
        roomNumber: string
    ) {
        this.user = user;
        this.roomNumber = roomNumber;
    }
}
