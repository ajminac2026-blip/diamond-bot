const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Diamond Bot - All Services...\n');

let adminProcess = null;
let botProcess = null;

// Start admin panel FIRST
console.log('📊 Starting Admin Panel...');
adminProcess = spawn('node', ['admin-panel/server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

adminProcess.on('error', (err) => {
  console.error('❌ Admin Panel Error:', err);
  process.exit(1);
});

// Wait for admin panel to start before starting bot
setTimeout(() => {
  console.log('\n📱 Starting WhatsApp Bot...');
  console.log('⏳ Waiting for admin panel to be ready...\n');
  
  botProcess = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  botProcess.on('error', (err) => {
    console.error('❌ Bot Error:', err);
    process.exit(1);
  });

  botProcess.on('exit', (code) => {
    console.log(`❌ Bot process exited with code ${code}`);
  });
}, 5000);

adminProcess.on('exit', (code) => {
  console.log(`❌ Admin panel exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down all services...');
  if (botProcess) botProcess.kill();
  if (adminProcess) adminProcess.kill();
  setTimeout(() => process.exit(0), 1000);
});
