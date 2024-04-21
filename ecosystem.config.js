module.exports = {
    apps: [{
      name: 'OpinionTrust-WebApp',
      script: 'yarn',
      args: 'web-start',
      interpreter: '/bin/bash',
      watch: true,
      // Delay between restart
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'logs', 'tmp'],
      // To enable zero-downtime deployments
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    }],
  };
  