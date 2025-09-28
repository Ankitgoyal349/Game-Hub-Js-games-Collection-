// js/auth.js

// Key for storing user data in localStorage
const USERS_STORAGE_KEY = 'gameHubUsers';
// Key for storing the currently logged-in user's email
const LOGGED_IN_USER_KEY = 'loggedInUser';

/**
 * Loads all registered users from localStorage.
 * @returns {Array} An array of user objects.
 */
function loadUsers() {
    try {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Error loading users from localStorage:", error);
        return [];
    }
}

/**
 * Saves the current list of users back to localStorage.
 * @param {Array} users - The array of user objects to save.
 */
function saveUsers(users) {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Error saving users to localStorage:", error);
    }
}

/**
 * Saves the currently logged-in user's email.
 * @param {string} email - The email of the logged-in user.
 */
function setLoggedInUser(email) {
    localStorage.setItem(LOGGED_IN_USER_KEY, email);
}

/**
 * Clears the logged-in user's data.
 */
function clearLoggedInUser() {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
}

/**
 * Gets the email of the currently logged-in user.
 * @returns {string|null} The user's email or null if not logged in.
 */
export function getLoggedInUserEmail() {
    return localStorage.getItem(LOGGED_IN_USER_KEY);
}

/**
 * Shows a custom modal message.
 * NOTE: The modal element structure is present in all HTML files.
 */
function showModal(title, message) {
    const modal = document.getElementById('game-message-modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    modal.classList.remove('hidden');

    // Add close listener if not already there
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.add('hidden');
    }
}

// --- SIGNUP LOGIC ---
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;

        if (password.length < 6) {
            showModal("Sign Up Failed", "Password must be at least 6 characters long.");
            return;
        }

        const users = loadUsers();
        if (users.find(u => u.email === email)) {
            showModal("Sign Up Failed", "An account with this email already exists. Please log in.");
            return;
        }

        const newUser = { email, password, username: email.split('@')[0], scores: {} };
        users.push(newUser);
        saveUsers(users);

        // Auto-login the new user and redirect to the dashboard
        setLoggedInUser(newUser.email);
        
        showModal("Sign Up Success! 🎉", "Your account is created. Redirecting to the Game Arcade...");
        
        setTimeout(() => {
            window.location.href = 'games.html';
        }, 1500);
    });
}

// --- LOGIN LOGIC ---
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const users = loadUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            setLoggedInUser(user.email);
            showModal("Login Successful! 🕹️", `Welcome back, ${user.username}! Redirecting to the Game Arcade...`);
            
            setTimeout(() => {
                window.location.href = 'games.html';
            }, 1500);
        } else {
            showModal("Login Failed", "Invalid email or password. Please try again or sign up.");
        }
    });
}

// --- LOGOUT LOGIC ---
export function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            clearLoggedInUser();
            window.location.href = 'Home.html';
        });
    }
}

// Ensure functions are available globally if scripts are combined or for testing
window.getLoggedInUserEmail = getLoggedInUserEmail;
window.setupLogout = setupLogout;