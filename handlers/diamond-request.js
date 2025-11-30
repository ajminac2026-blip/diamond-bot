const db = require('../config/database');
const fs = require('fs');
const path = require('path');

function waFormatCurrency(amount) {
    return `৳${parseFloat(amount).toFixed(2)}`;
}

// Get diamond status
function getDiamondStatus() {
    try {
        const statusPath = path.join(__dirname, '../config/diamond-status.json');
        if (fs.existsSync(statusPath)) {
            const data = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
            return data;
        }
        return { systemStatus: 'on', globalMessage: '', groupSettings: {}, adminDiamondStock: 0 };
    } catch (error) {
        console.error('[DIAMOND STATUS] Error reading status:', error);
        return { systemStatus: 'on', globalMessage: '', groupSettings: {}, adminDiamondStock: 0 };
    }
}

// Update diamond stock after order approval
function deductAdminDiamondStock(diamondCount) {
    try {
        const statusPath = path.join(__dirname, '../config/diamond-status.json');
        if (!fs.existsSync(statusPath)) {
            return { success: false, error: 'Status file not found' };
        }
        
        const data = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        const currentStock = data.adminDiamondStock || 0;
        
        if (currentStock < diamondCount) {
            console.log(`[STOCK DEDUCTION] ❌ Insufficient stock! Current: ${currentStock}, Requested: ${diamondCount}`);
            return { 
                success: false, 
                error: `অ্যাডমিনের কাছে যথেষ্ট ডায়মন্ড নেই। স্টক: ${currentStock}💎`,
                currentStock: currentStock,
                requested: diamondCount
            };
        }
        
        const newStock = currentStock - diamondCount;
        data.adminDiamondStock = newStock;
        data.lastStockDeduction = new Date().toISOString();
        
        // Save updated stock
        fs.writeFileSync(statusPath, JSON.stringify(data, null, 2), 'utf8');
        
        console.log(`[STOCK DEDUCTION] ✅ Stock updated: ${currentStock} → ${newStock} (Deducted: ${diamondCount}💎)`);
        
        // If stock is now 0, auto-OFF the system
        if (newStock === 0) {
            console.log(`[STOCK DEDUCTION] ⚠️ Stock depleted! Auto-OFF system...`);
            data.systemStatus = 'off';
            data.globalMessage = 'স্টক শেষ হয়ে গেছে। শীঘ্রই ফিরে আসবে। ধন্যবাদ!';
            data.autoOffAt = new Date().toISOString();
            fs.writeFileSync(statusPath, JSON.stringify(data, null, 2), 'utf8');
            
            // Notify admin panel to broadcast OFF message
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                fetch('http://localhost:3000/api/diamond-status/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ systemStatus: 'off' }),
                    signal: controller.signal
                }).catch(err => console.error('[AUTO-OFF] Failed to notify admin panel:', err.message));
                
                clearTimeout(timeoutId);
            } catch (err) {
                console.error('[AUTO-OFF] Error triggering OFF:', err.message);
            }
            
            return { 
                success: true, 
                newStock: newStock,
                stockDepleted: true,
                message: 'Stock depleted - system auto-OFF'
            };
        }
        
        return { 
            success: true, 
            newStock: newStock,
            stockDepleted: false,
            deducted: diamondCount
        };
    } catch (error) {
        console.error('[STOCK DEDUCTION] Error deducting stock:', error);
        return { success: false, error: error.message };
    }
}

// Get message for group
function getGroupMessage(groupId) {
    const status = getDiamondStatus();
    if (status.groupSettings && status.groupSettings[groupId]?.message) {
        return status.groupSettings[groupId].message;
    }
    return status.globalMessage;
}

