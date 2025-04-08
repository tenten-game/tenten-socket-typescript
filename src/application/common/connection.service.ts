import { Room } from "../../common/entity/room.entity";
import { User } from "../../common/entity/user.entity";
import { expireRoomRelatedInfo, getRoom } from "../../repository/common/room.repository";
import { deleteUser, getTotalUserCount } from "../../repository/common/user.repository";

export function handleNormalUserDisconnected(): void {
}

export async function handleEventHostDisconnected(roomNumber: string): Promise<void> {
    const room: Room = await getRoom(roomNumber);
    if (!room.event) return;
    room.event.isHostConnected = false;
    const totalUser = await getTotalUserCount(roomNumber);
    if (totalUser == 0) expireRoomRelatedInfo(roomNumber);
}

export async function handleEventUserDisconnected(roomNumber: string, user: User): Promise<string> {
    await deleteUser(roomNumber, user);
    const totalUser = await getTotalUserCount(roomNumber);
    const room = await getRoom(roomNumber);
    if (totalUser == 0 && room.event?.isHostConnected) expireRoomRelatedInfo(roomNumber);
    return room.hostSocketId;
}

export class EventUserDisconnectedResponse {
    constructor(
        public hostSocketId: string,
        public isHostConnected: boolean = true,
        public totalUserCount: number,
    ) { }
}