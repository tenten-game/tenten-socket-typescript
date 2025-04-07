import { getRoomUser, getRoomUserMap } from "../../repository/common/user.repository";
import { User } from "../../common/entity/user.entity";

export async function handleLobbyUserCountGet(roomNumber: string): Promise<any> {
    const users: Record<string, User> = await getRoomUserMap(roomNumber);
    return null;
}
