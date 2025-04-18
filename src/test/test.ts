import { Socket } from 'socket.io-client';
import { RoomMode } from '../common/enums/enums';
import { TOTAL_CLIENTS } from './command';
import { checkIfChangedMode, checkIfEnterRoom, checkIfHostUserCount, checkIfHostUserList, checkIfRoomCreated, clientsEmitFinalScore, clientsEmitRealTimeScore, createClients, createHost, flushRedis, hostEmitCreateRoom, hostEmitExit, hostEmitFinishGame, hostEmitRoomChangeMode, hostEmitStartGame, hostEmitUserCount, hostEmitUserList, listenAllEvents, userEmitFinishGame, usersEmitEnterRoom } from "./methods";

(async function runTest() {
  console.log("시작")
  // const clientSockets: Socket[] = await createClients();
  // await listenAllEvents(clientSockets[0], clientSockets);
  // await usersEmitEnterRoom(clientSockets);

  // console.log("소켓 생성 및 REDIS 초기화")
  // const hostSocket: Socket = await createHost();
  // const clientSockets: Socket[] = await createClients();
  // await listenAllEvents(hostSocket, clientSockets);
  // await listenAllEvents(clientSockets[0], clientSockets);
  // await flushRedis();

  // console.log("호스트 방 생성")
  // await hostEmitCreateRoom(hostSocket);
  // await checkIfRoomCreated();

  // console.log("클라이언트 방 입장")
  // await usersEmitEnterRoom(clientSockets);
  // await checkIfEnterRoom();

  // console.log("SOLO 로 방 모드 변경")
  // await hostEmitRoomChangeMode(hostSocket, RoomMode.SOLO);
  // await checkIfChangedMode(RoomMode.SOLO, TOTAL_CLIENTS + 1);

  // console.log("TEAM 으로 방 모드 변경")
  // await hostEmitRoomChangeMode(hostSocket, RoomMode.TEAM);
  // await checkIfChangedMode(RoomMode.TEAM, (TOTAL_CLIENTS + 1) * 2);

  // console.log("유저 수 조회")
  // await hostEmitUserCount(hostSocket);
  // await checkIfHostUserCount();

  // console.log("유저 리스트 조회")
  // await hostEmitUserList(hostSocket);
  // await checkIfHostUserList();

  // console.log("게임 시작")
  // await hostEmitStartGame(hostSocket);

  // console.log("실시간 점수 등록")
  // await clientsEmitRealTimeScore(clientSockets);

  // console.log("실시간 점수 조회")
  // await clientsEmitRealTimeScore(clientSockets);

  // console.log("최종 점수 등록")
  // await clientsEmitFinalScore(clientSockets);

  // console.log("최종 랭킹 및 스코어 조회")
  // await hostEmitFinishGame(hostSocket);

  // console.log("나의 랭킹 조회")
  // await userEmitFinishGame(clientSockets);

  // console.log("게임 종료 후 로비로 이동");
  // await hostEmitExit(hostSocket);
})();
