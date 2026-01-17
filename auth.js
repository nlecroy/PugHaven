// Authentication System
let currentUser = null;

// Check if user is already logged in on page load
window.addEventListener('load', () => {
    const savedUsername = localStorage.getItem('pughaven_username');
    if (savedUsername) {
        document.getElementById('login-username').value = savedUsername;
    }
});

function showSignup() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

async function signup() {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    if (!username || !password) {
        alert('Please enter a username and password');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (username.length < 3) {
        alert('Username must be at least 3 characters');
        return;
    }

    try {
        // Check if username already exists
        const snapshot = await database.ref('users').orderByChild('username').equalTo(username).once('value');
        if (snapshot.exists()) {
            alert('Username already taken');
            return;
        }

        // Create user with email format (username@pughaven.local)
        const email = `${username}@pughaven.local`;
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;

        // Initialize user data in database
        await database.ref('users/' + userId).set({
            username: username,
            skittles: 100, // Starting skittles
            items: {},
            createdAt: Date.now(),
            isOnline: true,
            lastSeen: Date.now()
        });

        alert('Account created successfully!');
        showLogin();
        document.getElementById('login-username').value = username;
    } catch (error) {
        console.error('Signup error:', error);
        alert('Error creating account: ' + error.message);
    }
}

async function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }

    try {
        const email = `${username}@pughaven.local`;
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;

        // Save username for next time
        localStorage.setItem('pughaven_username', username);

        // Load user data
        const snapshot = await database.ref('users/' + userId).once('value');
        currentUser = {
            uid: userId,
            ...snapshot.val()
        };

        // Set user as online
        await database.ref('users/' + userId).update({
            isOnline: true,
            lastSeen: Date.now()
        });

        // Set up presence system
        const presenceRef = database.ref('users/' + userId + '/isOnline');
        const connectedRef = database.ref('.info/connected');

        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                presenceRef.onDisconnect().set(false);
                presenceRef.set(true);
            }
        });

        // Check for moderator access
        checkSavedModAccess();

        // Check for daily pay for chat moderators
        checkDailyPay();

        // Show main screen
        showMainScreen();
    } catch (error) {
        console.error('Login error:', error);
        alert('Invalid username or password');
    }
}

function logout() {
    if (currentUser) {
        database.ref('users/' + currentUser.uid).update({
            isOnline: false,
            lastSeen: Date.now()
        });
    }

    auth.signOut();
    currentUser = null;

    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');

    // Don't clear username from localStorage - keep it for next login
}

function showMainScreen() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    document.getElementById('username-display').textContent = '👤 ' + currentUser.username;
    updateSkittlesDisplay();
    showTab('games'); // Show games tab by default
    initializeChat();
    loadShopItems();
    loadInventory();
}

function updateSkittlesDisplay() {
    if (currentUser) {
        document.getElementById('skittles-count').textContent = currentUser.skittles || 0;
    }
}

// Listen for skittles changes in real-time
function setupSkittlesListener() {
    if (currentUser) {
        database.ref('users/' + currentUser.uid + '/skittles').on('value', (snapshot) => {
            currentUser.skittles = snapshot.val() || 0;
            updateSkittlesDisplay();
        });
    }
}

// Check if user has saved moderator access
function checkSavedModAccess() {
    if (currentUser) {
        database.ref('users/' + currentUser.uid + '/modAccess').once('value', (snapshot) => {
            if (snapshot.exists()) {
                currentUser.modAccess = snapshot.val();
            }
        });
    }
}

// Check and distribute daily pay for chat moderators
async function checkDailyPay() {
    if (!currentUser) return;

    const modAccessSnapshot = await database.ref('users/' + currentUser.uid + '/modAccess').once('value');
    const modAccess = modAccessSnapshot.val();

    if (modAccess && modAccess.chat) {
        const lastPaySnapshot = await database.ref('users/' + currentUser.uid + '/lastDailyPay').once('value');
        const lastPay = lastPaySnapshot.val() || 0;
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (now - lastPay >= oneDayMs) {
            // Give daily pay
            const currentSkittles = currentUser.skittles || 0;
            await database.ref('users/' + currentUser.uid).update({
                skittles: currentSkittles + 100,
                lastDailyPay: now
            });
            currentUser.skittles = currentSkittles + 100;
            updateSkittlesDisplay();
            alert('💰 Daily moderator pay received: 100 Skittles!');
        }
    }
}
