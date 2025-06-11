import { Room } from "../../common/entity/room.entity";
import { User } from "../../common/entity/user.entity";
import { getRoom, setRoom } from "../../repository/common/room.repository";
import { deleteUserFromRoom, getTotalUserCount } from "../../repository/common/user.repository";

export async function handleNormalUserDisconnected(roomNumber: string, user: User): Promise<null> {
    const room: Room = await getRoom(roomNumber);
    const isMaster = room.master == user.i;
    const isStarter = room.starter == user.i;

    await deleteUserFromRoom(roomNumber, user);

    if (isMaster && isStarter) { // 방장이자 스타터일 때

    } else if (isMaster) { // 방장일 때

    } else if (isStarter) { // 스타터일 때 

    } else {

    }

    return null;
}

export async function handleEventHostDisconnected(roomNumber: string): Promise<DisconnectResponse> {
    const room: Room = await getRoom(roomNumber);
    if(room.event) room.event.isHostConnected = false;
    setRoom(roomNumber, room);
    const totalUser = await getTotalUserCount(roomNumber);
    return new DisconnectResponse(
        totalUser == 0 && room.event?.isHostConnected == false,
        0,
    );
}

export async function handleEventUserDisconnected(roomNumber: string, user: User): Promise<DisconnectResponse> {
    await deleteUserFromRoom(roomNumber, user);
    const totalUser = await getTotalUserCount(roomNumber);
    const room = await getRoom(roomNumber);
    const needToDeleteRoom = totalUser == 0 && room.event?.isHostConnected == false;
    return new DisconnectResponse(
        needToDeleteRoom,
        new EventUserDisconnectedResponse(
            room.hostSocketId,
            room.event?.isHostConnected,
            totalUser
        )
    );
}

export class EventUserDisconnectedResponse {
    constructor(
        public hostSocketId: string,
        public isHostConnected: boolean = true,
        public totalUserCount: number,
    ) { }
}

export class DisconnectResponse {
    constructor(
        public needToDeleteRoom: boolean,
        public data: any,
    ) { }
}