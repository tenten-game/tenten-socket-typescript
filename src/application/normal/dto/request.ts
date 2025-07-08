import { User } from "../../../common/entity/user.entity";
import { RoomMode } from "../../../common/enums/enums";

export class NormalRoomCreateRequest {
    constructor(
        public user: User,
        public roomNumber: string,
    ) { }
}

export class NormalRoomEnterRequest {
    constructor(
        public user: User,
        public roomNumber: string,
    ) { }
}

export class NormalRoomModeChangeRequest {
    constructor(
        public mode: RoomMode,
    ) { }
}

export class NormalFinishScorePostRequest {
    constructor(
        public matchCode: string,
        public score: number,
    ) { }
}

export class NormalRoomUserIconChangeRequest {
    constructor(
        public iconId: number,
    ) { }
}

export class NormalRoomUserTeamChangeRequest {
    constructor(
        public teamId: number,
    ) { }
}

export class NormalRoomGameStartRequest{
    constructor(
        public gameNumber: number,
        public playSeconds: number,
    ) { }
}

export class NormalInGame6040DoRequest{
    constructor(
        public floorData: number,
    ) { }
}
