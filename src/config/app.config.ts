import express, { Application } from "express";
import cors from "cors";
import os from "os";
import cluster from "cluster";
import { Worker } from "node:cluster";
import { logger } from "../util/logger";

export function installPrimaryCluster(): void {
  os.cpus().forEach(() => cluster.fork());
  cluster.on('exit', (worker: Worker): void => {
    logger.warn(`Worker ${worker.process.pid} died`);
  });
}

export function installApp(): Application {
  const app: Application = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  return app;
}
