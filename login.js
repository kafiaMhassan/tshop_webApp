// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA98IdrETQBUz-Bmkusx0-dfoYSQZcb4y0",
    authDomain: "project2-46d53.firebaseapp.com",
    projectId: "project2-46d53",
    storageBucket: "project2-46d53.appspot.com",
    messagingSenderId: "547659515711",
    appId: "1:547659515711:web:4f2aff7809406def61358a",
    measurementId: "G-XBSG9VGDNG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    document.getElementById(elementId.replace('Error', '')).classList.add('error');
}

// Function to clear error message
function clearError(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'none';
    document.getElementById(elementId.replace('Error', '')).classList.remove('error');
}

// Function to store user data in localStorage
function storeUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Function to get user data from Firestore
async function getUserData(userId) {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.log("No user data found!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
}

// Password toggle functionality
const passwordToggle = document.getElementById("passwordToggle");
const passwordInput = document.getElementById("password");

passwordToggle.addEventListener("click", function() {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});

// Form validation and submission
const form = document.getElementById("loginForm");
form.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    // Clear previous errors
    clearError("emailError");
    clearError("passwordError");
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // Basic validation
    let isValid = true;
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showError("emailError", "Please enter a valid email address");
        isValid = false;
    }
    
    if (password.length === 0) {
        showError("passwordError", "Please enter your password");
        isValid = false;
    }
    
    if (!isValid) return;
    
    try {
        // Sign in user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userData = await getUserData(user.uid);
        
        if (userData) {
            // Store user data in localStorage
            storeUserData({
                uid: user.uid,
                email: user.email,
                username: userData.username,
                userType: userData.userType,
                // Add any other user data you want to store
            });
            
            // Redirect based on user type
            if (userData.userType === 'retailer') {
                window.location.href = "retailer.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            // If no user data found, redirect to index
            window.location.href = "index.html";
        }
    } catch (error) {
        switch (error.code) {
            case 'auth/invalid-email':
                showError("emailError", "Invalid email address");
                break;
            case 'auth/user-not-found':
                showError("emailError", "No account found with this email");
                break;
            case 'auth/wrong-password':
                showError("passwordError", "Incorrect password");
                break;
            default:
                showError("emailError", "An error occurred during login");
                console.error(error);
        }
    }
});

// Forgot password functionality
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
forgotPasswordLink.addEventListener("click", function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showError("emailError", "Please enter a valid email address first");
        return;
    }
    
    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("Password reset email sent! Please check your inbox.");
        })
        .catch((error) => {
            switch (error.code) {
                case 'auth/invalid-email':
                    showError("emailError", "Invalid email address");
                    break;
                case 'auth/user-not-found':
                    showError("emailError", "No account found with this email");
                    break;
                default:
                    showError("emailError", "An error occurred while sending reset email");
                    console.error(error);
            }
        });
}); 