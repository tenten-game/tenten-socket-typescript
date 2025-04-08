import { User } from "../../../common/entity/user.entity";
import { SocketDataType } from "../../../common/enums/enums";

export class SocketData {
    constructor(
        public user: User, 
        public roomNumber: string,
        public socketDataType: SocketDataType = SocketDataType.NORMAL_USER,
    ) { }
}

export class EventHostSocketData {
    constructor(
        public roomNumber: string,
        public socketDataType: SocketDataType = SocketDataType.EVENT_HOST,
    ) { }
}