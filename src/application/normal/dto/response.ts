import { User } from "../../../common/entity/user.entity";
import { TeamUserCount } from "../../../repository/common/dto/userCount.dto";

export class NormalRoomUserListGetResponse{
    constructor(
        public users: User[],
    ) { }
}

export class NormalRoomUserCountGetResponse{
    constructor(
        public totalUserCount: number,
        public teamUserCount: TeamUserCount[],
    ) { }
}

export class NormalInGame6040FinishResponse{
    constructor(
        public floorData: number,
    ) { }
}

export class NormalRoomUserTeamShuffleResponse{
    constructor(
        public users: User[],
    ) { }
}