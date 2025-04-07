import { Event } from "../../application/event/dto/event.room.dto";
import { RoomMode } from "../enums/enums";

export class Room {
    hostSocketId: string;
    master: number = 0;
    starter: number = 0;
    mode: RoomMode = RoomMode.SOLO;
    event: Event | null = null;

    constructor(hostSocketId: string, master: number, starter: number, mode: RoomMode, event: Event | null) {
        this.hostSocketId = hostSocketId;
        this.master = master;
        this.starter = starter;
        this.mode = mode;
        this.event = event;
    }
}