module.exports = {
  apps: 
  [
    {
      name: "worker",
      script: "kill -9 $(lsof -t -i tcp:5000); node ./util/process.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        API_PORT: 7000
      },
      autorestart: true,
      restart_delay:2000,
      node_args: ["--max_old_space_size=4096"],
    },
    {
      name: "main",
      script: "node ./bin/www.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        API_PORT: 7000
      },
      autorestart: true,
      restart_delay:2000,
      node_args: ["--max_old_space_size=4096"],
    }
]}