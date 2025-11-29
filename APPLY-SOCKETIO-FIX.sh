#!/bin/bash

# Alternative: Apply Socket.IO fix using sed (if you prefer command-line)
# This is an alternative to manually editing - both achieve the same result

cd ~/diamond-bot-repo/admin-panel

# Backup original file
cp server.js server.js.backup

# Apply the fix using sed
sed -i '/^const io = socketIo(server);$/c\
const io = socketIo(server, {\n\
  reconnection: true,\n\
  reconnectionDelay: 1000,\n\
  reconnectionDelayMax: 5000,\n\
  reconnectionAttempts: 5,\n\
  transports: ["websocket", "polling"],\n\
  cors: {\n\
    origin: "*",\n\
    methods: ["GET", "POST"],\n\
    credentials: false\n\
  },\n\
  pingInterval: 25000,\n\
  pingTimeout: 5000\n\
});' server.js

echo "✅ Socket.IO configuration updated!"
echo "📋 Changes applied to: admin-panel/server.js"
echo "💾 Backup saved to: admin-panel/server.js.backup"
echo ""
echo "📝 Verify changes:"
echo "grep -A 10 'const io = socketIo' server.js"
