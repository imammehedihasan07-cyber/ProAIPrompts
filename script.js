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
        if(authErrorMsg) authErrorMsg.textContent = '';
        if(authModal) authModal.classList.add('active');
    }

    function closeModal() {
        if(authModal) authModal.classList.remove('active');
    }

    function updateModalUI() {
        if (isSignUpMode) {
            if(modalTitle) modalTitle.textContent = "Create Account";
            if(modalSubtitle) modalSubtitle.textContent = "Get instant access to 10,000+ premium AI prompts";
            if(nameGroup) nameGroup.style.display = 'block';
            if(authSubmitBtn) authSubmitBtn.textContent = "Sign Up";
            if(toggleAuthText) toggleAuthText.innerHTML = `Already have an account? <a href="#" id="toggleAuthMode">Log In</a>`;
        } else {
            if(modalTitle) modalTitle.textContent = "Welcome Back";
            if(modalSubtitle) modalSubtitle.textContent = "Sign in to access your saved prompts and dashboard";
            if(nameGroup) nameGroup.style.display = 'none';
            if(authSubmitBtn) authSubmitBtn.textContent = "Log In";
            if(toggleAuthText) toggleAuthText.innerHTML = `Don't have an account? <a href="#" id="toggleAuthMode">Sign Up</a>`;
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

    if(authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeModal();
        });
    }

    // --------------------------------------------------------------------------
    // 2. FIREBASE GOOGLE SIGN-IN
    // --------------------------------------------------------------------------
    if(googleAuthBtn) {
        googleAuthBtn.addEventListener('click', async () => {
            try {
                if(authErrorMsg) authErrorMsg.textContent = '';
                await signInWithPopup(auth, googleProvider);
                closeModal();
            } catch (error) {
                if(authErrorMsg) authErrorMsg.textContent = error.message;
            }
        });
    }

    // --------------------------------------------------------------------------
    // 3. FIREBASE EMAIL/PASSWORD AUTHENTICATION
    // --------------------------------------------------------------------------
    if(authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(authErrorMsg) authErrorMsg.textContent = '';

            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const name = document.getElementById('authName') ? document.getElementById('authName').value : '';

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
                    if(authErrorMsg) authErrorMsg.textContent = "Invalid email or password.";
                } else if (error.code === 'auth/email-already-in-use') {
                    if(authErrorMsg) authErrorMsg.textContent = "This email is already registered.";
                } else if (error.code === 'auth/weak-password') {
                    if(authErrorMsg) authErrorMsg.textContent = "Password should be at least 6 characters.";
                } else {
                    if(authErrorMsg) authErrorMsg.textContent = error.message;
                }
            }
        });
    }

    // --------------------------------------------------------------------------
    // 4. AUTH STATE OBSERVER
    // --------------------------------------------------------------------------
    onAuthStateChanged(auth, (user) => {
        if (user && navAuthArea) {
            const displayName = user.displayName || user.email.split('@')[0];
            navAuthArea.innerHTML = `
                <div class="user-badge-nav">
                    <span class="user-name-display">👋 ${displayName}</span>
                    <button class="btn-logout" id="logoutBtn">Logout</button>
                </div>
            `;
            const logoutBtn = document.getElementById('logoutBtn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    signOut(auth);
                });
            }
        } else if(navAuthArea) {
            navAuthArea.innerHTML = `
                <button class="btn-login" id="openLoginBtn">Log In</button>
                <button class="btn-primary" id="openSignupBtn">Sign Up</button>
            `;
            const loginBtn = document.getElementById('openLoginBtn');
            const signupBtn = document.getElementById('openSignupBtn');
            if(loginBtn) loginBtn.addEventListener('click', () => openModal(false));
            if(signupBtn) signupBtn.addEventListener('click', () => openModal(true));
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
                promptsGrid.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const p = doc.data();
                    const platformClass = (p.category || 'chatgpt').toLowerCase().replace(/\s+/g, '');
                    
                    const cardHTML = `
                        <div class="prompt-card glass-card" data-category="${(p.category || '').toLowerCase()}">
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
                                <button class="btn-secondary view-prompt-btn" data-title="${p.title}" data-desc="${p.description}">View Prompt</button>
                            </div>
                        </div>
                    `;
                    promptsGrid.insertAdjacentHTML('beforeend', cardHTML);
                });
                attachWishlistEvents();
                attachViewPromptEvents();
            }
        } catch (error) {
            console.error("Error loading prompts from Firestore:", error);
        }
    }

    loadPromptsFromFirestore();

    // --------------------------------------------------------------------------
    // 6. SEARCH & CATEGORY FILTER FOR PROMPT CARDS
    // --------------------------------------------------------------------------
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            filterPrompts(searchTerm);
        });
    }

    function filterPrompts(term = '') {
        const cards = document.querySelectorAll('.prompt-card');
        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const badge = card.querySelector('.badge-platform').textContent.toLowerCase();

            if (title.includes(term) || description.includes(term) || badge.includes(term)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Popular Tags Filter Click Event
    const tagButtons = document.querySelectorAll('.popular-tags .tag, .hero-tags .tag');
    tagButtons.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const tagText = tag.textContent.trim().toLowerCase();
            if(searchInput) searchInput.value = tagText;
            filterPrompts(tagText);
            document.querySelector('#prompts').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // --------------------------------------------------------------------------
    // 7. VIEW PROMPT MODAL & COPY TO CLIPBOARD
    // --------------------------------------------------------------------------
    function attachViewPromptEvents() {
        const viewBtns = document.querySelectorAll('.view-prompt-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const title = btn.getAttribute('data-title');
                const desc = btn.getAttribute('data-desc');
                
                alert(`📌 Prompt Title: ${title}\n\n📝 Description: ${desc}\n\n💡 Full Prompt Code Access: Enabled for registered members!`);
            });
        });
    }

    // --------------------------------------------------------------------------
    // 8. WISHLIST TOGGLE
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

    // --------------------------------------------------------------------------
    // 9. FAQ ACCORDION TOGGLE
    // --------------------------------------------------------------------------
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        if(question) {
            question.style.cursor = 'pointer';
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        }
    });

    console.log("ProAIPrompts: Fully Optimized Dynamic Engine Active!");
});