# 🐶 PugHaven

A pug-themed gaming and social website featuring mini-games, live chat, virtual currency, and a shop system.

## Features

### 🎮 Games
- **Pug Catch**: Catch falling treats to earn Skittles
- **Pug Run**: Avoid obstacles in an endless runner
- **Pug Memory**: Match pug-themed cards

### 💬 Live Chat
- Real-time messaging with Firebase
- Online user status indicators
- Announcement system for moderators
- Automatic word filtering with account suspension

### 💰 Skittles Currency System
- Earn Skittles by playing games
- Starting balance: 100 Skittles
- Purchase special items from the shop
- Daily moderator pay (100 Skittles/day for chat mods)

### 🛍️ Shop System
- **Rainbow Name** (500 Skittles): Rainbow colors throughout the site
- **Custom Pug Emoji** (300 Skittles): Exclusive pug emojis
- **Double Skittles Boost** (1000 Skittles): 2x game earnings for 24h
- **Golden Frame** (750 Skittles): Golden border on chat messages
- **VIP Badge** (2000 Skittles): VIP badge display
- **Confetti Effect** (600 Skittles): Confetti on messages

### 🔄 Refund System
- Refund any owned item for full Skittles value
- Items can be repurchased later

### 👮 Moderator System

#### High-Level Moderators (Password: CHA1NS4WPUG)
- Rain Skittles on all online users (100 each)
- Give everyone 500 Skittles
- Give yourself unlimited Skittles
- Gift Skittles to any user (unlimited amount)

#### Chat Moderators (Password: 0H10PUG)
- Receive 100 Skittles daily as payment
- Ban words (auto-suspends accounts for 1 hour if used)
- Make announcements in chat
- Manage banned word list

### 🔐 Authentication
- Username and password system
- Persistent login (saves username for convenience)
- Password required each time for security
- Starting balance of 100 Skittles for new users

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting (recommended)

## File Structure

```
PugHaven/
├── index.html              # Main HTML structure
├── styles.css              # Pug-themed styling
├── firebase-config.js      # Firebase configuration
├── auth.js                 # Authentication system
├── chat.js                 # Live chat functionality
├── shop.js                 # Shop and inventory system
├── moderator.js            # Moderator panel functions
├── games.js                # Mini-games implementation
├── app.js                  # Main application logic
└── README.md               # This file
```

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "PugHaven")
4. Follow the setup wizard

### 2. Enable Firebase Services

#### Enable Authentication:
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Click **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

#### Enable Realtime Database:
1. In Firebase Console, go to **Realtime Database**
2. Click **Create Database**
3. Select location (choose closest to your users)
4. Start in **Test mode** (or configure rules as needed)
5. Click **Enable**

### 3. Configure Database Rules

In the Realtime Database, go to **Rules** tab and use:

```json
{
  "rules": {
    "users": {
      ".read": true,
      "$uid": {
        ".write": "$uid === auth.uid"
      }
    },
    "chat": {
      ".read": true,
      ".write": "auth != null"
    },
    "bannedWords": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

### 4. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register your app (give it a nickname)
5. Copy the `firebaseConfig` object

### 5. Update firebase-config.js

Open `firebase-config.js` and replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 6. Deploy to Firebase Hosting (Optional)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select **Hosting**
   - Choose your Firebase project
   - Set public directory to current directory (`.`)
   - Configure as single-page app: **No**
   - Don't overwrite index.html

4. Deploy:
   ```bash
   firebase deploy
   ```

### 7. Local Testing

You can also test locally by opening `index.html` in a web browser. However, some browsers may block Firebase requests from `file://` URLs. Use a local server instead:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server package)
npx http-server
```

Then visit `http://localhost:8000`

## Usage

### Creating an Account
1. Open the website
2. Click "Sign up"
3. Enter a username (min 3 characters) and password
4. Click "Create Account"

### Playing Games
1. Login to your account
2. Click the "Games" tab
3. Choose a game and click "Play"
4. Earn Skittles based on your score!

### Using the Chat
1. Navigate to the "Chat" tab
2. See who's online in the sidebar
3. Type messages and click "Send"
4. Watch for announcements from moderators

### Shopping
1. Go to the "Shop" tab
2. Browse available items
3. Click "Buy Now" if you have enough Skittles
4. View your items in the "My Items" tab

### Moderator Access
1. Click the "Moderator" button
2. Select moderator level
3. Enter the password:
   - Admin: `CHA1NS4WPUG`
   - Chat Mod: `0H10PUG`
4. Access is saved to your account

## Moderator Passwords

- **Admin Moderator**: `CHA1NS4WPUG`
- **Chat Moderator**: `0H10PUG`

## Security Features

- Password protection for user accounts
- Automatic 1-hour suspension for using banned words
- Moderator password protection
- Firebase security rules to protect user data

## Future Enhancements

- More mini-games
- Achievement system
- Friend system
- Private messaging
- Custom avatars
- Leaderboards
- Special events and limited-time items

## Credits

Created for the PugHaven community. Inspired by nintendoboi2222's original concept.

## License

This project is open source and available for modification and redistribution.

---

Made with 🐶 and ❤️
