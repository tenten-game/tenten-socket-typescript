import { Room } from "../../common/entity/room.entity";
import { User } from "../../common/entity/user.entity";
import { RoomMode } from "../../common/enums/enums";
import { UserCount } from "../../repository/common/dto/userCount.dto";
import { getRoom, setRoom } from "../../repository/common/room.repository";
import { addUserToRoom, getTotalAndTeamUserCount, getUserList, updateUserIconFromRoom, updateUserTeamFromRoom } from "../../repository/common/user.repository";
import { NormalRoomCreateRequest, NormalRoomEnterRequest, NormalRoomModeChangeRequest } from "./dto/request";
import { NormalRoomUserCountGetResponse, NormalRoomUserListGetResponse } from "./dto/response";

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
    await updateUserIconFromRoom(roomNumber, user, iconId);
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
    const teamIds: number[] = [0, 1]; // Normal 게임은 팀 0, 1
    const count = await getTotalAndTeamUserCount(roomNumber, teamIds);

    const [team0Count, team1Count] = teamIds.map(
        id => count.teamUserCount.find(team => team.teamId === id)?.count || 0
    );

    const diff = team0Count - team1Count;
    const team0ToTeam1Count = Math.floor(team0Count / 2) + (diff > 0 ? Math.floor(diff / 2) : 0);
    const team1ToTeam0Count = Math.floor(team1Count / 2) + (diff < 0 ? Math.floor(-diff / 2) : 0);

    const userList: Record<number, User> = await getUserList(roomNumber);

    // 팀별 유저 배열 만들기
    const team0Users: User[] = Object.values(userList).filter(user => user.t === teamIds[0]);
    const team1Users: User[] = Object.values(userList).filter(user => user.t === teamIds[1]);

    // team0Users에서 team0ToTeam1Count만큼 랜덤으로 뽑기
    const team0ToTeam1Users: User[] = [];
    for (let i = 0; i < team0ToTeam1Count; i++) {
        const randomIndex = Math.floor(Math.random() * team0Users.length);
        team0ToTeam1Users.push(team0Users[randomIndex]);
        team0Users.splice(randomIndex, 1);
    }

    // team1Users에서 team1ToTeam0Count만큼 랜덤으로 뽑기
    const team1ToTeam0Users: User[] = [];
    for (let i = 0; i < team1ToTeam0Count; i++) {
        const randomIndex = Math.floor(Math.random() * team1Users.length);
        team1ToTeam0Users.push(team1Users[randomIndex]);
        team1Users.splice(randomIndex, 1);
    }

    // 실제로 팀 변경 적용
    for (const user of team0ToTeam1Users) {
        await updateUserTeamFromRoom(roomNumber, user, teamIds[1]);
    }
    for (const user of team1ToTeam0Users) {
        await updateUserTeamFromRoom(roomNumber, user, teamIds[0]);
    }

}