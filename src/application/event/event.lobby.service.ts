import { Room } from "../../common/entity/room.entity";
import { User } from "../../common/entity/user.entity";
import { UserCount } from "../../repository/common/dto/userCount.dto";
import { getRoom } from "../../repository/common/room.repository";
import { getTotalAndTeamUserCount, getUserList, resetAllUser } from "../../repository/common/user.repository";

export async function handleLobbyUserCountGet(roomNumber: string): Promise<UserCount> {
    const room: Room = await getRoom(roomNumber);
    if (!room.event) throw new Error("Event not found");
    return await getTotalAndTeamUserCount(roomNumber, room.event.eventTeams.map((team) => team.id));
}

export async function handleLobbyUserListGet(roomNumber: string): Promise<Record<number, User>> {
    const room: Room = await getRoom(roomNumber);
    if (!room.event) throw new Error("Event not found");
    const userList: Record<number, User> = await getUserList(roomNumber);
    return userList;
}

export async function handleEventLobbyUserListReset(roomNumber: string): Promise<void> {
    resetAllUser(roomNumber);
}