module.exports = {
  apps: [
    {
      name: "prompt-assistant-frontend",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/deploy/apps/prompt_assistant/frontend",
      instances: 1, // Single instance to prevent overload
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "256M", // Conservative memory limit
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: 1,
      },
      error_file: "/home/deploy/logs/frontend-error.log",
      out_file: "/home/deploy/logs/frontend-out.log",
      log_file: "/home/deploy/logs/frontend.log",
      time: true,

      // Resource limits
      max_restarts: 10,
      min_uptime: "10s",

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 8000,

      // Log settings
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,

      // Memory optimization for Next.js
      node_args: "--max-old-space-size=192",

      // Next.js specific settings
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: 1,
      },
    },
  ],
};
