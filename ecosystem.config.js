module.exports = {
  apps: [
    {
      name: "backend",
      script: "npm",
      args: "start",
      cwd: "./backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "256M", // Very low memory limit
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_file: "./logs/backend.log",
      time: true,
      max_restarts: 3, // Limited restarts to prevent crash loops
      min_uptime: "30s",
      kill_timeout: 3000,
      listen_timeout: 5000,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,
      node_args: "--max-old-space-size=128", // Very strict memory limit
    },
    {
      name: "frontend",
      script: "npm", 
      args: "start",
      cwd: "./frontend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "256M", // Very low memory limit
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      log_file: "./logs/frontend.log",
      time: true,
      max_restarts: 3, // Limited restarts to prevent crash loops
      min_uptime: "30s",
      kill_timeout: 3000,
      listen_timeout: 5000,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,
      node_args: "--max-old-space-size=128", // Very strict memory limit
    }
  ],
};
