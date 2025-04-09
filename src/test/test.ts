import { Socket } from 'socket.io-client';
import { checkIfChangedMode, checkIfEnterRoom, checkIfRoomCreated, createClients, createHost, delay, flushRedis, hostEmitCreateRoom, hostEmitRoomChangeMode, listenAllEvents, usersEmitEnterRoom } from "./methods";
import { RoomMode } from '../common/enums/enums';
import { TOTAL_CLIENTS } from './command';

(async function runTest() {

  console.log("0. 소켓 생성 및 REDIS 초기화")
  await delay();
  const hostSocket: Socket = await createHost();
  await delay();
  const clientSockets: Socket[] = await createClients();
  await delay();
  await listenAllEvents(hostSocket, clientSockets);
  await delay();
  await flushRedis();
  console.log("0. 소켓 생성 및 REDIS 초기화 완료")

  await delay();

  console.log("1. 호스트 방 생성")
  await hostEmitCreateRoom(hostSocket);
  await delay();
  await checkIfRoomCreated();
  console.log("1. 호스트 방 생성 완료")

  await delay();

  console.log("2. 클라이언트 방 입장")
  await usersEmitEnterRoom(clientSockets);
  await delay();
  await checkIfEnterRoom();
  console.log("2. 클라이언트 방 입장 완료")

  await delay();

  console.log("3. SOLO 로 방 모드 변경")
  await hostEmitRoomChangeMode(hostSocket, RoomMode.SOLO);
  await delay();
  await checkIfChangedMode(RoomMode.SOLO, TOTAL_CLIENTS + 1);
  console.log("3. SOLO 로 방 모드 변경 완료")

  console.log("3. TEAM 으로 방 모드 변경")
  await hostEmitRoomChangeMode(hostSocket, RoomMode.TEAM);
  await delay();
  await checkIfChangedMode(RoomMode.TEAM, (TOTAL_CLIENTS + 1) * 2);
  console.log("3. TEAM 으로 방 모드 변경 완료")




  // 방 모드 변경 => TEAM 모드로 변경

  // 방 입장
})();
