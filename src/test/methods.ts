import { EventFinishScoreGetRequest } from "../application/event/dto/event.finish.dto";
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
    await delay();
}

export async function createClient(id: number): Promise<Socket> {
    const socket: Socket = io(TARGET, { 
        transports: ['websocket'],
    });
    return socket;
}

export async function createHost(): Promise<Socket> {
    const socket: Socket = io(TARGET, { transports: ['websocket'] });
    return socket;
}

export async function createClients(): Promise<Socket[]> {
    const clientSockets: Socket[] = [];
    const random = Math.floor(Math.random() * 10000) + 1;
    for (let i = 1; i <= TOTAL_CLIENTS; i++) {
        const clientSocket: Socket = await createClient(i + random);
        clientSockets.push(clientSocket);
    }
    await delay();
    return clientSockets;
}

export async function listenAllEvents(hostSocket: Socket, clientSockets: Socket[]): Promise<void> {
    // hostSocket.on("event.finish.score.got.host", (data: any) => {
    //     redisClient.set("00000000" + "_RANKING_RESULT_HO", JSON.stringify(data));
    // });
    // const sockets: Socket[] = [hostSocket, ...clientSockets];
    const sockets: Socket[] = [...clientSockets];
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
        socket.on("event.lobby.startedGame", (data: any) => {
            redisClient.incr("00000000" + "_L_event.lobby.startedGame");
        });
        socket.on("event.finish.score.got", (data: any) => {
            redisClient.set("00000000" + "_RANKING_RESULT_CL", JSON.stringify(data));
        });

        socket.on("test.realtimescore", (data: any) => {
            const request: EventFinishScoreGetRequest = typeof data === 'string' ? JSON.parse(data) : data;
            socket.emit('event.ingame.realTimeScore.post', {
                "score": Math.floor(Math.random() * 200),
                "match": request.match
            });
        });

        socket.on("test.finalscore", (data: any) => {
            const request: EventFinishScoreGetRequest = typeof data === 'string' ? JSON.parse(data) : data;
            socket.emit('event.finish.score.post', {
                "score": Math.floor(Math.random() * 500),
                "match": request.match
            });
        });

    });
    await delay();
}

export async function hostEmitCreateRoom(hostSocket: Socket): Promise<void> {
    hostSocket.emit(CREATE_ROOM_EMIT, CREATE_ROOM_REQUEST);
    await delay();
}

export async function checkIfRoomCreated(): Promise<void> {
    const roomString = await redisClient.get(ROOM_NUMBER) || '';
    if (roomString.indexOf('"hostSocketId":') === -1) throw new Error('방 생성 - 소켓 ID 없음');
    const listendCount = parseInt(await redisClient.get(CREATE_ROOM_VALID_KEY) || '0');
    if (listendCount != 1) throw new Error('방 생성 - LISTEN 수 불일치');
    await delay();
}

export async function usersEmitEnterRoom(clientSockets: Socket[]): Promise<void> {
    let i = 1;
    const random = Math.floor(Math.random() * 10000000) + 1;
    for (const clientSocket of clientSockets) {
        clientSocket.emit(ENTER_ROOM_EMIT, ENTER_ROOM_REQUEST(i + random));
        i++;
    }
    await delay();
}

export async function checkIfEnterRoom(): Promise<void> {
    const listendCount = parseInt(await redisClient.get(ENTER_ROOM_VALID_KEY) || '0');
    if (listendCount != TOTAL_CLIENTS * 2) throw new Error('유저 방 입장 - LISTEN 수 불일치');
    const userCount = await redisClient.zcard(ROOM_NUMBER + '_USERLIST');
    if (userCount != TOTAL_CLIENTS) throw new Error('유저 방 입장 - 유저 수 불일치');
    await delay();
}

export async function hostEmitRoomChangeMode(hostSocket: Socket, mode: RoomMode): Promise<void> {
    hostSocket.emit(HOST_ROOM_CHANGE_MODE_EMIT, HOST_ROOM_CHANGE_MODE_REQUEST(mode));
    await delay();
}

export async function checkIfChangedMode(mode: RoomMode, expectedListendCount: number): Promise<void> {
    const roomString = await redisClient.get(ROOM_NUMBER) || '';
    if (roomString.indexOf(`"mode":"${mode}"`) === -1) throw new Error();
    const listendCount = parseInt(await redisClient.get(HOST_ROOM_CHANGE_MODE_VALID_KEY) || '0');
    if (listendCount != expectedListendCount) throw new Error();
    await delay();
}

export async function hostEmitStartGame(hostSocket: Socket): Promise<void> {
    hostSocket.emit('event.lobby.startGame', {
        "gameNumber": 4010,
        "roomNumber": "MC000000",
    });
    await delay();
}

export async function clientsEmitRealTimeScore(clientSockets: Socket[]): Promise<void> {
    let i = 1;
    for (const clientSocket of clientSockets) {
        clientSocket.emit('event.ingame.realTimeScore.post', {
            "score": Math.floor(Math.random() * 100),
            "match": 1
        });
        i++;
    }
    await delay();
}

export async function clientsEmitFinalScore(clientSockets: Socket[]): Promise<void> {
    let i = 1;
    for (const clientSocket of clientSockets) {
        clientSocket.emit('event.finish.score.post', {
            "score": Math.floor(Math.random() * 500),
            "match": 1
        });
        i++;
    }
    await delay();
}

export async function hostEmitFinishGame(hostSocket: Socket): Promise<void> {
    hostSocket.emit('event.finish.score.get', {
        "match": 1
    });
    await delay();
}

export async function hostEmitUserCount(hostSocket: Socket): Promise<void> {

    await delay();
}

export async function checkIfHostUserCount(): Promise<void> {

    await delay();
}

export async function hostEmitUserList(hostSocket: Socket): Promise<void> {

    await delay();
}

export async function checkIfHostUserList(): Promise<void> {

    await delay();
}

export async function userEmitFinishGame(clientSockets: Socket[]): Promise<void> {
    await delay();
}

export async function hostEmitExit(hostSocket: Socket): Promise<void> {
    await delay();
}