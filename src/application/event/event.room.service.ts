import { Room } from "../../common/entity/room.entity";
import { RoomMode } from "../../common/enums/enums";
import { getRoom, setRoom } from "../../repository/common/room.repository";
import { addUserToRoom } from "../../repository/common/user.repository";
import { EventRoomChangeModeRequest, EventRoomCreateRequest, EventRoomEnterRequest } from "./dto/event.room.dto";

export function handleEventRoomCreate(request: EventRoomCreateRequest, hostSocketId: string): void {
    const room = new Room(
        hostSocketId,
        0,
        0,
        RoomMode.TEAM,
        request.event,
    );
    room.event!.isHostConnected = true;
    setRoom(request.roomNumber, room);
}

export async function handleEventRoomChangeMode(request: EventRoomChangeModeRequest, roomNumber: string): Promise<void> {
    const room: Room = await getRoom(roomNumber);
    room.mode = request.mode;
    setRoom(roomNumber, room);
}

export async function handleEventRoomEnterAndGetHostSocketId(request: EventRoomEnterRequest): Promise<string> {
    const room: Room = await getRoom(request.roomNumber);
    const teamIds = room.event!.eventTeams.map((team) => team.id);

    // teamId 오류라면 랜덤 팀 지정
    if (!teamIds.includes(request.user.t)) {
        const randomIndex = Math.floor(Math.random() * 2); // 0 or 1
        request.user.t = teamIds[randomIndex];
    }

    addUserToRoom(request.roomNumber, request.user);
    return room.hostSocketId
}

export async function handleEventRoomHostReEnter(
    roomNumber: string,
    hostSocketId: string,
): Promise<void> {
    const room: Room = await getRoom(roomNumber);
    room.hostSocketId = hostSocketId;
    room.event!.isHostConnected = true;
    setRoom(roomNumber, room);
}