// Safe function to write payment transactions with validation
function savePaymentTransaction(transaction) {
    try {
        // Validate transaction has required fields
        if (!transaction.userId || !transaction.groupId || !transaction.amount) {
            console.error('[PAYMENT TRANS] Invalid transaction - missing required fields:', transaction);
            return false;
        }
        
        // Ensure type is set
        if (!transaction.type) {
            transaction.type = 'payment'; // Default type
        }
        
        const transPath = path.join(__dirname, '../config/payment-transactions.json');
        let transactions = [];
        
        // Load existing transactions
        if (fs.existsSync(transPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(transPath, 'utf8'));
                transactions = Array.isArray(data) ? data : (data.payments || []);
            } catch (e) {
                console.error('[PAYMENT TRANS] Error reading file, starting fresh:', e.message);
                transactions = [];
            }
        }
        
        // Filter out any invalid entries before adding new one
        transactions = transactions.filter(t => 
            t && t.userId && t.status && 
            (t.type === 'auto' || t.type === 'manual' || t.type === 'auto-deduction' || t.type === 'payment')
        );
        
        // Generate ID if not present
        if (!transaction.id) {
            const maxId = transactions.reduce((max, t) => Math.max(max, t.id || 0), 0);
            transaction.id = maxId + 1;
        }
        
        // Add new transaction
        transactions.push(transaction);
        
        // Write back to file
        fs.writeFileSync(transPath, JSON.stringify(transactions, null, 2), 'utf8');
        console.log('[PAYMENT TRANS] ✅ Transaction saved:', { 
            userId: transaction.userId,
            amount: transaction.amount,
            type: transaction.type 
        });
        return true;
    } catch (e) {
        console.error('[PAYMENT TRANS] Error saving transaction:', e.message);
        return false;
    }
}

// Store pending diamond requests (ID + diamonds, waiting for admin approval)
const pendingDiamondRequests = {};

// Store pending user IDs for two-message flow (ID sent, waiting for diamonds)
const pendingUserIds = {};

async function handleMultiLineDiamondRequest(msg, userId, userName, groupId, fullMessage, groupName) {
    try {
        // Check if diamond system is ON
        const diamondStatus = getDiamondStatus();
        if (diamondStatus.systemStatus === 'off') {
            const message = getGroupMessage(groupId);
            await msg.reply(`❌ *Diamond Requests Currently OFF*\n\n${message || 'Diamond requests are not available right now. Please contact admin.'}`);
            return false;
        }

        // Parse multi-line format: Line 1 = ID/Phone, Line 2 = Diamonds
        const lines = fullMessage.trim().split('\n').map(l => l.trim()).filter(l => l);
        
        if (lines.length < 2) {
            // If not multi-line, treat as single number (old format)
            const diamonds = parseInt(fullMessage.trim());
            if (!isNaN(diamonds)) {
                return await handleDiamondRequest(msg, userId, userName, groupId, diamonds, groupName);
            }
            return false;
        }

        const userIdFromMsg = lines[0];
        const diamondsStr = lines[1];
        const diamonds = parseInt(diamondsStr);

        // Validate
        if (isNaN(diamonds) || diamonds <= 0) {
            await msg.reply('❌ Invalid diamond amount. Format: ID\\nDiamonds');
            return false;
        }

        if (diamonds > 10000) {
            await msg.reply('❌ Diamond amount too large. Maximum is 10,000 diamonds.');
            return false;
        }

        // Check admin stock availability BEFORE creating order
        const currentStock = diamondStatus.adminDiamondStock || 0;
        if (currentStock < diamonds) {
            await msg.reply(
                `❌ *অ্যাডমিনের কাছে যথেষ্ট ডায়মন্ড নেই*\n\n` +
                `আপনি চেয়েছেন: ${diamonds}💎\n` +
                `স্টকে আছে: ${currentStock}💎\n\n` +
                `আপনি সর্বোচ্চ ${currentStock}💎 অর্ডার দিতে পারবেন।`
            );
            console.log(`[INSUFFICIENT STOCK] User requested ${diamonds}💎 but only ${currentStock}💎 available`);
            return false;
        }

        // Create pending request (silent, no response yet)
        const requestId = `${userId}_${Date.now()}`;
        
        // Get group rate for currency calculation
        const groupData = db.getGroupData(groupId);
        const rate = groupData.rate || 2.3;
        
        pendingDiamondRequests[requestId] = {
            userId,
            userIdFromMsg,
            userName,
            groupId,
            diamonds,
            status: 'pending_approval',
            createdAt: new Date().toISOString(),
            msgObj: msg
        };

        // ALSO save to database so it can be found by approval handler
        const entry = db.addEntry(groupId, userId, diamonds, rate, groupName, msg.id._serialized, userName, userIdFromMsg);
        
        console.log(`[PENDING DIAMOND] Entry saved to DB:`, {
            id: entry.id,
            userId: entry.userId,
            status: entry.status,
            diamonds: entry.diamonds,
            groupId: groupId,
            groupName: groupName,
            messageId: entry.messageId
        });

        // Notify admin panel in real-time
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch('http://localhost:3000/api/order-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'new-order',
                    data: {
                        entryId: entry.id,
                        userId: userId,
                        userName: userName,
                        groupId: groupId,
                        diamonds: diamonds,
                        amount: diamonds * rate,
                        status: 'pending'
                    }
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log('[NOTIFY ADMIN] ✅ New order notified to admin panel');
            } else {
                console.error('[NOTIFY ADMIN] Server returned:', response.status);
            }
        } catch (notifyErr) {
            console.error('[NOTIFY ADMIN] Failed to notify new order:', notifyErr.message);
        }

        // No response to user - wait for admin approval
        console.log(`[PENDING DIAMOND] ${userName} (${userIdFromMsg}): ${diamonds}💎 - Waiting for admin approval`);
        console.log(`[PENDING DIAMOND] Stored with userId: ${userId}, groupId: ${groupId}`);
        console.log(`[PENDING DIAMOND] DB Entry ID: ${entry.id}`);

        return true;
    } catch (error) {
        console.error('Error handling multi-line diamond request:', error);
        await msg.reply('❌ Error processing request. Format: ID\\nDiamonds');
        return false;
    }
}

