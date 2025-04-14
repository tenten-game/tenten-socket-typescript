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
    const userList: Record<number, User> = await getUserList(roomNumber);
    return userList;
}

export async function handleEventLobbyUserListReset(roomNumber: string): Promise<void> {
    resetAllUser(roomNumber);
}

export async function handleShuffleTeam(roomNumber: string): Promise<number[]> {
    const room: Room = await getRoom(roomNumber);
    const teamIds: number[] = room.event!.eventTeams.map((team) => team.id);
    const count = await getTotalAndTeamUserCount(roomNumber, teamIds);

    const [aCount, bCount] = teamIds.map(
        id => count.teamUserCount.find(team => team.teamId === id)?.count || 0
    );

    const diff = aCount - bCount;
    const teamAToTeamBCount = Math.floor(aCount / 2) + (diff > 0 ? Math.floor(diff / 2) : 0);
    const teamBToTeamACount = Math.floor(bCount / 2) + (diff < 0 ? Math.floor(-diff / 2) : 0);

    const userList: Record<number, User> = await getUserList(roomNumber);

    // 팀별 유저 배열 만들기
    const teamAUsers: User[] = Object.values(userList).filter(user => user.t === teamIds[0]);
    const teamBUsers: User[] = Object.values(userList).filter(user => user.t === teamIds[1]);

    // team1Users에서 teamAToTeamBCount만큼 랜덤으로 뽑기
    const teamAToTeamBUsers: User[] = [];
    for (let i = 0; i < teamAToTeamBCount; i++) {
        const randomIndex = Math.floor(Math.random() * teamAUsers.length);
        teamAToTeamBUsers.push(teamAUsers[randomIndex]);
        teamAUsers.splice(randomIndex, 1);
    }

    // team2Users에서 teamBToTeamACount만큼 랜덤으로 뽑기
    const teamBToTeamAUsers: User[] = [];
    for (let i = 0; i < teamBToTeamACount; i++) {
        const randomIndex = Math.floor(Math.random() * teamBUsers.length);
        teamBToTeamAUsers.push(teamBUsers[randomIndex]);
        teamBUsers.splice(randomIndex, 1);
    }

    const aIds = teamAToTeamBUsers.map(user => user.i);
    const bIds = teamBToTeamAUsers.map(user => user.i);

    return [...aIds, ...bIds];
}