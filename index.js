require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const io = require('socket.io-client');
const db = require('./config/database');
const { showWhatsAppDashboard } = require('./handlers/dashboard');
const { processPaymentReceipt } = require('./utils/payment-processor');
const { handleDiamondRequest, handleMultiLineDiamondRequest, approvePendingDiamond, findPendingDiamondByUser, showPendingRequests, cancelDiamondRequest, pendingDiamondRequests } = require('./handlers/diamond-request');
const { handleDepositRequest, handleDepositApproval, handleBalanceQuery, showPendingDeposits, showDepositStats } = require('./handlers/deposit');

// Connect to Admin Panel Socket.IO server
const adminSocket = io('http://localhost:3000');

adminSocket.on('connect', () => {
    console.log('✅ Connected to Admin Panel');
});

adminSocket.on('disconnect', () => {
    console.log('❌ Disconnected from Admin Panel');
});

// Initialize database files
db.initializeDB();
db.initializePayments();
db.initializeUsers();

// Clean up invalid payment transactions on startup
db.initializeCleanup();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-resources',
            '--disable-extensions',
            '--disable-component-extensions-with-background-pages',
            '--disable-default-apps',
            '--disable-preconnect',
            '--disable-component-update',
            '--disable-sync',
            '--disable-default-extensions',
            '--disable-translate',
            '--disable-background-networking',
            '--disable-client-side-phishing-detection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-hang-monitor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-device-discovery-notifications',
            '--disable-extensions',
            '--disable-features=TranslateUI',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--no-default-browser-check',
            '--no-first-run',
            '--disable-background-networking'
        ]
    }
});

let botIsReady = false; // Flag to track bot ready state
let currentQRCode = null; // Store current QR code

// QR code generation
client.on('qr', (qr) => {
    console.log('\n\n📱 SCAN THIS QR CODE WITH WHATSAPP:\n');
    qrcode.generate(qr, { small: true });
    currentQRCode = qr; // Store QR code
    console.log('\n\n');
});

// Client ready
client.on('ready', () => {
    botIsReady = true; // Set flag when ready
    currentQRCode = null; // Clear QR code when connected
    console.log('✅ WhatsApp Bot Ready!');
    console.log('🤖 Bot is now listening for messages...\n');
    
    // Start periodic check for deleted messages (every 15 seconds)
    startDeletedMessageChecker(client);
    
    // Listen for admin panel messages
    adminSocket.on('sendGroupMessage', async (data) => {
        const { groupId, message } = data;
        try {
            await client.sendMessage(groupId, message);
            console.log(`✅ Sent rate update message to group ${groupId}`);
        } catch (error) {
            console.error(`❌ Failed to send message to group ${groupId}:`, error);
        }
    });
});

// Disconnection handler
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Bot Disconnected:', reason);
    botIsReady = false;
});

