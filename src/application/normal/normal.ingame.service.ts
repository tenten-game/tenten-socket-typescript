import { User } from "../../common/entity/user.entity";
import { add6030Do as add6030Do, add6040Do, get6030Do } from "../../repository/normal/ingame.repository";
import { NormalInGame6040DoRequest } from "./dto/request";

export async function handleNormalInGame6030Do(roomNumber: string, userId: number): Promise<number> {
    await add6030Do(roomNumber, userId);
    return await get6030Do(roomNumber);
}

export async function handleNormalInGame6040Do(roomNumber: string, user: User, request: NormalInGame6040DoRequest): Promise<void> {
    await add6040Do(roomNumber, user, request.floorData);
}
