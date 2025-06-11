import { Room } from "../../common/entity/room.entity";
import { User } from "../../common/entity/user.entity";
import { RoomMode } from "../../common/enums/enums";
import { UserCount } from "../../repository/common/dto/userCount.dto";
import { getRoom, setRoom } from "../../repository/common/room.repository";
import { addUserToRoom, getTotalAndTeamUserCount, getUserList, updateUserIconFromRoom, updateUserTeamFromRoom } from "../../repository/common/user.repository";
import { NormalRoomCreateRequest, NormalRoomEnterRequest, NormalRoomModeChangeRequest } from "./dto/request";
import { NormalRoomUserCountGetResponse, NormalRoomUserListGetResponse } from "./dto/response";

export function handleNormalRoomCreate(request: NormalRoomCreateRequest): void {
    const user = request.user;
    const room = new Room(
        "", user.i, user.i, RoomMode.INDIVIDUAL, null
    )
    setRoom(request.roomNumber, room);
}

export async function handleNormalRoomEnter(request: NormalRoomEnterRequest): Promise<void> {
    addUserToRoom(request.roomNumber, request.user);
}

export async function handleNormalRoomChangeMode(
    roomNumber: string,
    request: NormalRoomModeChangeRequest,
): Promise<void> {
    const room = await getRoom(roomNumber);
    room.mode = request.mode;
    setRoom(roomNumber, room);
}

export async function handleNormalRoomUserListGet(
    roomNumber: string,
): Promise<NormalRoomUserListGetResponse> {
    const userList: Record<number, User> = await getUserList(roomNumber);
    return new NormalRoomUserListGetResponse(Object.values(userList));
}

export async function handleNormalRoomUserCountGet(
    roomNumber: string,
): Promise<NormalRoomUserCountGetResponse> {
    const teamUserCount: UserCount = await getTotalAndTeamUserCount(roomNumber, [0, 1]);

    return new NormalRoomUserCountGetResponse(
        teamUserCount.totalUserCount,
        teamUserCount.teamUserCount,
    );
}

export async function handleNormalRoomUserIconChange(
    roomNumber: string,
    user: User,
    iconId: number,
): Promise<void> {
    updateUserIconFromRoom(roomNumber, user, iconId);
}

export async function handleNormalRoomUserTeamChange(
    roomNumber: string,
    user: User,
    teamId: number,
): Promise<void> {
    updateUserTeamFromRoom(roomNumber, user, teamId);
}

export async function handleNormalRoomUserTeamShuffle(
    roomNumber: string,
    user: User,
): Promise<void> {

}