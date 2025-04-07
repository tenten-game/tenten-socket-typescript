import { Room } from "../../common/entity/room.entity";
import { RoomMode } from "../../common/enums/enums";
import { getRoom, setRoom } from "../../repository/common/room.repository";
import { addUser } from "../../repository/common/user.repository";
import { EventRoomChangeModeRequest, EventRoomCreateRequest, EventRoomEnterRequest } from "./dto/event.room.dto";

export function handleEventRoomCreate(request: EventRoomCreateRequest, hostSocketId: string): void {
    setRoom(request.roomNumber, new Room(
        hostSocketId,
        0,
        0,
        RoomMode.TEAM,
        request.event
    ));
}

export async function handleEventRoomChangeMode(request: EventRoomChangeModeRequest, roomNumber: string): Promise<void> {
    const room: Room = await getRoom(roomNumber);
    room.mode = request.mode;
    setRoom(roomNumber, room);
}

export async function handleEventRoomEnterAndGetHostSocketId(request: EventRoomEnterRequest): Promise<string> {
    addUser(request.roomNumber, request.user);
    const room: Room = await getRoom(request.roomNumber);
    return room.hostSocketId
}