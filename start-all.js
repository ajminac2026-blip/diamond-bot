#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('\n🚀 Starting Diamond Bot - All Services...\n');

let adminProcess;
let botProcess;

// Start Admin Panel
console.log('📊 Starting Admin Panel...\n');
adminProcess = spawn('node', ['admin-panel/server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    detached: false
});

adminProcess.on('error', (error) => {
    console.error('❌ Failed to start admin panel:', error);
});

adminProcess.on('exit', (code) => {
    if (code !== 0) {
        console.error('\n⚠️ Admin panel exited with code', code);
        console.log('Attempting to restart admin panel...\n');
        setTimeout(() => {
            adminProcess = spawn('node', ['admin-panel/server.js'], {
                cwd: __dirname,
                stdio: 'inherit',
                detached: false
            });
        }, 2000);
    }
});

// Wait for admin panel to start before starting bot
setTimeout(() => {
    console.log('\n\n📱 Starting WhatsApp Bot...\n');
    console.log('⏳ Waiting for admin panel to be ready...\n');
    
    botProcess = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        detached: false
    });
    
    botProcess.on('error', (error) => {
        console.error('❌ Failed to start bot:', error);
    });
    
    botProcess.on('exit', (code) => {
        if (code !== 0) {
            console.error('\n⚠️ Bot process exited with code', code);
            console.log('Attempting to restart bot...\n');
            setTimeout(() => {
                botProcess = spawn('node', ['index.js'], {
                    cwd: __dirname,
                    stdio: 'inherit',
                    detached: false
                });
            }, 2000);
        }
    });
    
}, 3000); // 3 second delay

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down all services...');
    if (adminProcess && !adminProcess.killed) {
        adminProcess.kill('SIGTERM');
    }
    if (botProcess && !botProcess.killed) {
        botProcess.kill('SIGTERM');
    }
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Received SIGTERM - shutting down...');
    if (adminProcess && !adminProcess.killed) {
        adminProcess.kill('SIGTERM');
    }
    if (botProcess && !botProcess.killed) {
        botProcess.kill('SIGTERM');
    }
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

