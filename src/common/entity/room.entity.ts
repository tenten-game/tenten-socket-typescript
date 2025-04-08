import { Event } from "../../application/event/dto/event.room.dto";
import { RoomMode } from "../enums/enums";

export class Room {
    constructor(
        public hostSocketId: string,
        public master: number = 0,
        public starter: number = 0,
        public mode: RoomMode = RoomMode.SOLO,
        public event: Event | null = null,
    ) { }
}