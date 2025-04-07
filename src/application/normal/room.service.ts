import { RoomChangeModeRequest, RoomNumberRequest } from "../../common/dto/room.dto";
import { User } from "../../common/entity/user.entity";
import { getRoom, setRoom } from "../../repository/common/room.repository";
import { setRoomUser } from "../../repository/common/user.repository";

export function handleRoomCreate(room: RoomNumberRequest, user: User): void {
    const userId = user.i;
    setRoomUser(room.number, user);
}

export function handleRoomEnter(room: RoomNumberRequest, user: User): void {
    setRoomUser(room.number, user);
}

export async function handleRoomChangeMode(
    request: RoomChangeModeRequest,
    roomNumber: string,
    userId: number
): Promise<void> {
    const room = await getRoom(roomNumber);
    setRoom(roomNumber, room);
}
