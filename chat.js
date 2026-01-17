// Chat System
let bannedWords = [];
let accountSuspended = false;
let suspensionTimeout = null;

function initializeChat() {
    loadOnlineUsers();
    loadChatMessages();
    loadBannedWords();
    checkAccountStatus();
    setupSkittlesListener();
}

function loadOnlineUsers() {
    const onlineList = document.getElementById('online-list');

    database.ref('users').orderByChild('isOnline').equalTo(true).on('value', (snapshot) => {
        onlineList.innerHTML = '';
        const users = [];

        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            if (user.username) {
                users.push(user.username);
            }
        });

        if (users.length === 0) {
            onlineList.innerHTML = '<p class="no-users">No users online</p>';
        } else {
            users.forEach(username => {
                const userDiv = document.createElement('div');
                userDiv.className = 'online-user';
                userDiv.innerHTML = `🟢 ${username}`;
                onlineList.appendChild(userDiv);
            });
        }
    });
}

function loadChatMessages() {
    const chatMessages = document.getElementById('chat-messages');

    database.ref('chat').limitToLast(50).on('child_added', (snapshot) => {
        const message = snapshot.val();
        const messageDiv = document.createElement('div');

        if (message.type === 'announcement') {
            messageDiv.className = 'message announcement';
            messageDiv.innerHTML = `
                <div class="announcement-banner">📢 ANNOUNCEMENT 📢</div>
                <div class="announcement-text">${escapeHtml(message.text)}</div>
                <div class="announcement-by">- ${escapeHtml(message.username)}</div>
            `;
        } else {
            messageDiv.className = 'message';
            const timestamp = new Date(message.timestamp).toLocaleTimeString();
            messageDiv.innerHTML = `
                <span class="message-user">${escapeHtml(message.username)}:</span>
                <span class="message-text">${escapeHtml(message.text)}</span>
                <span class="message-time">${timestamp}</span>
            `;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    if (accountSuspended) {
        alert('Your account is suspended for 1 hour due to using a banned word.');
        return;
    }

    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Check for banned words
    const containsBannedWord = bannedWords.some(word =>
        message.toLowerCase().includes(word.toLowerCase())
    );

    if (containsBannedWord) {
        suspendAccount();
        input.value = '';
        return;
    }

    try {
        await database.ref('chat').push({
            username: currentUser.username,
            text: message,
            timestamp: Date.now(),
            type: 'message'
        });

        input.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    }
}

function suspendAccount() {
    accountSuspended = true;

    // Save suspension to database
    const suspensionEnd = Date.now() + (60 * 60 * 1000); // 1 hour from now
    database.ref('users/' + currentUser.uid + '/suspended').set(suspensionEnd);

    alert('⚠️ Your account has been suspended for 1 hour for using a banned word!');

    // Set timeout to unsuspend
    suspensionTimeout = setTimeout(() => {
        unsuspendAccount();
    }, 60 * 60 * 1000);

    // Disable all interactions
    document.getElementById('chat-input').disabled = true;
}

function unsuspendAccount() {
    accountSuspended = false;
    database.ref('users/' + currentUser.uid + '/suspended').remove();
    document.getElementById('chat-input').disabled = false;
    alert('✅ Your account suspension has been lifted!');
}

async function checkAccountStatus() {
    const snapshot = await database.ref('users/' + currentUser.uid + '/suspended').once('value');
    const suspensionEnd = snapshot.val();

    if (suspensionEnd && suspensionEnd > Date.now()) {
        const remainingTime = suspensionEnd - Date.now();
        accountSuspended = true;
        document.getElementById('chat-input').disabled = true;

        suspensionTimeout = setTimeout(() => {
            unsuspendAccount();
        }, remainingTime);

        const minutes = Math.ceil(remainingTime / 60000);
        alert(`⚠️ Your account is suspended. Time remaining: ${minutes} minutes`);
    }
}

function loadBannedWords() {
    database.ref('bannedWords').on('value', (snapshot) => {
        bannedWords = [];
        const wordsDiv = document.getElementById('banned-words');
        if (wordsDiv) {
            wordsDiv.innerHTML = '';
        }

        snapshot.forEach((childSnapshot) => {
            const word = childSnapshot.val();
            bannedWords.push(word);

            if (wordsDiv) {
                const wordDiv = document.createElement('div');
                wordDiv.className = 'banned-word-item';
                wordDiv.innerHTML = `
                    <span>${escapeHtml(word)}</span>
                    <button onclick="unbanWord('${childSnapshot.key}')">Unban</button>
                `;
                wordsDiv.appendChild(wordDiv);
            }
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
