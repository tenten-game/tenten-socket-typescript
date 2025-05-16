module.exports = {
    apps: [
        {
            name: 'socket-test',
            script: 'dist/test2/test2.js',
            exec_mode: 'cluster', //
            instances: 5,
            watch: false,
            max_memory_restart: "500M",
            env: {
                NODE_ENV: 'development',
            },
            env_local: {
                NODE_ENV: 'local',
            },
            env_image: {
                NODE_ENV: 'image',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        }
    ],
};
