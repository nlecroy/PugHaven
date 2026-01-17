# Firebase Setup Guide for PugHaven

This guide will walk you through setting up Firebase for your PugHaven website.

## Step 1: Create a Firebase Account

1. Go to [https://firebase.google.com/](https://firebase.google.com/)
2. Click "Get Started"
3. Sign in with your Google account (or create one)

## Step 2: Create a New Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "**Add project**" or "**Create a project**"
3. Enter a project name: `PugHaven` (or your preferred name)
4. Click "**Continue**"
5. (Optional) Disable Google Analytics if you don't need it
6. Click "**Create project**"
7. Wait for the project to be created
8. Click "**Continue**"

## Step 3: Register Your Web App

1. In the Firebase Console, you'll see "Get started by adding Firebase to your app"
2. Click the **Web icon** (`</>`)
3. Enter an app nickname: `PugHaven Web App`
4. **Check** "Also set up Firebase Hosting" (optional but recommended)
5. Click "**Register app**"

## Step 4: Copy Your Firebase Configuration

You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "pughaven-xxxxx.firebaseapp.com",
  databaseURL: "https://pughaven-xxxxx-default-rtdb.firebaseio.com",
  projectId: "pughaven-xxxxx",
  storageBucket: "pughaven-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

1. **Copy this entire object**
2. Open `firebase-config.js` in your PugHaven project
3. **Replace** the placeholder values with your actual values
4. Save the file

**Important**: Keep these values private! Don't share them publicly or commit them to public repositories without proper security rules.

## Step 5: Enable Firebase Authentication

1. In the Firebase Console, click "**Authentication**" in the left sidebar
2. Click "**Get started**"
3. Click on the "**Sign-in method**" tab
4. Find "**Email/Password**" in the list
5. Click on "**Email/Password**"
6. Toggle "**Enable**" to ON
7. Click "**Save**"

## Step 6: Create Firebase Realtime Database

1. In the Firebase Console, click "**Realtime Database**" in the left sidebar
2. Click "**Create Database**"
3. Select a database location (choose closest to your target audience):
   - United States: `us-central1`
   - Europe: `europe-west1`
   - Asia: `asia-southeast1`
4. Click "**Next**"
5. Select "**Start in test mode**" (we'll configure rules next)
6. Click "**Enable**"

## Step 7: Configure Database Security Rules

**Important**: The default test mode rules expire after 30 days. Set up proper rules now.

1. In the Realtime Database page, click the "**Rules**" tab
2. Replace the existing rules with:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('modAccess').exists()"
      }
    },
    "chat": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$messageId": {
        ".validate": "newData.hasChildren(['username', 'text', 'timestamp', 'type'])"
      }
    },
    "bannedWords": {
      ".read": "auth != null",
      ".write": "root.child('users').child(auth.uid).child('modAccess').child('chat').val() === true || root.child('users').child(auth.uid).child('modAccess').child('admin').val() === true"
    }
  }
}
```

3. Click "**Publish**"

### What These Rules Do:

- **users**: Users can read all user data, but can only write to their own data (or if they're a moderator)
- **chat**: All authenticated users can read and write chat messages
- **bannedWords**: Only chat moderators and admins can manage banned words

## Step 8: Test Your Configuration

1. Open `index.html` in a web browser
2. Try creating an account
3. If you see errors in the browser console (F12), check:
   - Firebase config values are correct
   - Authentication is enabled
   - Realtime Database is created
   - Database rules are published

## Step 9: Deploy to Firebase Hosting (Optional)

If you want to host your site on Firebase:

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase in Your Project

```bash
cd /path/to/PugHaven
firebase init
```

Select:
- **Hosting**: Configure files for Firebase Hosting
- Choose your Firebase project from the list
- Public directory: `.` (current directory)
- Configure as single-page app: `No`
- Set up automatic builds: `No`
- Don't overwrite `index.html`: `No`

### Deploy

```bash
firebase deploy
```

Your site will be live at: `https://your-project-id.web.app`

## Step 10: Managing Your Database

### View Data

1. Go to Firebase Console > Realtime Database
2. Click the "**Data**" tab
3. You'll see your database structure:
   - `users/`: User accounts and data
   - `chat/`: Chat messages
   - `bannedWords/`: Banned words list

### Export Data (Backup)

1. Click the three dots (⋮) next to your database name
2. Select "**Export JSON**"
3. Save the file as a backup

### Import Data

1. Click the three dots (⋮) next to your database name
2. Select "**Import JSON**"
3. Choose your backup file

## Troubleshooting

### Error: "Firebase: Error (auth/operation-not-allowed)"

**Solution**: Enable Email/Password authentication in Firebase Console > Authentication > Sign-in method

### Error: "PERMISSION_DENIED: Permission denied"

**Solution**: Check your database rules in Firebase Console > Realtime Database > Rules

### Error: "Firebase: Firebase App named '[DEFAULT]' already exists"

**Solution**: You're loading the Firebase scripts twice. Check that you only have one `firebase-config.js` import.

### Chat messages not appearing

**Solution**:
1. Check browser console for errors
2. Verify Realtime Database is created
3. Check database rules allow authenticated users to read/write

### Can't create account

**Solution**:
1. Verify Email/Password auth is enabled
2. Check browser console for specific error
3. Make sure `databaseURL` in config is correct

## Database Structure

Your database will look like this:

```
{
  "users": {
    "user-id-1": {
      "username": "PugLover123",
      "skittles": 850,
      "isOnline": true,
      "lastSeen": 1234567890,
      "items": {
        "rainbow_name": {
          "name": "🌈 Rainbow Name",
          "price": 500,
          "purchasedAt": 1234567890
        }
      },
      "modAccess": {
        "admin": true
      }
    }
  },
  "chat": {
    "message-id-1": {
      "username": "PugLover123",
      "text": "Hello everyone!",
      "timestamp": 1234567890,
      "type": "message"
    }
  },
  "bannedWords": {
    "word-id-1": "badword"
  }
}
```

## Security Best Practices

1. **Never share your Firebase config publicly** if your security rules aren't properly configured
2. **Always use security rules** to protect your database
3. **Monitor your Firebase usage** to avoid unexpected costs
4. **Set up budget alerts** in Google Cloud Console
5. **Enable App Check** for additional security (advanced)

## Next Steps

- Test all features (authentication, chat, games, shop)
- Invite friends to test
- Monitor Firebase Console for usage
- Consider upgrading to Blaze plan if you need more resources

## Support

If you encounter issues:
1. Check the browser console (F12) for errors
2. Review Firebase Console for authentication/database errors
3. Check that all steps in this guide were completed
4. Verify your Firebase config values are correct

---

Happy Gaming! 🐶🌈
