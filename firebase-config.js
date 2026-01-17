// Firebase Configuration
// PugHaven Firebase Project
const firebaseConfig = {
    apiKey: "AIzaSyD0DtC9N_q3jZL-xEuzhn6QSXvgTjkzOGE",
    authDomain: "pughaven-dec6a.firebaseapp.com",
    databaseURL: "https://pughaven-dec6a-default-rtdb.firebaseio.com",
    projectId: "pughaven-dec6a",
    storageBucket: "pughaven-dec6a.firebasestorage.app",
    messagingSenderId: "80883268365",
    appId: "1:80883268365:web:18e3fd790a0cdd2bd48e44"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const database = firebase.database();
