import { io, Socket } from 'socket.io-client';
import { EventFinishScorePostRequest } from '../application/event/dto/event.finish.dto';
import { RealTimeScorePostRequest } from '../application/event/dto/event.ingame.dto';
import { randomRealTimeScore, delay, ENTER_ROOM_REQUEST, TARGET, TOTAL_CLIENTS, randomFinishScore, getRandomTime } from "./command2";

export async function createClient(): Promise<Socket> {
    const socket: Socket = io(TARGET, {
        transports: ['websocket'],
    });
    return socket;
}

export async function createClients(): Promise<Socket[]> {
    const clientSockets: Socket[] = [];
    for (let i = 1; i <= TOTAL_CLIENTS; i++) {
        const clientSocket: Socket = await createClient();
        clientSockets.push(clientSocket);
    }
    await delay();
    return clientSockets;
}

export async function listenAllEvents(clientSockets: Socket[]): Promise<void> {
    const sockets: Socket[] = [...clientSockets];
    sockets.forEach(async socket => {     
        socket.on("event.lobby.startedGame", (req: any) => {
            const request: RealTimeScorePostRequest = typeof req === 'string' ? JSON.parse(req) : req;        
            setTimeout(() => {
                const interval = setInterval(() => {
                    socket.emit(
                        "event.ingame.realTimeScore.post",
                        new RealTimeScorePostRequest(
                            randomRealTimeScore(),
                            request.match
                        )
                    );
                }, 1000);
        
                // 18초 후 interval 정지
                setTimeout(() => {
                    clearInterval(interval);
                }, 20000); // 7초 + 18초 = 25초에 종료됨
            }, 7000); // 시작까지 7초 대기
        
            // 20초 뒤에 finish 이벤트 전송
            setTimeout(() => {
                socket.emit("event.finish.score.post", new EventFinishScorePostRequest(
                    randomFinishScore(),
                    request.match
                )); // match 정보 넘긴다고 가정
            }, 20000);
        });
    });
}

export async function usersEmitEnterRoom(clientSockets: Socket[]): Promise<void> {
    const MIN = 10_000_000;
    const MAX = 20_000_000 - clientSockets.length; // 예: 10_000_000 ~ 19_998_500

    const randomOffset = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

    for (let i = 0; i < clientSockets.length; i++) {
        const clientSocket = clientSockets[i];
        const randomTime = getRandomTime();

        setTimeout(() => {
            const userCode = i + randomOffset;
            clientSocket.emit('event.room.enter', ENTER_ROOM_REQUEST(userCode));
        }, randomTime);
    }
}