// Main message handler
client.on('message', async (msg) => {
    try {
        console.log(`[HANDLER] Message received!`);
        // In groups: msg.author is the sender, msg.from is the group
        // In DMs: msg.author is undefined, msg.from is the sender
        let fromUserId = msg.author || msg.from;
        
        // Check if group message by looking at msg.from format
        // Group messages have format like "120363...-120363...@g.us"
        // Direct messages have format like "1234567890@c.us"
        const isGroup = msg.from && msg.from.includes('@g.us');
        let groupId = null;
        
        // For groups, if msg.author is still undefined, try to get it from contact/notifyName
        if (isGroup && !msg.author) {
            try {
                const contact = await msg.getContact();
                fromUserId = contact?.id?._serialized || contact?.id || msg.from;
            } catch (err) {
                console.log(`[ADMIN_CHECK] Could not get contact for group message`);
            }
        }
        
        const isAdminUser = db.isAdmin(fromUserId);
        
        // LOG ALL MESSAGES
        console.log(`[MESSAGE] From: ${fromUserId} | msg.author: ${msg.author} | msg.from: ${msg.from} | Group: ${isGroup} | IsAdmin: ${isAdminUser} | Body: "${msg.body}"`);
        
        // If not recognized as admin but has approval keywords, check if their phone might be in the admin list
        if (!isAdminUser && isGroup && ['done', 'ok', 'do', 'dn', 'yes', 'অক', 'okey', 'ওকে'].includes(msg.body.toLowerCase().trim())) {
            // This might be a new admin we haven't registered the WhatsApp ID for
            // Check all admins with placeholder WhatsApp IDs (phone@lid format)
            const allAdmins = db.getAdmins ? db.getAdmins() : [];
            const potentialMatch = allAdmins.find(a => {
                if (!a.whatsappId || !a.phone) return false;
                const storedIdNumeric = a.whatsappId.split('@')[0];
                // If stored ID matches phone, it's a placeholder
                return storedIdNumeric === a.phone;
            });
            
            if (potentialMatch && fromUserId) {
                // Found a placeholder admin - might be this person
                // Try to update their WhatsApp ID in the admin panel
                try {
                    console.log(`[ADMIN_DISCOVERY] Potential admin found: ${potentialMatch.phone} -> ${fromUserId}`);
                    const response = await fetch('http://localhost:3000/api/whatsapp-admins/update-id', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            phone: potentialMatch.phone,
                            whatsappId: fromUserId
                        })
                    });
                    if (response.ok) {
                        console.log(`[ADMIN_DISCOVERY] Successfully updated admin ID`);
                        // Reload admins to recognize this user
                        db.loadAdmins();
                    }
                } catch (err) {
                    console.log(`[ADMIN_DISCOVERY] Failed to update admin ID:`, err.message);
                }
            }
        }
        
        if (isGroup) {
            groupId = msg.from;
            console.log(`[MESSAGE] GroupId: ${groupId}`);
        }
        
        // Check for payment screenshot (image with amount or payment keywords)
        if (msg.hasMedia && !isGroup) {
            const media = await msg.downloadMedia();
            if (media && media.mimetype && media.mimetype.startsWith('image/')) {
                console.log(`[PAYMENT SCREENSHOT] Image received from ${fromUserId}`);
                
                // Get user name
                let userName = fromUserId;
                try {
                    const contact = await client.getContactById(fromUserId);
                    userName = contact.pushname || contact.name || fromUserId;
                } catch (err) {
                    console.log('[PAYMENT SCREENSHOT] Could not fetch name');
                }
                
                // Check if there's a caption or if user has pending deposit
                const hasPaymentCaption = msg.body && (
                    msg.body.toLowerCase().includes('payment') ||
                    msg.body.toLowerCase().includes('paid') ||
                    msg.body.toLowerCase().includes('পেমেন্ট') ||
                    msg.body.toLowerCase().includes('দিয়েছি') ||
                    /\d+/.test(msg.body) // contains number
                );
                
                if (hasPaymentCaption || true) { // Always notify for images in DM
                    // Play sound and show notification in admin panel
                    try {
                        const io = require('./admin/server').io;
                        if (io) {
                            io.emit('payment-screenshot', {
                                userId: fromUserId,
                                userName: userName,
                                caption: msg.body || '',
                                timestamp: new Date().toISOString()
                            });
                            console.log(`[PAYMENT SCREENSHOT] Notification sent to admin panel`);
                        }
                    } catch (notifyErr) {
                        console.error('[PAYMENT SCREENSHOT] Failed to notify admin:', notifyErr.message);
                    }
                    
                    await msg.reply('✅ Payment screenshot received!\n\n⏳ Admin will verify your payment soon.\n\nThank you for your patience! 😊');
                }
            }
        }
        
        // Payment Number Command - Multiple shortcuts (English + Bangla)
        const paymentKeywords = [
            'payment', 'pay', 'number', 'num', 'নাম্বার', 'নম্বর',
            'acc', 'account'
        ];
        const messageBody = msg.body.trim().toLowerCase();
        
        // Check for specific payment method requests
        const isBkashRequest = messageBody.includes('bkash') || messageBody.includes('bk') || messageBody.includes('বিকাশ');
        const isNagadRequest = messageBody.includes('nagad') || messageBody.includes('ng') || messageBody.includes('নগদ');
        const isRocketRequest = messageBody.includes('rocket') || messageBody.includes('রকেট') || messageBody.includes('রক');
        const isBankRequest = messageBody.includes('bank') || messageBody.includes('bnk') || messageBody.includes('ব্যাংক') || messageBody.includes('ব্যাঙ্ক') || messageBody.includes('ac') || messageBody.includes('একাউন্ট');
        
        // Check if it's a general payment number request or specific method
        if (paymentKeywords.some(keyword => messageBody.includes(keyword)) || isBkashRequest || isNagadRequest || isRocketRequest || isBankRequest) {
            try {
                const paymentConfig = require('./config/payment-number.json');
                
                let numbersText = '';
                let responseMessage = '';
                
                // If specific method requested, show only that method
                if (isBkashRequest) {
                    const bkash = paymentConfig.paymentNumbers.find(m => m.method.toLowerCase() === 'bkash');
                    if (bkash) {
                        numbersText = `📱 *${bkash.method}* (${bkash.type})\n   📞 ${bkash.number}`;
                        responseMessage = `💰 *Bkash Payment Number*\n\n${numbersText}\n\n✅ পেমেন্ট করার পর স্ক্রিনশট পাঠান।`;
                    }
                } else if (isNagadRequest) {
                    const nagad = paymentConfig.paymentNumbers.find(m => m.method.toLowerCase() === 'nagad');
                    if (nagad) {
                        numbersText = `📱 *${nagad.method}* (${nagad.type})\n   📞 ${nagad.number}`;
                        responseMessage = `💰 *Nagad Payment Number*\n\n${numbersText}\n\n✅ পেমেন্ট করার পর স্ক্রিনশট পাঠান।`;
                    }
                } else if (isRocketRequest) {
                    const rocket = paymentConfig.paymentNumbers.find(m => m.method.toLowerCase() === 'rocket');
                    if (rocket) {
                        numbersText = `📱 *${rocket.method}* (${rocket.type})\n   📞 ${rocket.number}`;
                        responseMessage = `💰 *Rocket Payment Number*\n\n${numbersText}\n\n✅ পেমেন্ট করার পর স্ক্রিনশট পাঠান।`;
                    }
                } else if (isBankRequest) {
                    const bank = paymentConfig.paymentNumbers.find(m => m.method.toLowerCase().includes('bank') || m.isBank);
                    if (bank) {
                        if (bank.isBank) {
                            numbersText = `🏦 *${bank.method}*\n`;
                            numbersText += `👤 *Account Name:* ${bank.accountName || 'N/A'}\n`;
                            numbersText += `🏢 *Branch:* ${bank.branch || 'N/A'}\n`;
                            numbersText += `🔢 *Account Number:* ${bank.accountNumber || bank.number}\n`;
                            numbersText += `📋 *Type:* ${bank.type}`;
                            responseMessage = `💰 *Bank Payment Information*\n\n${numbersText}\n\n✅ পেমেন্ট করার পর স্ক্রিনশট পাঠান।`;
                        } else {
                            numbersText = `🏦 *${bank.method}* (${bank.type})\n   📞 ${bank.number}`;
                            responseMessage = `💰 *Bank Payment Number*\n\n${numbersText}\n\n✅ পেমেন্ট করার পর স্ক্রিনশট পাঠান।`;
                        }
                    }
                } else {
                    // Show all payment methods
                    paymentConfig.paymentNumbers.forEach((method, index) => {
                        if (method.isBank) {
                            numbersText += `${index + 1}. 🏦 *${method.method}*\n`;
                            numbersText += `   👤 ${method.accountName || 'N/A'}\n`;
                            numbersText += `   🏢 ${method.branch || 'N/A'}\n`;
                            numbersText += `   🔢 ${method.accountNumber || method.number}\n`;
                            numbersText += `   📋 ${method.type}\n\n`;
                        } else {
                            numbersText += `${index + 1}. *${method.method}* (${method.type})\n   📞 ${method.number}\n\n`;
                        }
                    });
                    responseMessage = paymentConfig.message.replace('{numbers}', numbersText);
                }
                
                if (responseMessage) {
                    await msg.reply(responseMessage);
                    console.log(`[PAYMENT-INFO] Sent payment numbers to ${fromUserId} (keyword: ${messageBody})`);
                } else {
                    await msg.reply('❌ Payment method not available. Please contact admin.');
                }
            } catch (error) {
                console.error('[PAYMENT-INFO ERROR]', error);
                await msg.reply('❌ Payment information not available. Please contact admin.');
            }
            return;
        }
        
        // Dashboard command: /d
        if (msg.body.trim() === '/d') {
            try {
                let userName = fromUserId;
                try {
                    const contact = await client.getContactById(fromUserId);
                    userName = contact.pushname || contact.name || fromUserId;
                } catch (contactErr) {
                    console.log('[DASHBOARD] Could not fetch contact, using fallback name');
                    userName = msg.from?.contact?.pushname || fromUserId;
                }
                await showWhatsAppDashboard(msg, fromUserId, userName, groupId);
                console.log(`[DASHBOARD] ${userName} requested dashboard`);
            } catch (error) {
                console.error('[DASHBOARD ERROR]', error);
                await msg.reply('❌ Error loading dashboard. Please try again.');
            }
            return;
        }
        
        // Cancel order command: /cancel
        if (msg.body.trim().toLowerCase() === '/cancel') {
            if (!isGroup) {
                await msg.reply('❌ Cancel command only works in groups.');
                return;
            }
            
            let userName = fromUserId;
            try {
                const contact = await client.getContactById(fromUserId);
                userName = contact.pushname || contact.name || fromUserId;
            } catch (contactErr) {
                console.log('[CANCEL] Could not fetch contact, using fallback name');
                userName = msg.from?.contact?.pushname || fromUserId;
            }
            
            const cancelResult = await cancelDiamondRequest(msg, fromUserId, userName, groupId);
            console.log(`[CANCEL] Result:`, cancelResult);
            
            // Notify admin panel about cancellation
            if (cancelResult.success) {
                try {
                    await fetch('http://localhost:3000/api/order-event', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            eventType: 'order-cancelled',
                            data: {
                                userId: cancelResult.userId,
                                userName: cancelResult.userName,
                                groupId: cancelResult.groupId,
                                orderId: cancelResult.orderId,
                                diamonds: cancelResult.diamonds,
                                amount: cancelResult.amount,
                                reason: cancelResult.reason
                            }
                        })
                    });
                } catch (notifyErr) {
                    console.error('[CANCEL] Failed to notify admin panel:', notifyErr.message);
                }
            }
            return;
        }
        
        // Check for multi-line diamond request (ID + Diamonds)
        if (isGroup && msg.body.includes('\n')) {
            console.log(`\n[MULTI-LINE] 🟢 DETECTED MULTI-LINE MESSAGE`);
            console.log(`[MULTI-LINE] From: ${fromUserId}`);
            console.log(`[MULTI-LINE] Group: ${groupId}`);
            console.log(`[MULTI-LINE] Body length: ${msg.body.length} chars`);
            
            const lines = msg.body.trim().split('\n');
            console.log(`[MULTI-LINE] Lines count: ${lines.length}`);
            lines.forEach((line, i) => console.log(`[MULTI-LINE]   Line ${i+1}: "${line}"`));
            
            if (lines.length >= 2) {
                let userName = fromUserId;
                try {
                    const contact = await client.getContactById(fromUserId);
                    userName = contact.pushname || contact.name || fromUserId;
                } catch (contactErr) {
                    console.log('[MULTI-LINE] Could not fetch contact, using fallback name');
                    userName = msg.from?.contact?.pushname || fromUserId;
                }
                console.log(`[MULTI-LINE] Processing for user: ${userName}`);
                console.log(`[MULTI-LINE] Calling handleMultiLineDiamondRequest...\n`);
                
                // Fetch group name
                const groupName = await getGroupName(client, groupId);
                await handleMultiLineDiamondRequest(msg, fromUserId, userName, groupId, msg.body, groupName);
                return;
            }
        }
        
        // Diamond order submission: just a number (e.g., 100)
        const diamondMatch = msg.body.trim().match(/^(\d+)$/);
        if (diamondMatch) {
            const amount = parseInt(diamondMatch[1]);
            let userName = fromUserId;
            try {
                const contact = await client.getContactById(fromUserId);
                userName = contact.pushname || contact.name || fromUserId;
                console.log(`[DIAMOND] Got contact name: ${userName} from ${fromUserId}`);
            } catch (contactErr) {
                console.log('[DIAMOND] Could not fetch contact, trying message properties');
                // Try to get name from message
                if (msg.from?.contact?.pushname) {
                    userName = msg.from.contact.pushname;
                } else if (msg._data?.notifyName) {
                    userName = msg._data.notifyName;
                } else if (msg._data?.senderName) {
                    userName = msg._data.senderName;
                } else {
                    userName = fromUserId;
                }
                console.log(`[DIAMOND] Using fallback name: ${userName}`);
            }
            
            // Check if it's a group (diamond order) or direct message (deposit)
            if (isGroup) {
                // In group: treat as diamond order
                const groupName = await getGroupName(client, groupId);
                await handleDiamondRequest(msg, fromUserId, userName, groupId, amount, groupName);
            } else {
                // Direct message: treat as deposit request
                await handleDepositRequest(msg, fromUserId, userName, amount);
            }
            return;
        }

        
        // Admin approval: done, ok, do, dn, yes, অক, okey, ওকে (for diamond orders)
        const approvalKeywords = ['done', 'ok', 'do', 'dn', 'yes', 'অক', 'okey', 'ওকে'];
        if (approvalKeywords.includes(msg.body.toLowerCase().trim()) && isGroup) {
            if (!isAdminUser) {
                await msg.reply('❌ Only admins can approve orders.');
                return;
            }
            if (!msg.hasQuotedMsg) {
                await msg.reply('❌ Please reply to a user order to approve it.');
                return;
            }
            
            const quotedMsg = await msg.getQuotedMessage();
            const quotedUserId = quotedMsg.author || quotedMsg.from;
            
            console.log(`[APPROVAL DEBUG] Quoted user ID: ${quotedUserId}, Group: ${groupId}`);
            console.log(`[APPROVAL DEBUG] Pending requests:`, Object.keys(pendingDiamondRequests).length);
            
            // First check if it's a pending multi-line diamond request
            const pendingDiamond = findPendingDiamondByUser(quotedUserId, groupId);
            
            if (pendingDiamond) {
                // It's a multi-line request - approve it
                const { requestId, request } = pendingDiamond;
                console.log(`[APPROVAL DEBUG] Found pending diamond for ${quotedUserId}`);
                const approvalResult = await approvePendingDiamond(requestId, groupId);
                
                if (approvalResult) {
                    // Check if approve message is enabled
                    const diamondStatus = require('./config/database').getDiamondStatus?.() || JSON.parse(require('fs').readFileSync(require('path').join(__dirname, './config/diamond-status.json'), 'utf8'));
                    const approveMessageEnabled = diamondStatus.approveMessageEnabled !== false;
                    
                    if (approveMessageEnabled) {
                        await msg.reply(approvalResult.message);
                    }
                    console.log(`[APPROVED] Multi-line diamond order: ${approvalResult.diamonds}💎 from ${approvalResult.userIdFromMsg} (Message ${approveMessageEnabled ? 'sent' : 'silenced'})`);
                }
                return;
            } else {
                console.log(`[APPROVAL DEBUG] No pending diamond found for ${quotedUserId}`);
            }
            
            // Find and approve entry from database
            const groupData = db.getGroupData(groupId);
            
            // Check if groupData and entries exist
            if (!groupData || !groupData.entries || groupData.entries.length === 0) {
                console.log(`[APPROVAL] No entries found in group data for ${groupId}`);
                return;
            }
            
            const pendingEntry = groupData.entries.find(e => e.userId === quotedUserId && e.status === 'pending');
            
            if (pendingEntry) {
                db.approveEntry(groupId, pendingEntry.id);
                
                // Get name from quoted message
                let userName = quotedUserId;
                try {
                    if (msg.hasQuotedMsg) {
                        const quotedMsg = await msg.getQuotedMessage();
                        if (quotedMsg._data && quotedMsg._data.notifyName) {
                            userName = quotedMsg._data.notifyName;
                            console.log('[APPROVAL] Got name from notifyName:', userName);
                        } else {
                            // Try from group participants
                            const chat = await msg.getChat();
                            if (chat.isGroup) {
                                const participant = chat.participants.find(p => p.id._serialized === quotedUserId);
                                if (participant && participant.contact && participant.contact.pushname) {
                                    userName = participant.contact.pushname;
                                    console.log('[APPROVAL] Got name from participant:', userName);
                                }
                            }
                        }
                    }
                } catch (contactErr) {
                    console.log('[APPROVAL] Could not fetch name');
                }
                console.log('[APPROVAL] Final userName:', userName);
                
                const totalValue = pendingEntry.diamonds * pendingEntry.rate;
                
                const approvalMsg = `✅ *Diamond Order Approved*\n\n` +
                    `👤 User: ${userName}\n` +
                    `💎 Diamonds: ${pendingEntry.diamonds}💎\n` +
                    `💰 Amount Due: ৳${totalValue.toFixed(2)}\n` +
                    `📊 Rate: ৳${pendingEntry.rate.toFixed(2)}/💎\n\n` +
                    `✓ Status: Approved\n` +
                    `Order ID: ${pendingEntry.id}`;

                // Check if approve message is enabled
                const diamondStatus = require('./config/database').getDiamondStatus?.() || JSON.parse(require('fs').readFileSync(require('path').join(__dirname, './config/diamond-status.json'), 'utf8'));
                const approveMessageEnabled = diamondStatus.approveMessageEnabled !== false;
                
                if (approveMessageEnabled) {
                    await msg.reply(approvalMsg);
                }
                console.log(`[APPROVED] Order ID ${pendingEntry.id}: ${pendingEntry.diamonds}💎 from ${userName} (Message ${approveMessageEnabled ? 'sent' : 'silenced'})`);
            } else {
                await msg.reply('❌ No pending diamond order found for this user.');
            }
            
            return;
        }
        
        // Admin payment receipt: amount//rcv (e.g., 100//rcv)
        const paymentMatch = msg.body.trim().match(/^(\d+(?:\.\d{1,2})?)\/\/rcv$/i);
        if (paymentMatch && isGroup) {
            if (!isAdminUser) {
                await msg.reply('❌ Only admins can process payments/deposits.');
                return;
            }
            if (!msg.hasQuotedMsg) {
                await msg.reply('❌ Please reply to a user message to process payment/deposit.');
                return;
            }
            
            const quotedMsg = await msg.getQuotedMessage();
            const quotedUserId = quotedMsg.author || quotedMsg.from;
            const amount = parseFloat(paymentMatch[1]);
            
            // Get name from quoted message - try notifyName first
            let userName = quotedUserId;
            
            if (quotedMsg._data && quotedMsg._data.notifyName) {
                userName = quotedMsg._data.notifyName;
                console.log('[PAYMENT] Got name from notifyName:', userName);
            } else {
                // Try from group participants
                try {
                    const chat = await msg.getChat();
                    if (chat.isGroup) {
                        const participant = chat.participants.find(p => p.id._serialized === quotedUserId);
                        if (participant && participant.contact && participant.contact.pushname) {
                            userName = participant.contact.pushname;
                            console.log('[PAYMENT] Got name from participant:', userName);
                        }
                    }
                } catch (e) {
                    console.log('[PAYMENT] Could not get participant name');
                }
            }
            
            console.log('[PAYMENT] Final userName:', userName);
            
            // First check if it's a deposit approval
            const depositResult = await handleDepositApproval(msg, amount, quotedUserId, userName, isAdminUser);
            
            if (depositResult.success) {
                // Deposit approved
                await msg.reply(depositResult.adminMessage);
                
                // Send user notification
                try {
                    const userChat = await client.getChatById(quotedUserId);
                    await userChat.sendMessage(depositResult.userMessage);
                } catch (err) {
                    console.log('Could not send direct message to user:', err);
                    await msg.reply(`📲 User notification: ${depositResult.userMessage}`);
                }
            } else {
                // Not a deposit, try as payment for order dues
                const paymentResult = await processPaymentReceipt(quotedUserId, userName, groupId, amount);
                
                if (paymentResult.success) {
                    // Send admin confirmation
                    await msg.reply(paymentResult.adminMessage);
                    
                    // Notify admin panel about manual payment
                    try {
                        await fetch('http://localhost:3000/api/payment-event', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'payment-added',
                                userId: quotedUserId,
                                userName: userName,
                                groupId: groupId,
                                amount: amount,
                                message: `💰 Manual payment: ৳${amount.toFixed(2)} from ${userName}`
                            })
                        });
                    } catch (e) {
                        console.log('[PAYMENT] Could not notify admin panel');
                    }
                    
                    // Send user notification
                    try {
                        const userChat = await client.getChatById(quotedUserId);
                        await userChat.sendMessage(paymentResult.userMessage);
                    } catch (err) {
                        console.log('Could not send direct message to user:', err);
                        await msg.reply(`📲 User notification failed. Message them: ${paymentResult.userMessage}`);
                    }
                } else {
                    await msg.reply(paymentResult.adminMessage);
                }
            }
            
            return;
        }
        
        // Show pending deposits command
        if (msg.body.trim() === '/pendingdeposits') {
            if (!isAdminUser) {
                await msg.reply('❌ Only admins can view pending deposits.');
                return;
            }
            await showPendingDeposits(msg);
            return;
        }
        
        // Show pending requests command
        if (msg.body.trim() === '/pending') {
            if (isGroup) {
                await showPendingRequests(msg, groupId);
            } else {
                await msg.reply('❌ This command works only in groups.');
            }
            return;
        }
        
        // Balance check command: /balance
        if (msg.body.trim() === '/balance') {
            let userName = fromUserId;
            try {
                const contact = await client.getContactById(fromUserId);
                userName = contact.pushname || contact.name || fromUserId;
            } catch (contactErr) {
                console.log('[BALANCE] Could not fetch contact, using fallback name');
                userName = msg.from?.contact?.pushname || fromUserId;
            }
            
            await handleBalanceQuery(msg, fromUserId, userName);
            return;
        }
        
        // Deposit stats command: /depstats
        if (msg.body.trim() === '/depstats') {
            if (!isAdminUser) {
                await msg.reply('❌ Only admins can view deposit statistics.');
                return;
            }
            await showDepositStats(msg);
            return;
        }
        
        // Help command
        if (msg.body.trim() === '/help') {
            const helpText = `*🤖 DIAMOND BOT COMMANDS*\n\n` +
                `/d - Show your dashboard\n` +
                `/balance - Check your balance\n` +
                `/balance - Check your balance\n` +
                `/pending - Show pending diamond requests\n` +
                `/help - Show this help message\n\n` +
                `*USER ACTIONS:*\n` +
                `Send any number in DM (e.g., 500) to request deposit\n` +
                `Send any number in group (e.g., 100) to order diamonds\n\n` +
                `*ADMIN ACTIONS:*\n` +
                `Reply with "done" or "ok" to approve an order\n` +
                `Reply with "amount//rcv" (e.g., 500//rcv) to approve deposit or process payment\n` +
                `/pendingdeposits - View pending deposit requests\n` +
                `/depstats - View deposit statistics\n` +
                `Reply with "/addadmin phone_number name" to add new admin`;
            
            await msg.reply(helpText);
            return;
        }
        
        // Add admin command (only for existing admins)
        const addAdminMatch = msg.body.trim().match(/^\/addadmin\s+(\d+)\s+(.+)$/);
        if (addAdminMatch) {
            if (!isAdminUser) {
                await msg.reply('❌ Only admins can add new admins.');
                return;
            }
            
            const phone = addAdminMatch[1];
            const name = addAdminMatch[2];
            const whatsappId = phone + '@c.us';
            
            const result = db.addAdmin(phone, whatsappId, name);
            
            if (result.success) {
                await msg.reply(`✅ *Admin Added*\n\nPhone: +${phone}\nName: ${name}\nStatus: Active`);
                console.log(`[ADMIN] New admin added: ${name} (+${phone})`);
            } else {
                await msg.reply(`❌ ${result.message}`);
            }
            return;
        }
        
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Handle message deletion (Delete for Everyone)
// ব্যবহারকারী যখন "Delete for Everyone" ব্যবহার করে মেসেজ ডিলিট করবে,
// তখন admin panel থেকেও অটোমেটিক সেই order ডিলিট হয়ে যাবে
client.on('message_revoke', async (after, before) => {
    try {
        // এই handler শুধুমাত্র ডায়মন্ড অর্ডার মেসেজ ডিলিট হওয়ার সময় কাজ করে
        // যখন ইউজার "Delete for Everyone" করে, তখন এই event ট্রিগার হয়
        
        console.log(`[DELETE EVENT] Message revoke detected! Message: "${before?.body}"`);
        
        if (!before) return; // কোন পূর্ববর্তী মেসেজ স্টেট না থাকলে রিটার্ন করো
        
        const messageBody = before.body?.trim() || '';
        const fromUserId = before.from;
        
        console.log(`[DELETE EVENT] Checking message - Body: "${messageBody}", From: ${fromUserId}`);
        
        // শুধুমাত্র ডায়মন্ড অর্ডার মেসেজ প্রসেস করো - আরো সহজ ম্যাচিং
        // যেকোনো সংখ্যা ধারণ করা মেসেজ (ডায়মন্ড অর্ডার হতে পারে)
        const numberMatch = messageBody.match(/\d+/);
        if (!numberMatch) {
            console.log(`[DELETE EVENT] Not a diamond order message, ignoring`);
            return;
        }
        
        // শুধুমাত্র গ্রুপ মেসেজ প্রসেস করো, ডিরেক্ট মেসেজ না
        if (!fromUserId || !fromUserId.includes('@g.us')) {
            console.log(`[DELETE EVENT] Not a group message, ignoring`);
            return;
        }
        
        const diamondAmount = parseInt(numberMatch[0]);
        console.log(`[DELETE EVENT] ✅ Processing delete - Amount: ${diamondAmount}💎, Group: ${fromUserId}`);
        
        // ডাটাবেস থেকে ম্যাচিং অর্ডার খুঁজে বের করে ডিলিট করো
        const database = db.loadDatabase();
        const groupData = database.groups[fromUserId];
        
        if (!groupData || !groupData.entries) {
            console.log(`[DELETE EVENT] Group not found in database`);
            return;
        }
        
        // সবচেয়ে সাম্প্রতিক pending order খুঁজো যা এই ইউজারের এবং ডায়মন্ড সংখ্যা ম্যাচ করে
        let deletedEntry = null;
        let deletedIndex = -1;
        
        for (let i = groupData.entries.length - 1; i >= 0; i--) {
            const entry = groupData.entries[i];
            
            // চেক: pending স্ট্যাটাস, একই ইউজার, এবং ডায়মন্ড সংখ্যা ম্যাচ করে
            if (entry.status === 'pending' && 
                entry.userId === fromUserId && 
                entry.diamonds === diamondAmount) {
                
                deletedEntry = groupData.entries.splice(i, 1)[0];
                deletedIndex = i;
                console.log(`[DELETE EVENT] ✅ Found & deleted order: ${deletedEntry.diamonds}💎 from ${deletedEntry.userId}`);
                break;
            }
        }
        
        if (deletedEntry) {
            // আপডেটেড ডাটাবেস সেভ করো
            db.saveDatabase(database);
            console.log(`[DELETE EVENT] Database saved`);
            
            // Admin panel কে নোটিফিকেশন পাঠাও
            try {
                await fetch('http://localhost:3000/api/order-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'order-deleted',
                        reason: 'user-delete',
                        groupId: fromUserId,
                        entry: deletedEntry,
                        message: `🗑️ অর্ডার ${deletedEntry.diamonds}💎 ইউজার ডিলিট করেছে`
                    })
                }).catch(e => console.log('[DELETE EVENT] Admin panel notification failed (offline)'));
            } catch (notifyError) {
                console.log('[DELETE EVENT] Admin panel কে নোটিফাই করতে পারছি না:', notifyError.message);
            }
        } else {
            console.log(`[DELETE EVENT] No matching pending order found`);
        }
        
    } catch (error) {
        console.error('[DELETE EVENT] Error handling message revoke:', error.message);
    }
});

