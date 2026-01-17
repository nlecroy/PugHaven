// Moderator System

const MOD_PASSWORDS = {
    admin: 'CHA1NS4WPUG',
    chat: '0H10PUG'
};

let currentModLevel = null;

function showModMenu() {
    document.getElementById('mod-menu-modal').style.display = 'block';

    // Check if user has saved mod access
    if (currentUser.modAccess) {
        if (currentUser.modAccess.admin) {
            showAdminPanel();
        } else if (currentUser.modAccess.chat) {
            showChatModPanel();
        } else {
            showModPasswordPrompt();
        }
    } else {
        showModPasswordPrompt();
    }
}

function closeModMenu() {
    document.getElementById('mod-menu-modal').style.display = 'none';
    hideAllModPanels();
}

function showModPasswordPrompt() {
    document.getElementById('mod-password-prompt').classList.remove('hidden');
    document.getElementById('mod-password-input').classList.add('hidden');
    document.getElementById('admin-mod-panel').classList.add('hidden');
    document.getElementById('chat-mod-panel').classList.add('hidden');
}

function promptModPassword(level) {
    currentModLevel = level;
    document.getElementById('mod-password-prompt').classList.add('hidden');
    document.getElementById('mod-password-input').classList.remove('hidden');

    const title = level === 'admin' ? 'Admin Moderator Password' : 'Chat Moderator Password';
    document.getElementById('mod-level-title').textContent = title;
}

function cancelModPassword() {
    currentModLevel = null;
    document.getElementById('mod-password').value = '';
    showModPasswordPrompt();
}

async function verifyModPassword() {
    const password = document.getElementById('mod-password').value;

    if (password === MOD_PASSWORDS[currentModLevel]) {
        // Save mod access to user account
        await database.ref('users/' + currentUser.uid + '/modAccess/' + currentModLevel).set(true);

        if (!currentUser.modAccess) {
            currentUser.modAccess = {};
        }
        currentUser.modAccess[currentModLevel] = true;

        document.getElementById('mod-password').value = '';

        if (currentModLevel === 'admin') {
            showAdminPanel();
        } else if (currentModLevel === 'chat') {
            showChatModPanel();
        }
    } else {
        alert('Incorrect password!');
    }
}

function showAdminPanel() {
    hideAllModPanels();
    document.getElementById('admin-mod-panel').classList.remove('hidden');
}

function showChatModPanel() {
    hideAllModPanels();
    document.getElementById('chat-mod-panel').classList.remove('hidden');
    loadBannedWords(); // Refresh banned words list
}

function hideAllModPanels() {
    document.getElementById('mod-password-prompt').classList.add('hidden');
    document.getElementById('mod-password-input').classList.add('hidden');
    document.getElementById('admin-mod-panel').classList.add('hidden');
    document.getElementById('chat-mod-panel').classList.add('hidden');
}

// Admin Moderator Functions

async function rainSkittles() {
    try {
        const snapshot = await database.ref('users').orderByChild('isOnline').equalTo(true).once('value');
        const updates = {};

        snapshot.forEach((childSnapshot) => {
            const userId = childSnapshot.key;
            const userData = childSnapshot.val();
            const currentSkittles = userData.skittles || 0;
            updates['users/' + userId + '/skittles'] = currentSkittles + 100;
        });

        await database.ref().update(updates);

        // Send announcement
        await database.ref('chat').push({
            username: 'SYSTEM',
            text: '🌈 IT\'S RAINING SKITTLES! Everyone online receives 100 Skittles! 🌈',
            timestamp: Date.now(),
            type: 'announcement'
        });

        alert('🌈 Skittles rained on all online users!');
    } catch (error) {
        console.error('Rain skittles error:', error);
        alert('Failed to rain skittles');
    }
}

async function giveEveryoneSkittles() {
    try {
        const snapshot = await database.ref('users').orderByChild('isOnline').equalTo(true).once('value');
        const updates = {};

        snapshot.forEach((childSnapshot) => {
            const userId = childSnapshot.key;
            const userData = childSnapshot.val();
            const currentSkittles = userData.skittles || 0;
            updates['users/' + userId + '/skittles'] = currentSkittles + 500;
        });

        await database.ref().update(updates);

        // Send announcement
        await database.ref('chat').push({
            username: 'SYSTEM',
            text: '💰 BONUS SKITTLES! Everyone online receives 500 Skittles! 💰',
            timestamp: Date.now(),
            type: 'announcement'
        });

        alert('💰 500 Skittles given to all online users!');
    } catch (error) {
        console.error('Give everyone skittles error:', error);
        alert('Failed to give skittles');
    }
}

async function giveSelfSkittles() {
    const amount = parseInt(document.getElementById('self-skittles').value);

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    try {
        const newSkittles = currentUser.skittles + amount;
        await database.ref('users/' + currentUser.uid + '/skittles').set(newSkittles);

        currentUser.skittles = newSkittles;
        updateSkittlesDisplay();

        document.getElementById('self-skittles').value = '';
        alert(`✅ Added ${amount} Skittles to your account!`);
    } catch (error) {
        console.error('Give self skittles error:', error);
        alert('Failed to add skittles');
    }
}

async function giftSkittles() {
    const username = document.getElementById('gift-username').value.trim();
    const amount = parseInt(document.getElementById('gift-amount').value);

    if (!username || !amount || amount <= 0) {
        alert('Please enter a valid username and amount');
        return;
    }

    try {
        // Find user by username
        const snapshot = await database.ref('users').orderByChild('username').equalTo(username).once('value');

        if (!snapshot.exists()) {
            alert('User not found');
            return;
        }

        let targetUserId;
        snapshot.forEach((childSnapshot) => {
            targetUserId = childSnapshot.key;
        });

        const targetUserSnapshot = await database.ref('users/' + targetUserId).once('value');
        const targetUser = targetUserSnapshot.val();
        const newSkittles = (targetUser.skittles || 0) + amount;

        await database.ref('users/' + targetUserId + '/skittles').set(newSkittles);

        document.getElementById('gift-username').value = '';
        document.getElementById('gift-amount').value = '';

        alert(`✅ Gifted ${amount} Skittles to ${username}!`);
    } catch (error) {
        console.error('Gift skittles error:', error);
        alert('Failed to gift skittles');
    }
}

// Chat Moderator Functions

async function banWord() {
    const word = document.getElementById('ban-word').value.trim();

    if (!word) {
        alert('Please enter a word to ban');
        return;
    }

    try {
        await database.ref('bannedWords').push(word);
        document.getElementById('ban-word').value = '';
        alert(`✅ Word "${word}" has been banned!`);
    } catch (error) {
        console.error('Ban word error:', error);
        alert('Failed to ban word');
    }
}

async function unbanWord(wordId) {
    const confirmUnban = confirm('Unban this word?');
    if (!confirmUnban) return;

    try {
        await database.ref('bannedWords/' + wordId).remove();
        alert('✅ Word unbanned!');
    } catch (error) {
        console.error('Unban word error:', error);
        alert('Failed to unban word');
    }
}

async function makeAnnouncement() {
    const text = document.getElementById('announcement-text').value.trim();

    if (!text) {
        alert('Please enter an announcement message');
        return;
    }

    try {
        await database.ref('chat').push({
            username: currentUser.username,
            text: text,
            timestamp: Date.now(),
            type: 'announcement'
        });

        document.getElementById('announcement-text').value = '';
        alert('✅ Announcement posted!');
    } catch (error) {
        console.error('Announcement error:', error);
        alert('Failed to post announcement');
    }
}
