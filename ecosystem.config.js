// tsc로 컴파일 후 클러스터 모드 실행
module.exports = {
    apps: [
        {
            name: 'socket',
            script: 'dist/app.js',
            exec_mode: 'cluster',
            instances: 10,
            watch: false,
            max_memory_restart: '2G',
            env: {
                NODE_OPTIONS: "--max-old-space-size=4096",
                NODE_ENV: 'development',
            },
            env_local: {
                NODE_ENV: 'local',
            },
            env_test: {
                NODE_OPTIONS: "--max-old-space-size=4096",
                NODE_ENV: 'test',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        }
    ],
};


// sudo env "PATH=$PATH" pm2
// pm2 start ecosystem.config.js
// pm2 start ecosystem.config.js --env image
// pm2 start ecosystem.config.js --env image
// APP_NUMBER=2 pm2 start ecosystem.config.js --env production
// APP_NUMBER=4 pm2 start ecosystem.config.js --env production
// APP_NUMBER=5 pm2 start ecosystem.config.js --env production

// ts-node로 실행
// module.exports = {
//     apps: [
//         {
//             name: 'app',
//             script: 'src/app.ts',
//             interpreter: 'node_modules/.bin/ts-node',
//             watch: true,
//             env: {
//                 NODE_ENV: 'development',
//                 NODE_OPTIONS: '--trace-deprecation',
//             },
//         }
//     ],
// };