// Function to periodically check for deleted messages
// এটি একটি ফলব্যাক মেকানিজম - message_revoke event কাজ না করলে এটি কাজ করবে
async function startDeletedMessageChecker(client) {
    setInterval(async () => {
        try {
            const database = db.loadDatabase();
            
            for (const [groupId, groupData] of Object.entries(database.groups)) {
                if (!groupData.entries || !Array.isArray(groupData.entries)) continue;
                
                // সব pending orders চেক করো
                for (let i = groupData.entries.length - 1; i >= 0; i--) {
                    const entry = groupData.entries[i];
                    
                    // pending status এর orders চেক করো
                    if (entry.status === 'pending' && entry.messageId) {
                        try {
                            // চেষ্টা করো মেসেজ খুঁজে বের করতে
                            const message = await client.getMessageById(entry.messageId);
                            
                            if (!message || !message.id) {
                                // মেসেজ আর নেই - ডিলিট হয়েছে
                                console.log(`[AUTO-CHECK] ✅ Detected deleted message: ${entry.diamonds}💎 from ${entry.userId}`);
                                const deletedEntry = groupData.entries.splice(i, 1)[0];
                                
                                // Notify admin
                                try {
                                    await fetch('http://localhost:3000/api/order-event', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            type: 'order-deleted',
                                            reason: 'message-deleted',
                                            groupId: groupId,
                                            entry: deletedEntry,
                                            message: `🗑️ অর্ডার ${deletedEntry.diamonds}💎 ডিলিট হয়েছে`
                                        })
                                    }).catch(e => {});
                                } catch (e) {}
                            }
                        } catch (e) {
                            // মেসেজ আর এক্সেসযোগ্য না হলে অর্ডার ডিলিট করো
                            if (e.message && e.message.includes('not found')) {
                                console.log(`[AUTO-CHECK] ✅ Message not found - deleting order: ${entry.diamonds}💎`);
                                groupData.entries.splice(i, 1);
                            }
                        }
                    }
                }
            }
            
            // চেঞ্জেস সেভ করো
            db.saveDatabase(database);
            
        } catch (error) {
            console.log(`[AUTO-CHECK] Error in deleted message checker: ${error.message}`);
        }
    }, 3000); // প্রতি ৩ সেকেন্ডে চেক করো
    
    console.log('[AUTO-CHECK] ✅ Deleted message checker enabled as fallback');
}

