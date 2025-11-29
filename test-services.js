// Quick test script to check if services are working
const http = require('http');

console.log('🧪 Testing Diamond Bot Services...\n');

// Test 1: Check admin panel
const testAdminPanel = () => {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000/api/users', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Admin Panel: Working');
                    console.log('   Response:', data.substring(0, 50) + '...\n');
                } else {
                    console.log(`⚠️ Admin Panel: Status ${res.statusCode}\n`);
                }
                resolve();
            });
        }).on('error', (e) => {
            console.log('❌ Admin Panel: NOT RUNNING\n');
            resolve();
        });
        req.setTimeout(3000);
    });
};

// Test 2: Check bot API
const testBotAPI = () => {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3001/api/bot-status', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Bot API: Working');
                    console.log('   Response:', data.substring(0, 50) + '...\n');
                } else {
                    console.log(`⚠️ Bot API: Status ${res.statusCode}\n`);
                }
                resolve();
            });
        }).on('error', (e) => {
            console.log('❌ Bot API: NOT RUNNING\n');
            resolve();
        });
        req.setTimeout(3000);
    });
};

// Run tests
(async () => {
    console.log('Checking services on localhost:\n');
    await testAdminPanel();
    await testBotAPI();
    console.log('✅ Test completed!\n');
    process.exit(0);
})();