async function handleDiamondRequest(msg, userId, userName, groupId, diamonds, groupName) {
    try {
        // Check if diamond system is ON
        const diamondStatus = getDiamondStatus();
        if (diamondStatus.systemStatus === 'off') {
            const message = getGroupMessage(groupId);
            await msg.reply(`❌ *Diamond Requests Currently OFF*\n\n${message || 'Diamond requests are not available right now. Please contact admin.'}`);
            return false;
        }

        // Validate diamond amount
        if (diamonds <= 0) {
            await msg.reply('❌ Invalid diamond amount. Please send a positive number.');
            return false;
        }

        if (diamonds > 10000) {
            await msg.reply('❌ Diamond amount too large. Maximum is 10,000 diamonds.');
            return false;
        }

        // Check admin stock availability BEFORE creating order
        const currentStock = diamondStatus.adminDiamondStock || 0;
        if (currentStock < diamonds) {
            await msg.reply(
                `❌ *অ্যাডমিনের কাছে যথেষ্ট ডায়মন্ড নেই*\n\n` +
                `আপনি চেয়েছেন: ${diamonds}💎\n` +
                `স্টকে আছে: ${currentStock}💎\n\n` +
                `আপনি সর্বোচ্চ ${currentStock}💎 অর্ডার দিতে পারবেন।`
            );
            console.log(`[INSUFFICIENT STOCK] User requested ${diamonds}💎 but only ${currentStock}💎 available`);
            return false;
        }

        // Check for duplicate pending order
        const groupData = db.getGroupData(groupId);
        const rate = groupData.rate || 2.3;

        const contact = await msg.getContact();
        const userDisplayName = contact.pushname || userName || userId;

        // Add entry to database
        const entry = db.addEntry(groupId, userId, diamonds, rate, groupName, msg.id._serialized, userDisplayName);
        const totalValue = diamonds * rate;

        // Send confirmation to user
        const confirmationMsg = `✅ *Diamond Order Received*\n\n` +
            `👤 User: ${userDisplayName}\n` +
            `💎 Diamonds: ${diamonds}💎\n` +
            `💰 Amount Due: ${waFormatCurrency(totalValue)}\n` +
            `📊 Rate: ${waFormatCurrency(rate)}/💎\n\n` +
            `⏳ Waiting for admin approval...\n` +
            `Order ID: ${entry.id}`;

        await msg.reply(confirmationMsg);

        // Notify admin panel in real-time
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch('http://localhost:3000/api/order-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'new-order',
                    data: {
                        entryId: entry.id,
                        userId: userId,
                        userName: userDisplayName,
                        groupId: groupId,
                        diamonds: diamonds,
                        amount: totalValue,
                        status: 'pending'
                    }
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log('[NOTIFY ADMIN] ✅ New order notified to admin panel');
            } else {
                console.error('[NOTIFY ADMIN] Server returned:', response.status);
            }
        } catch (notifyErr) {
            console.error('[NOTIFY ADMIN] Failed to notify new order:', notifyErr.message);
        }

        // Log for admin
        console.log(`[DIAMOND ORDER] ${userDisplayName}: ${diamonds}💎 (${waFormatCurrency(totalValue)})`);

        return true;
    } catch (error) {
        console.error('Error handling diamond request:', error);
        await msg.reply('❌ Error processing your request. Please try again.');
        return false;
    }
}

