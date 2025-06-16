import { Room } from "../../common/entity/room.entity";
import { User } from "../../common/entity/user.entity";
import { RoomMode } from "../../common/enums/enums";
import { UserCount } from "../../repository/common/dto/userCount.dto";
import { getRoom, setRoom } from "../../repository/common/room.repository";
import { addUserToRoom, getTotalAndTeamUserCount, getUserList, updateUserIconFromRoom, updateUserTeamFromRoom, batchUpdateUserTeams } from "../../repository/common/user.repository";
import { validateIfRequesterIsRoomMaster } from "../common/validator.service";
import { NormalRoomCreateRequest, NormalRoomEnterRequest, NormalRoomModeChangeRequest } from "./dto/request";
import { NormalRoomUserCountGetResponse, NormalRoomUserListGetResponse, NormalRoomUserTeamShuffleResponse } from "./dto/response";

export async function handleNormalRoomCreate(request: NormalRoomCreateRequest): Promise<void> {
    const user = request.user;
    const room = new Room(
        "", user.i, user.i, RoomMode.INDIVIDUAL, null
    )
    await setRoom(request.roomNumber, room);
    await addUserToRoom(request.roomNumber, user);
}

export async function handleNormalRoomEnter(request: NormalRoomEnterRequest): Promise<void> {
    await addUserToRoom(request.roomNumber, request.user);
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
    user: User,
    iconId: number,
): Promise<void> {
    await updateUserIconFromRoom(roomNumber, user, iconId);
}

export async function handleNormalRoomUserTeamChange(
    roomNumber: string,
    user: User,
    teamId: number,
): Promise<void> {
    await updateUserTeamFromRoom(roomNumber, user, teamId);
}

export async function handleNormalRoomUserTeamShuffle(
    roomNumber: string,
    user: User,
): Promise<NormalRoomUserTeamShuffleResponse> {
    await validateIfRequesterIsRoomMaster(user.i, roomNumber);
    const userMap: Record<number, User> = await getUserList(roomNumber);
    const users: User[] = Object.values(userMap);
    for (let i = users.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [users[i], users[j]] = [users[j], users[i]];
    }

    const half = Math.floor(users.length / 2);
    const assignments = users.map((u, idx) => ({
        user: u,
        targetTeam: idx < half ? 0 : 1
    }));

    // Batch all team updates using Pipeline for better performance
    const usersToUpdate = assignments.filter(({ user, targetTeam }) => user.t !== targetTeam);
    if (usersToUpdate.length > 0) {
        await batchUpdateUserTeams(roomNumber, usersToUpdate.map(({ user, targetTeam }) => ({ user, teamId: targetTeam })));
    }

    const userList: Record<number, User> = await getUserList(roomNumber);
    return new NormalRoomUserTeamShuffleResponse(
        Object.values(userList)
    );
}