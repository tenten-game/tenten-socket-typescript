import { Room } from "../../common/entity/room.entity";
import { User } from "../../common/entity/user.entity";
import { UserCount } from "../../repository/common/entity/userCount.dto";
import { getRoom } from "../../repository/common/room.repository";
import { getUserCount, getUserList } from "../../repository/common/user.repository";

export async function handleLobbyUserCountGet(roomNumber: string): Promise<UserCount> {
    const room: Room = await getRoom(roomNumber);
    if (!room.event) throw new Error("Event not found");
    return await getUserCount(roomNumber, room.event.eventTeams.map((team) => team.id));
}

export async function handleLobbyUserListGet(roomNumber: string): Promise<Record<number, User>> {
    const room: Room = await getRoom(roomNumber);
    if (!room.event) throw new Error("Event not found");
    const userList: Record<number, User> = await getUserList(roomNumber);
    return userList;
}