// Helper function to get group name
async function getGroupName(client, groupId) {
    try {
        const chat = await client.getChatById(groupId);
        return chat.name || null;
    } catch (error) {
        console.log(`[GROUP NAME] Could not fetch group name for ${groupId}:`, error.message);
        return null;
    }
}

// Initialize client
client.initialize();

console.log('🚀 Starting bot initialization...');

// Start Express server for message sending from admin panel
const app = express();
app.use(cors());
app.use(bodyParser.json());

console.log('✅ Express app created');

// Health check endpoint
app.get('/api/bot-status', async (req, res) => {
    console.log(`[BOT-STATUS] botIsReady: ${botIsReady}`);
    
    let qrCodeImage = null;
    
    // Generate QR code image if disconnected and we have the QR string
    if (!botIsReady && currentQRCode) {
        try {
            const QRCode = require('qrcode');
            qrCodeImage = await QRCode.toDataURL(currentQRCode, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (error) {
            console.error('Error generating QR code image:', error);
        }
    }
    
    res.json({ 
        isConnected: botIsReady,
        ready: botIsReady,
        message: botIsReady ? '✅ Bot Ready' : '❌ Bot Not Ready',
        qrCode: qrCodeImage,
        timestamp: new Date().toISOString()
    });
});

// Send message endpoint
app.post('/api/bot-send-message', async (req, res) => {
    try {
        const { groupId, message } = req.body;
        
        console.log(`[BOT-SEND] Request received for group: ${groupId}`);
        
        if (!groupId || !message) {
            return res.status(400).json({ error: 'groupId and message are required' });
        }
        
        console.log(`[BOT-SEND] Bot ready status: ${botIsReady}`);
        
        if (!botIsReady) {
            console.log(`[BOT-SEND] Bot not ready - rejecting message`);
            return res.status(503).json({ error: 'Bot is not ready yet' });
        }
        
        console.log(`📨 [BOT-SEND] Sending message to ${groupId}`);
        
        await client.sendMessage(groupId, message);
        
        console.log(`✅ [BOT-SEND] Message sent to ${groupId}`);
        res.json({ success: true, message: 'Message sent' });
        
    } catch (error) {
        console.error(`❌ [BOT-SEND] Error sending message:`, error.message);
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

// Get contact name endpoint
app.get('/api/get-contact-name/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!botIsReady) {
            return res.status(503).json({ error: 'Bot is not ready yet' });
        }
        
        try {
            const contact = await client.getContactById(userId);
            const userName = contact.pushname || contact.name || userId;
            res.json({ success: true, userName });
        } catch (error) {
            res.json({ success: false, userName: userId });
        }
        
    } catch (error) {
        console.error(`[GET-CONTACT-NAME] Error:`, error.message);
        res.status(500).json({ error: 'Failed to get contact name', details: error.message });
    }
});

// Send group status message endpoint
app.post('/api/send-group-message', async (req, res) => {
    try {
        const { groupId, message, type } = req.body;
        
        console.log(`[GROUP-MESSAGE] Sending ${type} message to group: ${groupId}`);
        
        if (!groupId || !message) {
            return res.status(400).json({ error: 'groupId and message are required' });
        }
        
        if (!botIsReady) {
            console.log('[GROUP-MESSAGE] ❌ Bot not ready');
            return res.status(503).json({ error: 'Bot is not ready yet' });
        }
        
        try {
            await client.sendMessage(groupId, message);
            console.log(`[GROUP-MESSAGE] ✅ Message sent to ${groupId}`);
            res.json({ success: true, message: 'Message sent successfully' });
        } catch (error) {
            console.error(`[GROUP-MESSAGE] ❌ Failed to send:`, error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    } catch (error) {
        console.error('[GROUP-MESSAGE] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get profile photo endpoint
app.get('/api/bot-profile-photo/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!botIsReady) {
            return res.status(503).json({ success: false, photoUrl: null, error: 'Bot is not ready yet' });
        }
        
        try {
            const contact = await client.getContactById(userId);
            const photoUrl = await contact.getProfilePicUrl();
            
            if (photoUrl) {
                res.json({ success: true, photoUrl });
            } else {
                res.json({ success: false, photoUrl: null });
            }
        } catch (error) {
            console.log(`[PROFILE-PHOTO] Could not fetch photo for ${userId}:`, error.message);
            res.json({ success: false, photoUrl: null });
        }
        
    } catch (error) {
        console.error(`[PROFILE-PHOTO] Error:`, error.message);
        res.json({ success: false, photoUrl: null, error: error.message });
    }
});

const BOT_API_PORT = process.env.BOT_API_PORT || 3001;
app.listen(BOT_API_PORT, () => {
    console.log(`\n✅ 🔌 Bot API Server running on http://localhost:${BOT_API_PORT}`);
    console.log(`📨 Message endpoint: POST http://localhost:${BOT_API_PORT}/api/bot-send-message`);
    console.log(`🔍 Status endpoint: GET http://localhost:${BOT_API_PORT}/api/bot-status\n`);
});

console.log('🚀 WhatsApp Bot Starting...');
console.log('⏳ Waiting for QR code...\n');
