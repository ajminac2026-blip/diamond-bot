#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('\n🚀 Starting Diamond Bot - All Services...\n');

// Start Admin Panel
console.log('📊 Starting Admin Panel...\n');
const adminProcess = spawn('node', ['admin-panel/server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

adminProcess.on('error', (error) => {
    console.error('❌ Failed to start admin panel:', error);
    process.exit(1);
});

// Wait for admin panel to start before starting bot
setTimeout(() => {
    console.log('\n\n📱 Starting WhatsApp Bot...\n');
    console.log('⏳ Waiting for admin panel to be ready...\n');
    
    const botProcess = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
    
    botProcess.on('error', (error) => {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    });
    
    botProcess.on('exit', (code) => {
        console.error('\n❌ Bot process exited with code', code);
        process.exit(code);
    });
    
    // Handle parent process termination
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Shutting down all services...');
        adminProcess.kill();
        botProcess.kill();
        process.exit(0);
    });
}, 3000); // 3 second delay

adminProcess.on('exit', (code) => {
    console.error('\n❌ Admin panel exited with code', code);
    process.exit(code);
});
