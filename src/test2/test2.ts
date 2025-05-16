import { Socket } from 'socket.io-client';
import { createClients, listenAllEvents, usersEmitEnterRoom } from './methods2';

(async function runTest() {
  const clientSockets: Socket[] = await createClients();
  await usersEmitEnterRoom(clientSockets);
  await listenAllEvents(clientSockets);
})();
