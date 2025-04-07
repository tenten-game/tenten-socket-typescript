export class RoomNumberRequest {
    number: string;
    
    constructor(room: string) {
        this.number = room;
    }
}

export class RoomChangeModeRequest {
    mode: string;
    
    constructor(mode: string) {
        this.mode = mode;
    }
}