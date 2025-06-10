import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA98IdrETQBUz-Bmkusx0-dfoYSQZcb4y0",
  authDomain: "project2-46d53.firebaseapp.com",
  projectId: "project2-46d53",
  storageBucket: "project2-46d53.appspot.com",
  messagingSenderId: "547659515711",
  appId: "1:547659515711:web:4f2aff7809406def61358a",
  measurementId: "G-XBSG9VGDNG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function for error message
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

// Function to store user data 
async function storeUserData(userId, userData) {
    try {
        await setDoc(doc(db, "users", userId), userData);
        return true;
    } catch (error) {
        console.error("Error storing user data:", error);
        return false;
    }
}

// Password toggle functionality
const passwordToggle = document.getElementById("passwordToggle");
const passwordInput = document.getElementById("password");

passwordToggle.addEventListener("click", function() {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);     //This sets the input type to the new value ('text' or 'password').
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});

// Form validation
const form = document.getElementById("signupForm");
form.addEventListener("submit", async function(event) {
    event.preventDefault(); //reload page
    
    // Clear previous errors
    clearError("usernameError");
    clearError("emailError");
    clearError("passwordError");
    
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const userType = document.querySelector('input[name="userType"]:checked').value;
    
    // Basic validation
    let isValid = true;
    
    if (username.length < 3) {
        showError("usernameError", "Username must be at least 3 characters");
        isValid = false;
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showError("emailError", "Please enter a valid email address");
        isValid = false;
    }
    
    if (password.length < 6) {
        showError("passwordError", "Password must be at least 6 characters");
        isValid = false;
    }
    
    if (!isValid) return;
    
    try {
        // Create user account
        // usercredentials; object returned by Firebase when you create a new user 
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;    //property
        
        // creates object Store additional user data 
        const userData = {
            username: username,
            email: email,
            userType: userType,
            createdAt: new Date().toISOString(),
            
        };
        
        const success = await storeUserData(user.uid, userData);//Call your own function storeUserData to save the extra info to your database.
                                                             //stores whether true/false in success
        if (success) {
            // Redirection based on user type
            if (userType === 'retailer') {
                window.location.href = "retailer.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            showError("emailError", "Error creating account. Please try again.");
        }
    } catch (error) {
        switch (error.code) {   //property of the error object
            case 'auth/email-already-in-use':
                showError("emailError", "This email is already registered");
                break;
            case 'auth/invalid-email':
                showError("emailError", "Invalid email address");
                break;
            case 'auth/weak-password':
                showError("passwordError", "Password is too weak");
                break;
            default:
                showError("emailError", "An error occurred during signup");
                console.error(error);
        }
    }
});


