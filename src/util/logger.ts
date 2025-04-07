import winston from 'winston';
import { config } from '../config/env.config';

const loggerFormat: winston.Logform.Format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...extras } = info;
    return `${timestamp} [${level}]: ${message} ${Object.keys(extras).length ? JSON.stringify(extras, null, 2) : ''
      }`;
  }),
  winston.format.colorize({ all: true }),
);

export const logger: winston.Logger = winston.createLogger({
  level: config.logLevel || 'info',
  format: loggerFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      silent: config.env === 'test',
    }),
  ],
  exitOnError: false,
}
);