async function approvePendingDiamond(requestId, groupId) {
    try {
        // Check if it's from database or in-memory
        if (requestId.startsWith('db_')) {
            // It's a database entry - just approve it
            const entryId = parseInt(requestId.replace('db_', ''));
            db.approveEntry(groupId, entryId);
            
            // Get the entry to return info
            const groupData = db.getGroupData(groupId);
            const groupName = groupData.name || 'Unknown Group';
            const entry = groupData.entries.find(e => e.id === entryId);
            if (entry) {
                // Check and deduct from admin diamond stock
                const stockResult = deductAdminDiamondStock(entry.diamonds);
                if (!stockResult.success) {
                    return {
                        success: false,
                        error: stockResult.error,
                        currentStock: stockResult.currentStock,
                        requested: stockResult.requested
                    };
                }
                
                // Auto-deduct if balance >= order amount
                const orderAmount = entry.diamonds * entry.rate;
                const currentBalance = db.getUserBalance(entry.userId);
                
                let autoDeductedAmount = 0;
                let finalBalance = currentBalance;
                let autoDeductMessage = '';
                
                if (currentBalance >= orderAmount && orderAmount > 0) {
                    // Auto-deduct from balance
                    autoDeductedAmount = orderAmount;
                    finalBalance = db.updateUserBalance(entry.userId, -autoDeductedAmount);
                    
                    // Record auto-deduction using safe function
                    savePaymentTransaction({
                        userId: entry.userId,
                        userName: entry.userName,
                        groupId: groupId,
                        amount: autoDeductedAmount,
                        type: 'auto',
                        status: 'approved',
                        createdAt: new Date().toISOString(),
                        orderId: entry.id
                    });
                    
                    // Log to admin panel
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 3000);
                        
                        await fetch('http://localhost:3000/api/auto-deductions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                groupId: groupId,
                                groupName: groupName,
                                amount: autoDeductedAmount,
                                timestamp: new Date().toISOString()
                            }),
                            signal: controller.signal
                        }).catch(err => console.error('[AUTO-DEDUCT LOG] Failed:', err.message));
                        
                        clearTimeout(timeoutId);
                    } catch (err) {
                        console.error('[AUTO-DEDUCT LOG] Error logging auto-deduction:', err.message);
                    }
                    
                    console.log(`[AUTO-DEDUCT ON ORDER] ${entry.userName}: ${waFormatCurrency(autoDeductedAmount)} deducted from balance`);
                    
                    autoDeductMessage = `\n\n⚡ *Auto-Deduction Applied*\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `Before: ${waFormatCurrency(currentBalance)}\n` +
                        `Deducted: ${waFormatCurrency(autoDeductedAmount)}\n` +
                        `After: ${waFormatCurrency(finalBalance)}`;
                } else if (currentBalance > 0 && currentBalance < orderAmount) {
                    // Partial deduction
                    autoDeductedAmount = currentBalance;
                    finalBalance = db.updateUserBalance(entry.userId, -autoDeductedAmount);
                    
                    // Record partial auto-deduction
                    savePaymentTransaction({
                        userId: entry.userId,
                        userName: entry.userName,
                        groupId: groupId,
                        amount: autoDeductedAmount,
                        type: 'auto',
                        status: 'approved',
                        createdAt: new Date().toISOString(),
                        orderId: entry.id
                    });
                    
                    // Log to admin panel
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 3000);
                        
                        await fetch('http://localhost:3000/api/auto-deductions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                groupId: groupId,
                                groupName: groupName,
                                amount: autoDeductedAmount,
                                timestamp: new Date().toISOString()
                            }),
                            signal: controller.signal
                        }).catch(err => console.error('[AUTO-DEDUCT LOG] Failed:', err.message));
                        
                        clearTimeout(timeoutId);
                    } catch (err) {
                        console.error('[AUTO-DEDUCT LOG] Error logging auto-deduction:', err.message);
                    }
                    
                    console.log(`[AUTO-DEDUCT ON ORDER] ${entry.userName}: ${waFormatCurrency(autoDeductedAmount)} partial deduction from balance`);
                    
                    const remainingDue = orderAmount - autoDeductedAmount;
                    autoDeductMessage = `\n\n⚡ *Partial Auto-Deduction*\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `Order Amount: ${waFormatCurrency(orderAmount)}\n` +
                        `Balance Available: ${waFormatCurrency(currentBalance)}\n` +
                        `Deducted: ${waFormatCurrency(autoDeductedAmount)}\n` +
                        `Remaining Due: ${waFormatCurrency(remainingDue)}`;
                }
                
                let stockMessage = '';
                if (stockResult.stockDepleted) {
                    stockMessage = `\n\n⚠️ *Stock Depleted!*\n━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `রেমেইনিং স্টক: 0💎\nসিস্টেম স্বয়ংক্রিয়ভাবে বন্ধ হয়ে গেছে।`;
                } else {
                    stockMessage = `\n\n💎 *Stock Update*\n━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `রেমেইনিং স্টক: ${stockResult.newStock}💎`;
                }
                
                return {
                    success: true,
                    orderId: entry.id,
                    userId: entry.userId,
                    userName: entry.userId,
                    userIdFromMsg: entry.userId,
                    diamonds: entry.diamonds,
                    rate: entry.rate,
                    totalValue: entry.diamonds * entry.rate,
                    autoDeductedAmount: autoDeductedAmount,
                    finalBalance: finalBalance,
                    stockInfo: stockResult,
                    message: `✅ *Diamond Order Approved*\n\n` +
                        `💎 Diamonds: ${entry.diamonds}💎\n` +
                        `💰 Amount Due: ${waFormatCurrency(entry.diamonds * entry.rate)}\n` +
                        `📊 Rate: ${waFormatCurrency(entry.rate)}/💎\n\n` +
                        `✓ Status: Approved\n` +
                        `Order ID: ${entry.id}` +
                        autoDeductMessage +
                        stockMessage
                };
            }
            return null;
        }

        // In-memory request
        const request = pendingDiamondRequests[requestId];
        if (!request) return null;

        const rate = 2.3;
        const totalValue = request.diamonds * rate;

        // Check and deduct from admin diamond stock
        const stockResult = deductAdminDiamondStock(request.diamonds);
        if (!stockResult.success) {
            return {
                success: false,
                error: stockResult.error,
                currentStock: stockResult.currentStock,
                requested: stockResult.requested
            };
        }

        // Entry should already be in database from handleMultiLineDiamondRequest
        // Just approve it - find the correct pending entry by matching diamonds
        const groupData = db.getGroupData(groupId);
        const entry = groupData.entries.find(e => 
            e.userId === request.userId && 
            e.diamonds === request.diamonds &&
            e.status === 'pending'
        );
        if (entry) {
            db.approveEntry(groupId, entry.id);
        }

        // Mark as approved
        pendingDiamondRequests[requestId].status = 'approved';
        pendingDiamondRequests[requestId].approvedAt = new Date().toISOString();
        if (entry) {
            pendingDiamondRequests[requestId].orderId = entry.id;
        }

        // Auto-deduct if balance >= order amount
        const orderAmount = totalValue;
        const currentBalance = db.getUserBalance(request.userId);
        
        let autoDeductedAmount = 0;
        let finalBalance = currentBalance;
        let autoDeductMessage = '';
        
        if (currentBalance >= orderAmount && orderAmount > 0) {
            // Auto-deduct from balance
            autoDeductedAmount = orderAmount;
            finalBalance = db.updateUserBalance(request.userId, -autoDeductedAmount);
            
            // Record auto-deduction using safe function
            savePaymentTransaction({
                userId: request.userId,
                userName: request.userName,
                groupId: groupId,
                amount: autoDeductedAmount,
                type: 'auto',
                status: 'approved',
                createdAt: new Date().toISOString(),
                orderId: entry?.id || Date.now()
            });
            
            // Get group name for logging
            const groupData = db.getGroupData(groupId);
            const groupName = groupData.name || 'Unknown Group';
            
            // Log to admin panel
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                await fetch('http://localhost:3000/api/auto-deductions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        groupId: groupId,
                        groupName: groupName,
                        amount: autoDeductedAmount,
                        timestamp: new Date().toISOString()
                    }),
                    signal: controller.signal
                }).catch(err => console.error('[AUTO-DEDUCT LOG] Failed:', err.message));
                
                clearTimeout(timeoutId);
            } catch (err) {
                console.error('[AUTO-DEDUCT LOG] Error logging auto-deduction:', err.message);
            }
            
            console.log(`[AUTO-DEDUCT ON ORDER] ${request.userName}: ${waFormatCurrency(autoDeductedAmount)} deducted from balance`);
            
            autoDeductMessage = `\n\n⚡ *Auto-Deduction Applied*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Before: ${waFormatCurrency(currentBalance)}\n` +
                `Deducted: ${waFormatCurrency(autoDeductedAmount)}\n` +
                `After: ${waFormatCurrency(finalBalance)}`;
        } else if (currentBalance > 0 && currentBalance < orderAmount) {
            // Partial deduction
            autoDeductedAmount = currentBalance;
            finalBalance = db.updateUserBalance(request.userId, -autoDeductedAmount);
            
            // Record partial auto-deduction
            savePaymentTransaction({
                userId: request.userId,
                userName: request.userName,
                groupId: groupId,
                amount: autoDeductedAmount,
                type: 'auto',
                status: 'approved',
                createdAt: new Date().toISOString(),
                orderId: entry?.id || Date.now()
            });
            
            // Get group name for logging
            const groupData = db.getGroupData(groupId);
            const groupName = groupData.name || 'Unknown Group';
            
            // Log to admin panel
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                await fetch('http://localhost:3000/api/auto-deductions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        groupId: groupId,
                        groupName: groupName,
                        amount: autoDeductedAmount,
                        timestamp: new Date().toISOString()
                    }),
                    signal: controller.signal
                }).catch(err => console.error('[AUTO-DEDUCT LOG] Failed:', err.message));
                
                clearTimeout(timeoutId);
            } catch (err) {
                console.error('[AUTO-DEDUCT LOG] Error logging auto-deduction:', err.message);
            }
            
            console.log(`[AUTO-DEDUCT ON ORDER] ${request.userName}: ${waFormatCurrency(autoDeductedAmount)} partial deduction from balance`);
            
            const remainingDue = orderAmount - autoDeductedAmount;
            autoDeductMessage = `\n\n⚡ *Partial Auto-Deduction*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Order Amount: ${waFormatCurrency(orderAmount)}\n` +
                `Balance Available: ${waFormatCurrency(currentBalance)}\n` +
                `Deducted: ${waFormatCurrency(autoDeductedAmount)}\n` +
                `Remaining Due: ${waFormatCurrency(remainingDue)}`;
        }

        let stockMessage = '';
        if (stockResult.stockDepleted) {
            stockMessage = `\n\n⚠️ *Stock Depleted!*\n━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `রেমেইনিং স্টক: 0💎\nসিস্টেম স্বয়ংক্রিয়ভাবে বন্ধ হয়ে গেছে।`;
        } else {
            stockMessage = `\n\n💎 *Stock Update*\n━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `রেমেইনিং স্টক: ${stockResult.newStock}💎`;
        }

        return {
            success: true,
            orderId: entry?.id || Date.now(),
            userId: request.userId,
            userName: request.userName,
            userIdFromMsg: request.userIdFromMsg,
            diamonds: request.diamonds,
            rate: rate,
            totalValue: totalValue,
            autoDeductedAmount: autoDeductedAmount,
            finalBalance: finalBalance,
            stockInfo: stockResult,
            message: `✅ *Diamond Order Approved*\n\n` +
                `👤 User ID: ${request.userIdFromMsg}\n` +
                `💎 Diamonds: ${request.diamonds}💎\n` +
                `💰 Amount Due: ${waFormatCurrency(totalValue)}\n` +
                `📊 Rate: ${waFormatCurrency(rate)}/💎\n\n` +
                `✓ Status: Approved\n` +
                `Order ID: ${entry?.id || 'pending'}` +
                autoDeductMessage +
                stockMessage
        };
    } catch (error) {
        console.error('Error approving pending diamond:', error);
        return null;
    }
}

