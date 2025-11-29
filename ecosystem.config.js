module.exports = {
  apps: [
    {
      // Admin Panel
      name: 'admin-panel',
      script: 'admin-panel/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        ADMIN_PORT: 3000
      },
      error_file: './logs/admin-panel-error.log',
      out_file: './logs/admin-panel-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      listen_timeout: 10000,
      kill_timeout: 5000
    },
    {
      // WhatsApp Bot
      name: 'whatsapp-bot',
      script: 'index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        BOT_API_PORT: 3001
      },
      error_file: './logs/bot-error.log',
      out_file: './logs/bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      listen_timeout: 10000,
      kill_timeout: 5000,
      delay_between_restart: 3000
    }
  ]
};
