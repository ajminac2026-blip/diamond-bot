const { spawn } = require('child_process');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   💎 Diamond Bot - Starting All Services...           ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
`);

// Start WhatsApp Bot
const botProcess = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

// Start Admin Panel
setTimeout(() => {
    const adminProcess = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, 'admin-panel'),
        stdio: 'inherit'
    });

    // Handle admin process exit
    adminProcess.on('exit', (code) => {
        console.log(`\n❌ Admin Panel exited with code ${code}`);
    });

    console.log('\n✅ Admin Panel: http://localhost:3000');
    console.log('✅ Replit URL: Check the Webview tab above or click the 🌐 icon\n');
}, 2000);

// Handle bot process exit
botProcess.on('exit', (code) => {
    console.log(`\n❌ WhatsApp Bot exited with code ${code}`);
    process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down all services...');
    botProcess.kill();
    process.exit(0);
});

console.log(`
📱 Main Bot: Starting...
🌐 Admin Panel: Will start in 2 seconds...

Press Ctrl+C to stop all services.
`);