function findPendingDiamondByUser(userId, groupId) {
    console.log(`[SEARCH PENDING] Looking for userId: ${userId}, groupId: ${groupId}`);
    console.log(`[SEARCH PENDING] Available requests:`, Object.entries(pendingDiamondRequests).map(([k, v]) => `${k.substring(0, 25)}... (userId: ${v.userId}, groupId: ${v.groupId})`));
    
    // First check in-memory pendingDiamondRequests
    for (const [requestId, request] of Object.entries(pendingDiamondRequests)) {
        if (request.userId === userId && request.groupId === groupId && request.status === 'pending_approval') {
            console.log(`[SEARCH PENDING] ✅ FOUND in memory: ${requestId}`);
            return { requestId, request };
        }
    }
    
    // Then check database for pending entries (fallback)
    const groupData = db.getGroupData(groupId);
    console.log(`[SEARCH PENDING] Checking database for groupId: ${groupId}`);
    console.log(`[SEARCH PENDING] Group data exists:`, !!groupData);
    console.log(`[SEARCH PENDING] Entries count:`, groupData?.entries?.length || 0);
    
    if (groupData && groupData.entries) {
        console.log(`[SEARCH PENDING] Searching in ${groupData.entries.length} entries...`);
        groupData.entries.forEach((e, i) => {
            console.log(`[SEARCH PENDING]   Entry ${i}: userId=${e.userId}, status=${e.status}, matches=${e.userId === userId && e.status === 'pending'}`);
        });
        
        const pendingEntry = groupData.entries.find(e => e.userId === userId && e.status === 'pending');
        if (pendingEntry) {
            console.log(`[SEARCH PENDING] ✅ FOUND in DB: ${pendingEntry.id}`);
            return { 
                requestId: `db_${pendingEntry.id}`, 
                request: pendingEntry,
                fromDatabase: true 
            };
        }
    }
    
    console.log(`[SEARCH PENDING] ❌ NOT FOUND`);
    return null;
}



