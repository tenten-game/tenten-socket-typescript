module.exports = {
    apps: [
        {
            name: 'socket-test',
            script: 'dist/test/test.js',
            exec_mode: 'cluster', //
            instances: 5,
            watch: false,
            max_memory_restart: "200M",
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
