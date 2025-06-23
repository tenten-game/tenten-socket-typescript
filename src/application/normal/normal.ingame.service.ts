import { User } from "../../common/entity/user.entity";
import { addUserToGameQueue, addUserFloorResult, getFirstUserInQueue, getGameResultsByFloor, clearGameQueue, clearGameResults } from "../../repository/normal/ingame.repository";
import { NormalInGame6040DoRequest } from "./dto/request";

export async function handleNormalInGame6030Do(roomNumber: string, userId: number): Promise<number> {
    await addUserToGameQueue(roomNumber, userId);
    return await getFirstUserInQueue(roomNumber);
}

export async function handleNormalInGame6030DoAfter(roomNumber: string): Promise<void> {
    await clearGameQueue(roomNumber);
}

export async function handleNormalInGame6040Do(roomNumber: string, user: User, request: NormalInGame6040DoRequest): Promise<void> {
    await addUserFloorResult(roomNumber, user, request.floorData);
}

export async function handleNormalInGame6040Finish(roomNumber: string): Promise<Record<number, User[]>> {
    return await getGameResultsByFloor(roomNumber);
}

export async function handleNormalInGame6040FinishAfter(roomNumber: string): Promise<void> {
    await clearGameResults(roomNumber);
}
