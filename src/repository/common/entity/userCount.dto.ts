export class TeamUserCount {
    constructor(
        public teamId: number, 
        public count: number
    ) { }
}

export class UserCount {
    constructor(
        public totalUserCount: number,
        public teamUserCount: TeamUserCount[],
    ) { }
}
