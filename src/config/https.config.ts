import { Application } from "express";
import fs from "fs";
import { Server as HttpServer } from "http";
import { AddressInfo } from "net";
import { logger } from "../util/logger";
import { config } from "./env.config";

let https: HttpServer;
let port: number = parseInt(config.httpsPort);

export function installHttps(app: Application): HttpServer {
  if (config.env === 'local') return handleHttpLocal(app);

  try {
    const options: {} = {
      ca: fs.readFileSync(`/etc/letsencrypt/live/${config.serverUrl}/chain.pem`),
      key: fs.readFileSync(`/etc/letsencrypt/live/${config.serverUrl}/privkey.pem`),
      cert: fs.readFileSync(`/etc/letsencrypt/live/${config.serverUrl}/cert.pem`),
    };
    https = require('https').createServer(options, app);
  } catch (err) {
    port = parseInt(config.httpPort);
    https = require('http').createServer(app);
  }

  https.listen(port, (): void => {
    const address: AddressInfo = https.address() as AddressInfo;
    console.log(`Server is running on port ${address.port}`);
  });

  return https;
}

function handleHttpLocal(app: Application): HttpServer {
  {
    const http: HttpServer = require('http').createServer(app);
    http.listen(port, (): void => {
      const address: AddressInfo = http.address() as AddressInfo;
      console.log(`[LOCAL]Server is running on port ${address.port}`);
    });
    return http;
  }
}