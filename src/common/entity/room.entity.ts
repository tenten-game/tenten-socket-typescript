import { Event } from "../../application/event/dto/request";
import { RoomMode } from "../enums/enums";

export class Room {
    constructor(
        public hostSocketId: string,
        public master: number = 0,
        public starter: number = 0,
        public mode: RoomMode = RoomMode.INDIVIDUAL,
        public event: Event | null = null,
    ) { }
}