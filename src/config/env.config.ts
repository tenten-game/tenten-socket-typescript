import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const PROD_NUMBER: string = process.env.APP_NUMBER || '';
const ENV_SERVER_URL: string = process.env.NODE_ENV === 'image' ? 'image.tenten.games' : process.env.SERVER_URL || 'development.tenten.games'
// const SERVER_URL: string = process.env.NODE_ENV === 'production' ? ENV_SERVER_URL.replace('app', `app${PROD_NUMBER}`) : ENV_SERVER_URL;
const SERVER_URL: string = ENV_SERVER_URL;

// 기본 export 설정
export const config = {
  env: process.env.NODE_ENV || 'development',
  httpsPort: process.env.HTTPS_PORT || '9443',
  httpPort: process.env.HTTP_PORT || '9442',
  serverUrl: SERVER_URL,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  logLevel: process.env.LOG_LEVEL || 'info',
  // Socket.IO Admin UI
  socketAdminUsername: process.env.SOCKET_ADMIN_USERNAME || 'admin',
  socketAdminPasswordHash: process.env.SOCKET_ADMIN_PASSWORD_HASH || '',
  // Webhook URLs
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  googleChatWebhookUrl: process.env.GOOGLE_CHAT_WEBHOOK_URL || '',
  googleChatApiKey: process.env.GOOGLE_CHAT_API_KEY || '',
  googleChatToken: process.env.GOOGLE_CHAT_TOKEN || '',
}