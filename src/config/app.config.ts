import cluster from "cluster";
import cors from "cors";
import express, { Application } from "express";
import { Worker } from "node:cluster";
import os from "os";
import { logger } from "../util/logger";

export function installPrimaryCluster(): void {
  const workerCount = calculateOptimalWorkerCount();
  
  logger.info(`Starting ${workerCount} workers (CPU: ${os.cpus().length}, Memory: ${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(1)}GB)`);
  
  // 최적화된 워커 수만큼 생성
  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }
  
  // 워커가 죽으면 자동 재시작
  cluster.on('exit', (worker: Worker, code: number, signal: string): void => {
    logger.warn(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    cluster.fork();
  });
  
  // 워커 상태 모니터링
  cluster.on('online', (worker: Worker): void => {
    logger.info(`Worker ${worker.process.pid} is online`);
  });
}

function calculateOptimalWorkerCount(): number {
  if (process.env.WORKER_COUNT) {
    const customCount = parseInt(process.env.WORKER_COUNT);
    if (customCount > 0) {
      return customCount;
    }
  }
  
  const cpuCount = os.cpus().length;
  const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
  
  // 워커당 최소 필요 메모리 (512MB)
  // Socket.IO 서버는 메모리 사용량이 높을 수 있음
  const memoryPerWorkerGB = 0.5;
  const maxWorkersByMemory = Math.floor(totalMemoryGB / memoryPerWorkerGB);
  
  // CPU와 메모리 제약 중 더 작은 값 선택, 최소 1개
  const optimalCount = Math.max(1, Math.min(cpuCount, maxWorkersByMemory));
  
  // 개발환경에서는 워커 수 제한
  if (process.env.NODE_ENV === 'development') {
    return Math.min(optimalCount, 2);
  }
  
  return optimalCount;
}

export function installApp(): Application {
  const app: Application = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  return app;
}
