const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002; // Different port from admin panel

// Serve static files
app.use(express.static('public'));

// Main route - serve PWA app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n✅ মোবাইল অ্যাপ চালু হয়েছে!`);
    console.log(`📱 এখানে খুলুন: http://localhost:${PORT}`);
    console.log(`\n🔐 লগইন করুন:`);
    console.log(`   Email: rubelc45@gmail.com`);
    console.log(`   Password: Rubel890`);
});
