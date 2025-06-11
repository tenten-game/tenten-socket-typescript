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