import { Room } from "../../common/entity/room.entity";
import { User } from "../../common/entity/user.entity";
import { deleteAllRoomData, getRoom, setRoom } from "../../repository/common/room.repository";
import { deleteUserFromRoom, getTotalUserCount, getUser, getUserList } from "../../repository/common/user.repository";

export async function handleNormalUserDisconnected(roomNumber: string, userId: number): Promise<NormalDisconnectResponse> {
    const room: Room = await getRoom(roomNumber);
    const isMaster = room.master == userId;
    const isStarter = room.starter == userId;
    const user: User = await getUser(roomNumber, userId);

    // 병렬 처리로 성능 개선
    const [, remainingUserCount] = await Promise.all([
        deleteUserFromRoom(roomNumber, userId),
        getTotalUserCount(roomNumber)
    ]);

    // 방에 아무도 없으면 방 삭제 필요
    if (remainingUserCount === 0) {
        await deleteAllRoomData(roomNumber);
        return new NormalDisconnectResponse(user, null, null, isMaster, isStarter, true);
    }

    const userList = await getUserList(roomNumber);
    const remainingUsers = Object.values(userList);

    let newMaster = room.master;
    let newStarter = room.starter;
    let masterChanged = false;
    let starterChanged = false;

    // 방장이 나갔을 때 다음 사용자에게 위임
    if (isMaster && remainingUsers.length > 0) {
        newMaster = remainingUsers[0].i;
        masterChanged = true;
    }

    // 스타터가 나갔을 때 다음 사용자에게 위임
    if (isStarter && remainingUsers.length > 0) {
        newStarter = remainingUsers[0].i;
        starterChanged = true;
    }

    // Room 정보 업데이트
    if (masterChanged || starterChanged) {
        room.master = newMaster;
        room.starter = newStarter;
        await setRoom(roomNumber, room);
    }

    return new NormalDisconnectResponse(
        user,
        masterChanged ? newMaster : null,
        starterChanged ? newStarter : null,
        isMaster,
        isStarter,
        false,
    );
}

export async function handleEventHostDisconnected(roomNumber: string): Promise<DisconnectResponse> {
    const room: Room = await getRoom(roomNumber);
    if (room.event) room.event.isHostConnected = false;
    setRoom(roomNumber, room);
    const totalUser = await getTotalUserCount(roomNumber);
    return new DisconnectResponse(
        totalUser == 0 && room.event?.isHostConnected == false,
        0,
    );
}

export async function handleEventUserDisconnected(roomNumber: string, userId: number): Promise<DisconnectResponse> {
    await deleteUserFromRoom(roomNumber, userId);
    const totalUser = await getTotalUserCount(roomNumber);
    const room = await getRoom(roomNumber);
    const needToDeleteRoom = totalUser == 0 && room.event?.isHostConnected == false;
    return new DisconnectResponse(
        needToDeleteRoom,
        new EventUserDisconnectedResponse(
            room.hostSocketId,
            room.event?.isHostConnected,
            totalUser
        )
    );
}

export class EventUserDisconnectedResponse {
    constructor(
        public hostSocketId: string,
        public isHostConnected: boolean = true,
        public totalUserCount: number,
    ) { }
}

export class NormalDisconnectResponse {
    constructor(
        public user: User,
        public newMaster: number | null,
        public newStarter: number | null,
        public isMaster: boolean,
        public isStarter: boolean,
        public needToDeleteRoom: boolean,
    ) { }
}

export class DisconnectResponse {
    constructor(
        public needToDeleteRoom: boolean,
        public data: any,
    ) { }
}