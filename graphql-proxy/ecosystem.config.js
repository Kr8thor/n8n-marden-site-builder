module.exports = {
  apps: [{
    name: "wordpress-graphql-proxy",
    script: "graphql-proxy-server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "256M",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      GRAPHQL_ENDPOINT: "https://mardenseo.com/graphql",
      DEBUG_MODE: "false"
    },
    env_development: {
      NODE_ENV: "development",
      PORT: 3000,
      GRAPHQL_ENDPOINT: "https://mardenseo.com/graphql",
      DEBUG_MODE: "true"
    }
  }]
};
