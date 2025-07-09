import cluster from 'cluster';
import { Application } from "express";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from 'socket.io';
import { installPrimaryCluster, installApp } from './config/app.config';
import { initializeFirebase } from './config/firebase.config';
import { installHttps } from './config/https.config';
import { installRedis } from './config/redis.config';
import { installSocketIo, initializeSocket } from './config/socket_io.config';
import { initializeHttp } from './presentation/api/api.controller';

if (cluster.isPrimary) { // 부모 프로세스
  installPrimaryCluster();
} else { // 자식 프로세스
  let app: Application = installApp();
  let httpServer: HttpServer = installHttps(app);
  let socketServer: SocketServer = installSocketIo(httpServer);

  installRedis();
  initializeHttp(app);
  initializeFirebase();
  initializeSocket(socketServer);
}

compileErrorPart