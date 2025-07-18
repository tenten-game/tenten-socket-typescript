import { User } from "../../../common/entity/user.entity";
import { TeamUserCount } from "../../../repository/common/dto/userCount.dto";

export class NormalRoomUserListGetResponse {
    constructor(
        public users: User[],
    ) { }
}

export class NormalRoomUserCountGetResponse {
    constructor(
        public totalUserCount: number,
        public teamUserCount: TeamUserCount[],
    ) { }
}

export class NormalInGame6040FinishResponse {
    constructor(
        public floorData: number,
    ) { }
}

export class NormalRoomUserTeamShuffleResponse {
    constructor(
        public users: User[],
    ) { }
}

export class NormalRoomEnterResponse {
    constructor(
        public user: User,
        public roomNumber: string,
    ) { }
}

export class NormalRoomReenterResponse {
    constructor(
        public user: User,
        public roomNumber: string,
    ) { }
}

export class NormalRoomGameStartResponse {
    constructor(
        public matchCode: string,
        public gameNumber: number,
        public playSeconds: number,
    ) { }
}

export class NormalRoomLeaveResponse {
    constructor(
        public user: User,
        public isMaster: boolean,
        public isStarter: boolean,
        public newMaster?: number | null,
        public newStarter?: number | null,
    ) { }
}

export class NormalRoomUserIconChangeResponse {
    constructor(
        public userId: number,
        public iconId: number,
    ) { }
}

export class NormalRoomUserTeamChangeResponse {
    constructor(
        public userId: number,
        public teamId: number,
    ) { }
}

export class NormalInGame6030DoResponse {
    constructor(
        public userId: number,
    ) { }
}

export class NormalInGame6040DoResponse {
    constructor(
        public userId: number,
        public floorData: number,
    ) { }
}

export class NormalFinishScorePostResponse {
    constructor(
        public userId: number,
        public matchCode: string,
        public score: number,
    ) { }
}

export class NormalRoomStarterChangeRequest {
    constructor(
        public newStarter: number,
    ) { }
}