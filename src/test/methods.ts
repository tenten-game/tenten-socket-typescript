import { RoomMode } from "../common/enums/enums";
import { redisClient } from "../config/redis.config";
import { CREATE_ROOM_EMIT, CREATE_ROOM_ON, CREATE_ROOM_REQUEST, CREATE_ROOM_VALID_KEY, ENTER_ROOM_EMIT, ENTER_ROOM_ON, ENTER_ROOM_REQUEST, ENTER_ROOM_VALID_KEY, HOST_ROOM_CHANGE_MODE_EMIT, HOST_ROOM_CHANGE_MODE_ON, HOST_ROOM_CHANGE_MODE_REQUEST, HOST_ROOM_CHANGE_MODE_VALID_KEY, ROOM_NUMBER, TARGET, TOTAL_CLIENTS } from "./command";
import { io, Socket } from 'socket.io-client';

export function delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 2000));
}

export async function flushRedis(): Promise<void> {
   const keys = await redisClient.keys(ROOM_NUMBER + '*');
    if (keys.length > 0) {
        await redisClient.del(keys);
    }
}

export async function createClient(id: number): Promise<Socket> {
    const socket: Socket = io(TARGET, { transports: ['websocket'] });
    return socket;
}

export async function createHost(): Promise<Socket> {
    const socket: Socket = io(TARGET, { transports: ['websocket'] });
    return socket;
}

export async function createClients(): Promise<Socket[]> {
    const clientSockets: Socket[] = [];
    for (let i = 1; i <= TOTAL_CLIENTS; i++) {
        const clientSocket: Socket = await createClient(i);
        clientSockets.push(clientSocket);
    }
    return clientSockets;
}

export async function listenAllEvents(hostSocket: Socket, clientSockets: Socket[]): Promise<void> {
    const sockets: Socket[] = [hostSocket, ...clientSockets];
    sockets.forEach(socket => {
        socket.on('connect_error', (err) => {
            console.log(`Socket ${socket.id} connection error: ${err}`);
          });
        socket.on('disconnect', (reason: string) => {
            console.log(`Socket ${socket.id} disconnected: ${reason}`);
        });

        socket.on(CREATE_ROOM_ON, (data: any) => {
            redisClient.incr(CREATE_ROOM_VALID_KEY);
        });
        socket.on(ENTER_ROOM_ON, (data: any) => {
            redisClient.incr(ENTER_ROOM_VALID_KEY);
        });
        socket.on(HOST_ROOM_CHANGE_MODE_ON, (data: any) => {
            redisClient.incr(HOST_ROOM_CHANGE_MODE_VALID_KEY);
        });
    });
}

export async function hostEmitCreateRoom(hostSocket: Socket): Promise<void> {
    hostSocket.emit(CREATE_ROOM_EMIT, CREATE_ROOM_REQUEST);
}

export async function checkIfRoomCreated(): Promise<void> {
    const roomString = await redisClient.get(ROOM_NUMBER) || '';
    if (roomString.indexOf('"hostSocketId":') === -1) throw new Error();
    const listendCount = parseInt(await redisClient.get(CREATE_ROOM_VALID_KEY) || '0');
    if (listendCount != 1) throw new Error();
}

export async function usersEmitEnterRoom(clientSockets: Socket[]): Promise<void> {
    let i = 1;
    for (const clientSocket of clientSockets) {
        clientSocket.emit(ENTER_ROOM_EMIT, ENTER_ROOM_REQUEST(i));
        i++;
    }
}

export async function checkIfEnterRoom(): Promise<void> {
    const listendCount = parseInt(await redisClient.get(ENTER_ROOM_VALID_KEY) || '0');
    if (listendCount != TOTAL_CLIENTS) throw new Error();
    const userCount = await redisClient.zcard(ROOM_NUMBER + '_USERLIST');
    if (userCount != TOTAL_CLIENTS) throw new Error();
}

export async function hostEmitRoomChangeMode(hostSocket: Socket, mode: RoomMode): Promise<void> {
    hostSocket.emit(HOST_ROOM_CHANGE_MODE_EMIT, HOST_ROOM_CHANGE_MODE_REQUEST(mode));
}

export async function checkIfChangedMode(mode: RoomMode, expectedListendCount: number): Promise<void> {
    const roomString = await redisClient.get(ROOM_NUMBER) || '';
    if (roomString.indexOf(`"mode":"${mode}"`) === -1) throw new Error();
    const listendCount = parseInt(await redisClient.get(HOST_ROOM_CHANGE_MODE_VALID_KEY) || '0');
    if (listendCount != expectedListendCount) throw new Error();
}