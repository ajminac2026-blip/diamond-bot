// Configuration
const ADMIN_API_URL = 'http://localhost:3000'; // Admin panel server

// Global state
let authToken = null;

// Elements
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loadingSpinner = document.getElementById('loadingSpinner');
const logoutBtn = document.getElementById('logoutBtn');

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('✅ Service Worker registered'))
            .catch(err => console.log('❌ Service Worker registration failed:', err));
    });
}

// PWA Install Prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
    }
});

// Check if already logged in
function checkAuth() {
    const sessionToken = sessionStorage.getItem('authToken');
    const persistToken = localStorage.getItem('authToken');
    
    authToken = sessionToken || persistToken;
    
    if (authToken) {
        verifyToken();
    } else {
        showLogin();
    }
}

// Verify token with server
async function verifyToken() {
    try {
        showLoading(true);
        const response = await fetch(`${ADMIN_API_URL}/api/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showApp();
            loadDashboard();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        showLogin();
    } finally {
        showLoading(false);
    }
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        showLoading(true);
        loginError.textContent = '';
        
        const response = await fetch(`${ADMIN_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            
            // Store token
            sessionStorage.setItem('authToken', authToken);
            if (rememberMe) {
                localStorage.setItem('authToken', authToken);
            }
            
            showApp();
            loadDashboard();
        } else {
            loginError.textContent = data.message || 'লগইন ব্যর্থ হয়েছে';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'সার্ভার সংযোগ ব্যর্থ হয়েছে';
    } finally {
        showLoading(false);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch(`${ADMIN_API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    authToken = null;
    showLogin();
});

// Show/Hide screens
function showLogin() {
    loginScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
}

function showApp() {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
}

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

// Tab Navigation
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}Tab`) {
                content.classList.add('active');
            }
        });
        
        // Load data for the tab
        switch(tabName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'groups':
                loadGroups();
                break;
            case 'payments':
                loadPayments();
                break;
        }
    });
});

// Authenticated fetch wrapper
async function authFetch(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        showLogin();
        throw new Error('Unauthorized');
    }
    
    return response;
}

// Load Dashboard
async function loadDashboard() {
    try {
        showLoading(true);
        
        const [statsRes, groupsRes] = await Promise.all([
            authFetch(`${ADMIN_API_URL}/api/stats`),
            authFetch(`${ADMIN_API_URL}/api/groups`)
        ]);
        
        const stats = await statsRes.json();
        const groups = await groupsRes.json();
        
        // Update stats
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalDiamonds').textContent = stats.totalDiamonds || 0;
        document.getElementById('totalPayments').textContent = stats.totalPayments || 0;
        document.getElementById('activeGroups').textContent = groups.length || 0;
        
        // Show recent activity
        showRecentActivity(stats, groups);
        
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    } finally {
        showLoading(false);
    }
}

// Show Recent Activity
function showRecentActivity(stats, groups) {
    const activityList = document.getElementById('recentActivity');
    
    const activities = [
        {
            icon: '👥',
            title: `${stats.totalUsers || 0} জন ইউজার`,
            desc: 'সিস্টেমে রেজিস্টার্ড',
            time: 'এখন'
        },
        {
            icon: '💎',
            title: `${stats.totalDiamonds || 0} ডায়মন্ড`,
            desc: 'মোট স্টক',
            time: 'আপডেট'
        },
        {
            icon: '📊',
            title: `${groups.length || 0} টি গ্রুপ`,
            desc: 'অ্যাক্টিভ গ্রুপ',
            time: 'এখন'
        }
    ];
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-info">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-desc">${activity.desc}</div>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// Load Groups
async function loadGroups() {
    try {
        showLoading(true);
        
        const response = await authFetch(`${ADMIN_API_URL}/api/groups`);
        const groups = await response.json();
        
        const groupsList = document.getElementById('groupsList');
        
        if (groups.length === 0) {
            groupsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 30px;">কোন গ্রুপ নেই</p>';
            return;
        }
        
        groupsList.innerHTML = groups.map(group => `
            <div class="group-card">
                <div class="group-header">
                    <div class="group-name">${group.name || 'Unknown Group'}</div>
                    <div class="group-badge">${group.userCount || 0} জন</div>
                </div>
                <div class="group-stats">
                    <div class="group-stat">
                        <div class="group-stat-value">${group.totalOrders || 0}</div>
                        <div class="group-stat-label">অর্ডার</div>
                    </div>
                    <div class="group-stat">
                        <div class="group-stat-value">${group.totalDiamonds || 0}</div>
                        <div class="group-stat-label">ডায়মন্ড</div>
                    </div>
                    <div class="group-stat">
                        <div class="group-stat-value">৳${group.totalPayments || 0}</div>
                        <div class="group-stat-label">পেমেন্ট</div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load groups:', error);
    } finally {
        showLoading(false);
    }
}

// Load Payments
async function loadPayments() {
    try {
        showLoading(true);
        
        const response = await authFetch(`${ADMIN_API_URL}/api/payments`);
        const payments = await response.json();
        
        const paymentsList = document.getElementById('paymentsList');
        
        if (payments.length === 0) {
            paymentsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 30px;">কোন পেমেন্ট নেই</p>';
            return;
        }
        
        paymentsList.innerHTML = payments.slice(0, 20).map(payment => `
            <div class="payment-card">
                <div class="payment-info">
                    <div class="payment-user">${payment.userName || 'Unknown User'}</div>
                    <div class="payment-date">${new Date(payment.date).toLocaleDateString('bn-BD')}</div>
                </div>
                <div class="payment-amount">৳${payment.amount || 0}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load payments:', error);
    } finally {
        showLoading(false);
    }
}

// Settings
document.getElementById('clearCacheBtn')?.addEventListener('click', async () => {
    if (confirm('ক্যাশ ক্লিয়ার করতে চান?')) {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            alert('ক্যাশ ক্লিয়ার হয়েছে!');
        }
    }
});

// Auto refresh
let autoRefreshInterval;
const autoRefreshToggle = document.getElementById('autoRefreshToggle');

autoRefreshToggle?.addEventListener('change', (e) => {
    if (e.target.checked) {
        autoRefreshInterval = setInterval(() => {
            const activeTab = document.querySelector('.nav-tab.active');
            if (activeTab) {
                const tabName = activeTab.dataset.tab;
                if (tabName === 'dashboard') loadDashboard();
                if (tabName === 'groups') loadGroups();
                if (tabName === 'payments') loadPayments();
            }
        }, 30000); // Refresh every 30 seconds
    } else {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
    }
});

// Notifications
const notificationToggle = document.getElementById('notificationToggle');

notificationToggle?.addEventListener('change', async (e) => {
    if (e.target.checked) {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                e.target.checked = false;
                alert('নোটিফিকেশন পারমিশন দিতে হবে');
            }
        }
    }
});

// Initialize app
checkAuth();
