import { Room } from "../../common/entity/room.entity";
import { User } from "../../common/entity/user.entity";
import { RoomMode } from "../../common/enums/enums";
import { UserCount } from "../../repository/common/dto/userCount.dto";
import { getRoom, setRoom } from "../../repository/common/room.repository";
import { addUserToRoom, batchUpdateUserTeams, getTotalAndTeamUserCount, getUserList, updateUserIconFromRoom, updateUserTeamFromRoom } from "../../repository/common/user.repository";
import { validateIfRequesterIsRoomMaster } from "../common/validation.service";
import { NormalRoomCreateRequest, NormalRoomEnterRequest, NormalRoomModeChangeRequest } from "./dto/request";
import { NormalRoomEnterResponse, NormalRoomUserCountGetResponse, NormalRoomUserIconChangeResponse, NormalRoomUserListGetResponse, NormalRoomUserTeamChangeResponse, NormalRoomUserTeamShuffleResponse } from "./dto/response";

export async function handleNormalRoomCreate(request: NormalRoomCreateRequest, hostSocketId: string): Promise<void> {
    const user = request.user;
    const room = new Room(hostSocketId, user.i, user.i, RoomMode.INDIVIDUAL, null);
    await setRoom(request.roomNumber, room);
    await addUserToRoom(request.roomNumber, user);
}

export async function handleNormalRoomEnter(request: NormalRoomEnterRequest): Promise<NormalRoomEnterResponse> {
    await addUserToRoom(request.roomNumber, request.user);
    return new NormalRoomEnterResponse(request.user, request.roomNumber);
}

export async function handleNormalRoomChangeMode(
    roomNumber: string,
    request: NormalRoomModeChangeRequest,
): Promise<void> {
    const room = await getRoom(roomNumber);
    room.mode = request.mode;
    await setRoom(roomNumber, room);
}

export async function handleNormalRoomUserListGet(
    roomNumber: string,
): Promise<NormalRoomUserListGetResponse> {
    const userlist: Record<number, User> = await getUserList(roomNumber);
    return new NormalRoomUserListGetResponse(Object.values(userlist));
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
    userId: number,
    iconId: number,
): Promise<NormalRoomUserIconChangeResponse> {
    await updateUserIconFromRoom(roomNumber, userId, iconId);
    return new NormalRoomUserIconChangeResponse(userId, iconId);
}

export async function handleNormalRoomUserTeamChange(
    roomNumber: string,
    userId: number,
    teamId: number,
): Promise<NormalRoomUserTeamChangeResponse> {
    await updateUserTeamFromRoom(roomNumber, userId, teamId);
    return new NormalRoomUserTeamChangeResponse(userId, teamId);
}

export async function handleNormalRoomUserTeamShuffle(
    roomNumber: string,
    userId: number,
): Promise<NormalRoomUserTeamShuffleResponse> {
    await validateIfRequesterIsRoomMaster(userId, roomNumber);
    const userMap: Record<number, User> = await getUserList(roomNumber);
    const users: User[] = Object.values(userMap);
    for (let i = users.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [users[i], users[j]] = [users[j], users[i]];
    }

    const half = Math.floor(users.length / 2);
    const assignments = users.map((u, idx) => ({
        user: u,
        targetTeam: idx < half ? -1 : -2
    }));

    const usersToUpdate = assignments.filter(({ user, targetTeam }) => user.t !== targetTeam);
    if (usersToUpdate.length > 0) {
        await batchUpdateUserTeams(roomNumber, usersToUpdate.map(({ user, targetTeam }) => ({ user, teamId: targetTeam })));
    }

    const userList: Record<number, User> = await getUserList(roomNumber);
    return new NormalRoomUserTeamShuffleResponse(
        Object.values(userList)
    );
}