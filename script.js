// Firebase SDK Modules Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
    getFirestore, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6dGNa1ioiHA5FxbFfMDOb-9fBuHVv38c",
  authDomain: "proaiprompts-bef71.firebaseapp.com",
  projectId: "proaiprompts-bef71",
  storageBucket: "proaiprompts-bef71.firebasestorage.app",
  messagingSenderId: "1031868152077",
  appId: "1:1031868152077:web:abb404590a7ad2f6e99844",
  measurementId: "G-YGMRD3T2SF"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------------------------
    // 1. AUTH MODAL TOGGLE & STATE MANAGEMENT
    // --------------------------------------------------------------------------
    const authModal = document.getElementById('authModal');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const openSignupBtn = document.getElementById('openSignupBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const nameGroup = document.getElementById('nameGroup');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const toggleAuthText = document.getElementById('toggleAuthText');
    const authForm = document.getElementById('authForm');
    const authErrorMsg = document.getElementById('authErrorMsg');
    const googleAuthBtn = document.getElementById('googleAuthBtn');
    const navAuthArea = document.getElementById('navAuthArea');

    let isSignUpMode = false;

    function openModal(signUp = false) {
        isSignUpMode = signUp;
        updateModalUI();
        authErrorMsg.textContent = '';
        authModal.classList.add('active');
    }

    function closeModal() {
        authModal.classList.remove('active');
    }

    function updateModalUI() {
        if (isSignUpMode) {
            modalTitle.textContent = "Create Account";
            modalSubtitle.textContent = "Get instant access to 10,000+ premium AI prompts";
            nameGroup.style.display = 'block';
            authSubmitBtn.textContent = "Sign Up";
            toggleAuthText.innerHTML = `Already have an account? <a href="#" id="toggleAuthMode">Log In</a>`;
        } else {
            modalTitle.textContent = "Welcome Back";
            modalSubtitle.textContent = "Sign in to access your saved prompts and dashboard";
            nameGroup.style.display = 'none';
            authSubmitBtn.textContent = "Log In";
            toggleAuthText.innerHTML = `Don't have an account? <a href="#" id="toggleAuthMode">Sign Up</a>`;
        }
        attachToggleListener();
    }

    function attachToggleListener() {
        const toggleBtn = document.getElementById('toggleAuthMode');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isSignUpMode = !isSignUpMode;
                updateModalUI();
            });
        }
    }

    if (openLoginBtn) openLoginBtn.addEventListener('click', () => openModal(false));
    if (openSignupBtn) openSignupBtn.addEventListener('click', () => openModal(true));
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });

    // --------------------------------------------------------------------------
    // 2. FIREBASE GOOGLE SIGN-IN
    // --------------------------------------------------------------------------
    googleAuthBtn.addEventListener('click', async () => {
        try {
            authErrorMsg.textContent = '';
            await signInWithPopup(auth, googleProvider);
            closeModal();
        } catch (error) {
            authErrorMsg.textContent = error.message;
        }
    });

    // --------------------------------------------------------------------------
    // 3. FIREBASE EMAIL/PASSWORD AUTHENTICATION
    // --------------------------------------------------------------------------
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authErrorMsg.textContent = '';

        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const name = document.getElementById('authName').value;

        try {
            if (isSignUpMode) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (name) {
                    await updateProfile(userCredential.user, { displayName: name });
                }
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            closeModal();
        } catch (error) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                authErrorMsg.textContent = "Invalid email or password.";
            } else if (error.code === 'auth/email-already-in-use') {
                authErrorMsg.textContent = "This email is already registered.";
            } else if (error.code === 'auth/weak-password') {
                authErrorMsg.textContent = "Password should be at least 6 characters.";
            } else {
                authErrorMsg.textContent = error.message;
            }
        }
    });

    // --------------------------------------------------------------------------
    // 4. AUTH STATE OBSERVER
    // --------------------------------------------------------------------------
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const displayName = user.displayName || user.email.split('@')[0];
            navAuthArea.innerHTML = `
                <div class="user-badge-nav">
                    <span class="user-name-display">👋 ${displayName}</span>
                    <button class="btn-logout" id="logoutBtn">Logout</button>
                </div>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => {
                signOut(auth);
            });
        } else {
            navAuthArea.innerHTML = `
                <button class="btn-login" id="openLoginBtn">Log In</button>
                <button class="btn-primary" id="openSignupBtn">Sign Up</button>
            `;
            document.getElementById('openLoginBtn').addEventListener('click', () => openModal(false));
            document.getElementById('openSignupBtn').addEventListener('click', () => openModal(true));
        }
    });

    // --------------------------------------------------------------------------
    // 5. FETCH DYNAMIC PROMPTS FROM FIRESTORE
    // --------------------------------------------------------------------------
    async function loadPromptsFromFirestore() {
        const promptsGrid = document.querySelector('.prompts-grid');
        if (!promptsGrid) return;

        try {
            const querySnapshot = await getDocs(collection(db, "prompts"));
            if (!querySnapshot.empty) {
                promptsGrid.innerHTML = ''; // Clear hardcoded HTML cards
                querySnapshot.forEach((doc) => {
                    const p = doc.data();
                    const platformClass = (p.category || 'chatgpt').toLowerCase().replace(/\s+/g, '');
                    
                    const cardHTML = `
                        <div class="prompt-card glass-card">
                            <div class="card-top">
                                <span class="badge-platform ${platformClass}">${p.category || 'ChatGPT'}</span>
                                <button class="wishlist-btn">🤍</button>
                            </div>
                            <h3>${p.title}</h3>
                            <p>${p.description}</p>
                            <div class="card-meta">
                                <span>⭐ ${p.rating || '5.0'}</span>
                                <span>📥 ${p.uses || '0'} Uses</span>
                            </div>
                            <div class="card-bottom">
                                <span class="price-tag">$${p.price}</span>
                                <a href="#" class="btn-secondary">View Prompt</a>
                            </div>
                        </div>
                    `;
                    promptsGrid.insertAdjacentHTML('beforeend', cardHTML);
                });
                attachWishlistEvents();
            }
        } catch (error) {
            console.error("Error loading prompts from Firestore:", error);
        }
    }

    loadPromptsFromFirestore();

    // --------------------------------------------------------------------------
    // 6. REAL-TIME SEARCH FILTER FOR PROMPT CARDS
    // --------------------------------------------------------------------------
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.prompt-card');

            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                const badge = card.querySelector('.badge-platform').textContent.toLowerCase();

                if (title.includes(searchTerm) || description.includes(searchTerm) || badge.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // --------------------------------------------------------------------------
    // 7. WISHLIST TOGGLE
    // --------------------------------------------------------------------------
    function attachWishlistEvents() {
        const wishlistBtns = document.querySelectorAll('.wishlist-btn');
        wishlistBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.textContent === '🤍') {
                    btn.textContent = '❤️';
                    btn.style.transform = 'scale(1.3)';
                    setTimeout(() => btn.style.transform = 'scale(1)', 200);
                } else {
                    btn.textContent = '🤍';
                }
            });
        });
    }
    attachWishlistEvents();

    // --------------------------------------------------------------------------
    // 8. FAQ ACCORDION TOGGLE
    // --------------------------------------------------------------------------
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        question.style.cursor = 'pointer';
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    console.log("ProAIPrompts V2: Firestore Dynamic Engine Ready!");
});