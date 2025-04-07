import { User } from "../../../common/entity/user.entity";

export class SocketData {
    user: User;
    roomNumber: string;

    constructor(user: User, room: string) {
        this.user = user;
        this.roomNumber = room;
    }
}

export class EventHostSocketData {
    roomNumber: string;
    eventCode: string;

    constructor(
        roomNumber: string,
        eventCode: string,
    ) {
        this.roomNumber = roomNumber;
        this.eventCode = eventCode;
    }
}