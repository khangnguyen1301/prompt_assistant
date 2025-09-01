module.exports = {
  apps: [
    {
      name: "prompt-assistant-backend",
      script: "dist/main.js",
      cwd: "/home/deploy/apps/prompt_assistant/backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G", // Increased for EC2
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/home/deploy/logs/backend-error.log",
      out_file: "/home/deploy/logs/backend-out.log",
      log_file: "/home/deploy/logs/backend.log",
      time: true,
      max_restarts: 10,
      min_uptime: "10s",
      health_check_url: "https://prompt-assistant.dukang.online/api/health",
      health_check_grace_period: 3000,
      kill_timeout: 5000,
      listen_timeout: 8000,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,
      node_args: "--max-old-space-size=512", // Increased for EC2
    },
    {
      name: "prompt-assistant-frontend",
      script: "npm",
      args: "start",
      cwd: "/home/deploy/apps/prompt_assistant/frontend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G", // Increased for EC2
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/home/deploy/logs/frontend-error.log",
      out_file: "/home/deploy/logs/frontend-out.log",
      log_file: "/home/deploy/logs/frontend.log",
      time: true,
      max_restarts: 10,
      min_uptime: "10s",
      kill_timeout: 5000,
      listen_timeout: 8000,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,
      node_args: "--max-old-space-size=512", // Increased for EC2
    },
  ],
};
