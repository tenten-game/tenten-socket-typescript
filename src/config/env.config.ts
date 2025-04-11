import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : process.env.NODE_ENV === 'test' ? 'env.test' : '.env.development';
dotenv.config({ path: envFile });

// 앱 서버명 판단 => app.tenten.games => app${number}.tenten.games
const PROD_NUMBER: string = process.env.APP_NUMBER || '';
const ENV_SERVER_URL: string = process.env.NODE_ENV === 'image' ? 'image.tenten.games' : process.env.SERVER_URL || 'development.tenten.games'
const SERVER_URL: string = process.env.NODE_ENV === 'production'
  ? ENV_SERVER_URL.replace('app', `app${PROD_NUMBER}`)
  : ENV_SERVER_URL;

// 기본 export 설정
export const config = {
  env: process.env.NODE_ENV || 'development',
  httpsPort: process.env.HTTPS_PORT || '9443',
  httpPort: process.env.HTTP_PORT || '9442',
  serverUrl: SERVER_URL,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  logLevel: process.env.LOG_LEVEL || 'info',
}