async function getDiamondRequestStats(groupId) {
    try {
        const groupData = db.getGroupData(groupId);
        
        let totalDiamonds = 0;
        let totalValue = 0;
        let pendingCount = 0;
        let approvedCount = 0;

        groupData.entries.forEach(entry => {
            const value = entry.diamonds * entry.rate;
            totalDiamonds += entry.diamonds;
            totalValue += value;

            if (entry.status === 'pending') {
                pendingCount++;
            } else if (entry.status === 'approved') {
                approvedCount++;
            }
        });

        return {
            totalDiamonds,
            totalValue,
            pendingCount,
            approvedCount,
            totalOrders: groupData.entries.length,
            currentRate: groupData.rate || 2.3
        };
    } catch (error) {
        console.error('Error getting diamond stats:', error);
        return null;
    }
}

async function showPendingRequests(msg, groupId) {
    try {
        const groupData = db.getGroupData(groupId);
        const pendingEntries = groupData.entries.filter(e => e.status === 'pending');

        if (pendingEntries.length === 0) {
            await msg.reply('✅ No pending diamond requests!');
            return;
        }

        let message = `*⏳ PENDING DIAMOND REQUESTS*\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;

        pendingEntries.forEach((entry, idx) => {
            const value = entry.diamonds * entry.rate;
            message += `${idx + 1}. ${entry.diamonds}💎 @ ${waFormatCurrency(entry.rate)}\n`;
            message += `   Amount: ${waFormatCurrency(value)}\n`;
            message += `   Status: Pending\n\n`;
        });

        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `Total Pending: ${pendingEntries.length} requests\n`;
        message += `Total Diamonds: ${pendingEntries.reduce((sum, e) => sum + e.diamonds, 0)}💎`;

        await msg.reply(message);
        return true;
    } catch (error) {
        console.error('Error showing pending requests:', error);
        await msg.reply('❌ Error loading pending requests.');
        return false;
    }
}

// Cancel/Delete a pending or submitted order
async function cancelDiamondRequest(msg, userId, userName, groupId, orderId = null) {
    try {
        let deleted = false;
        let deletedDetails = {};

        // If orderId provided, delete specific order
        if (orderId) {
            const groupData = db.getGroupData(groupId);
            if (groupData.entries && groupData.entries[orderId]) {
                deletedDetails = groupData.entries[orderId];
                delete groupData.entries[orderId];
                // Save back to database
                const fullDb = db.loadDatabase();
                fullDb.groups[groupId] = groupData;
                db.saveDatabase(fullDb);
                deleted = true;
                console.log(`[CANCEL] Order ${orderId} deleted by ${userName}`);
            }
        } else {
            // Cancel pending request (multi-line format) for this user
            // First try to find and delete from database
            const groupData = db.getGroupData(groupId);
            if (groupData.entries && Array.isArray(groupData.entries)) {
                for (let i = 0; i < groupData.entries.length; i++) {
                    const entry = groupData.entries[i];
                    if (entry.userId === userId && entry.status === 'pending') {
                        deletedDetails = entry;
                        groupData.entries.splice(i, 1);
                        // Save back to database
                        const fullDb = db.loadDatabase();
                        fullDb.groups[groupId] = groupData;
                        db.saveDatabase(fullDb);
                        deleted = true;
                        console.log(`[CANCEL] Database entry deleted by ${userName}`);
                        break;
                    }
                }
            }
            
            // Also delete from in-memory pending requests
            for (const [reqId, req] of Object.entries(pendingDiamondRequests)) {
                if (req.userId === userId && req.groupId === groupId) {
                    if (!deleted) {
                        deletedDetails = req;
                    }
                    delete pendingDiamondRequests[reqId];
                    deleted = true;
                    console.log(`[CANCEL] Pending request ${reqId} cancelled by ${userName}`);
                    break;
                }
            }
        }

        if (deleted) {
            const message = `✅ Your order has been cancelled!\n\n` +
                `💎 Diamonds: ${deletedDetails.diamonds || 'N/A'}\n` +
                `💰 Amount: ${deletedDetails.amount ? waFormatCurrency(deletedDetails.amount) : 'N/A'}\n` +
                `Status: ❌ CANCELLED`;
            
            await msg.reply(message);
            
            // Return deletion info for broadcast
            return {
                success: true,
                userId,
                userName,
                groupId,
                orderId: orderId || deletedDetails.requestId,
                diamonds: deletedDetails.diamonds,
                amount: deletedDetails.amount,
                reason: 'User cancelled'
            };
        } else {
            await msg.reply('❌ No pending or submitted orders found to cancel.');
            return { success: false };
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        await msg.reply('❌ Error cancelling order. Please try again.');
        return { success: false };
    }
}

module.exports = {
    handleDiamondRequest,
    handleMultiLineDiamondRequest,
    approvePendingDiamond,
    findPendingDiamondByUser,
    getDiamondRequestStats,
    showPendingRequests,
    cancelDiamondRequest,
    getDiamondStatus,
    getGroupMessage,
    deductAdminDiamondStock,
    pendingDiamondRequests,
    pendingUserIds,
    waFormatCurrency,
    savePaymentTransaction
};
