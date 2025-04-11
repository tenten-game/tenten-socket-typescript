clone me
git clone https://github.com/tenten-game/tenten-ts-server.git

install me
npm install -g typescript # 타입스크립트
npm install -g ts-node # ts-node
npm install

run me
ts-node src/app.ts


sudo env "PATH=$PATH" pm2
pm2 start ecosystem.config.js
pm2 start ecosystem.config.js --env image
pm2 start ecosystem.config.js --env image
APP_NUMBER=2 pm2 start ecosystem.config.js --env production
APP_NUMBER=4 pm2 start ecosystem.config.js --env production
APP_NUMBER=5 pm2 start ecosystem.config.js --env production