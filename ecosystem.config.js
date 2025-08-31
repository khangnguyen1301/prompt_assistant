module.exports = {
  apps: [
    {
      name: "prompt-assistant-backend",
      script: "dist/main.js",
      cwd: "/home/deploy/apps/prompt_assistant/backend",
      instances: 1, // Changed from 'max' to prevent overload
      exec_mode: "fork", // Changed from 'cluster' for stability
      autorestart: true,
      watch: false,
      max_memory_restart: "512M", // Reduced from 1G
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/home/deploy/logs/backend-error.log",
      out_file: "/home/deploy/logs/backend-out.log",
      log_file: "/home/deploy/logs/backend.log",
      time: true,

      // Resource limits to prevent server overload
      max_restarts: 10,
      min_uptime: "10s",

      // Health check
      health_check_url: "https://prompt-assistant.dukang.online/api/health",
      health_check_grace_period: 3000,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 8000,

      // Log rotation
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,

      // Environment specific settings
      node_args: "--max-old-space-size=256", // Limit memory usage
    },
  ],
};
