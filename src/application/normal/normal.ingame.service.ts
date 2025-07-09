import { User } from "../../common/entity/user.entity";
import { add6030Do, add6040Do, get6030Do, get6040Finish, remove6030, remove6040 } from "../../repository/normal/ingame.repository";
import { NormalInGame6040DoRequest } from "./dto/request";
import { NormalInGame6030DoResponse, NormalInGame6040DoResponse } from "./dto/response";

export async function handleNormalInGame6030Do(roomNumber: string, userId: number): Promise<NormalInGame6030DoResponse> {
    await add6030Do(roomNumber, userId);
    const doUserId: number = await get6030Do(roomNumber)
    return new NormalInGame6030DoResponse(doUserId);
}

export async function handleNormalInGame6030DoAfter(roomNumber: string): Promise<void> {
    await remove6030(roomNumber);
}

export async function handleNormalInGame6040Do(roomNumber: string, user: User, request: NormalInGame6040DoRequest): Promise<NormalInGame6040DoResponse> {
    await add6040Do(roomNumber, user, request.floorData);
    return new NormalInGame6040DoResponse(user.i, request.floorData);
}

export async function handleNormalInGame6040Finish(roomNumber: string): Promise<Record<number, User[]>> {
    return await get6040Finish(roomNumber);
}

export async function handleNormalInGame6040FinishAfter(roomNumber: string): Promise<void> {
    await remove6040(roomNumber);
}
