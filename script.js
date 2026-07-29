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
    getDocs,
    addDoc
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
    // 2. FIREBASE GOOGLE SIGN-IN & AUTH
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
                if(authErrorMsg) authErrorMsg.textContent = "Authentication Error: " + error.message;
            }
        });
    }

    // --------------------------------------------------------------------------
    // 3. AUTH STATE OBSERVER & ADMIN TRIGGER
    // --------------------------------------------------------------------------
    onAuthStateChanged(auth, (user) => {
        if (user && navAuthArea) {
            const displayName = user.displayName || user.email.split('@')[0];
            navAuthArea.innerHTML = `
                <div class="user-badge-nav" style="display:flex; align-items:center; gap:8px;">
                    <span class="user-name-display" style="color:#38bdf8; font-weight:600; font-size:0.9rem;">👋 ${displayName}</span>
                    <button class="btn-secondary" id="openAdminBtn" style="padding: 6px 12px; font-size: 0.8rem; border-color: var(--primary-blue);">+ Add Prompt</button>
                    <button class="btn-logout" id="logoutBtn" style="padding: 6px 12px; font-size: 0.8rem; background:rgba(239,68,68,0.2); color:#ef4444; border:1px solid rgba(239,68,68,0.4); border-radius:4px; cursor:pointer;">Logout</button>
                </div>
            `;
            const logoutBtn = document.getElementById('logoutBtn');
            if(logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));

            const openAdminBtn = document.getElementById('openAdminBtn');
            const adminModal = document.getElementById('adminModal');
            if(openAdminBtn && adminModal) {
                openAdminBtn.addEventListener('click', () => adminModal.classList.add('active'));
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
    // 4. FETCH DYNAMIC PROMPTS FROM FIRESTORE
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
                                <button class="btn-secondary view-prompt-btn" 
                                    data-title="${p.title}" 
                                    data-desc="${p.description}" 
                                    data-payurl="${p.payUrl || ''}">View Prompt</button>
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
    // 5. ADMIN ADD PROMPT FORM SUBMIT (WITH REAL PAYMENT URL)
    // --------------------------------------------------------------------------
    const adminPromptForm = document.getElementById('adminPromptForm');
    const adminModal = document.getElementById('adminModal');
    const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');
    const adminStatusMsg = document.getElementById('adminStatusMsg');

    if(closeAdminModalBtn && adminModal) {
        closeAdminModalBtn.addEventListener('click', () => adminModal.classList.remove('active'));
    }

    if(adminPromptForm) {
        adminPromptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            adminStatusMsg.textContent = 'Publishing prompt to database...';

            const payUrlInput = document.getElementById('adminPayUrl');
            const payUrlValue = payUrlInput ? payUrlInput.value : '';

            const newPrompt = {
                title: document.getElementById('adminTitle').value,
                category: document.getElementById('adminCategory').value,
                description: document.getElementById('adminDesc').value,
                promptCode: document.getElementById('adminPromptCode').value, 
                price: parseFloat(document.getElementById('adminPrice').value) || 9.99,
                uses: document.getElementById('adminUses').value || '1.0k',
                payUrl: payUrlValue, // The actual Stripe/LemonSqueezy link
                rating: 5.0
            };

            try {
                await addDoc(collection(db, "prompts"), newPrompt);
                adminStatusMsg.textContent = '✅ Prompt Added Successfully!';
                adminPromptForm.reset();
                setTimeout(() => {
                    adminModal.classList.remove('active');
                    adminStatusMsg.textContent = '';
                    loadPromptsFromFirestore();
                }, 1500);
            } catch (err) {
                adminStatusMsg.textContent = '❌ Error adding prompt: ' + err.message;
            }
        });
    }

    // --------------------------------------------------------------------------
    // 6. SEARCH & CATEGORY FILTER
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
    // 7. VIEW PROMPT MODAL & SECURE REDIRECT LOGIC
    // --------------------------------------------------------------------------
    const promptDetailModal = document.getElementById('promptDetailModal');
    const closePromptModalBtn = document.getElementById('closePromptModalBtn');
    const closePromptModalAction = document.getElementById('closePromptModalAction');
    const copyPromptBtn = document.getElementById('copyPromptBtn');

    let currentPaymentUrl = "";

    function attachViewPromptEvents() {
        const viewBtns = document.querySelectorAll('.view-prompt-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.prompt-card');
                const title = btn.getAttribute('data-title');
                const desc = btn.getAttribute('data-desc');
                const category = card.querySelector('.badge-platform').textContent;
                const price = card.querySelector('.price-tag').textContent;

                // Load real payment URL if admin provided one
                currentPaymentUrl = btn.getAttribute('data-payurl') || "";

                document.getElementById('modalPromptTitle').textContent = title;
                document.getElementById('modalPromptDesc').textContent = desc;
                document.getElementById('modalPromptCategory').textContent = category;
                document.getElementById('modalPromptPrice').textContent = price;

                // HIDE THE REAL PROMPT! ONLY SHOW PREVIEW
                document.getElementById('modalPromptCode').textContent = `[PREVIEW FORMULA]\nAct as a senior expert in ${category}.\nTask: ${desc}\n\n[🔒 Full Uncut Prompt & Technical Parameters Locked - Buy to Unlock]`;

                if(promptDetailModal) promptDetailModal.classList.add('active');
            });
        });
    }

    if(closePromptModalBtn && promptDetailModal) {
        closePromptModalBtn.addEventListener('click', () => promptDetailModal.classList.remove('active'));
    }

    // When clicking "Buy / Unlock Prompt", redirect to Stripe/LemonSqueezy!
    if(closePromptModalAction) {
        closePromptModalAction.addEventListener('click', () => {
            if (currentPaymentUrl && currentPaymentUrl.trim() !== "") {
                window.location.href = currentPaymentUrl;
            } else {
                alert("⚡ Redirecting to Checkout Gateway...\n\n(Admin Note: Please update this prompt in Database with a valid Stripe/LemonSqueezy Checkout Link)");
            }
        });
    }

    // Copying the preview
    if(copyPromptBtn) {
        copyPromptBtn.addEventListener('click', () => {
            const codeText = document.getElementById('modalPromptCode').textContent;
            navigator.clipboard.writeText(codeText).then(() => {
                copyPromptBtn.textContent = '✅ Copied!';
                setTimeout(() => copyPromptBtn.textContent = '📋 Copy Prompt', 2000);
            });
        });
    }

    // --------------------------------------------------------------------------
    // 8. FOOTER LEGAL & POLICY MODALS
    // --------------------------------------------------------------------------
    const infoModal = document.getElementById('infoModal');
    const closeInfoModalBtn = document.getElementById('closeInfoModalBtn');
    const infoTitle = document.getElementById('infoModalTitle');
    const infoContent = document.getElementById('infoModalContent');

    if(closeInfoModalBtn && infoModal) {
        closeInfoModalBtn.addEventListener('click', () => infoModal.classList.remove('active'));
    }

    const footerLinks = document.querySelectorAll('footer a');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if(href && href.startsWith('#')) {
                e.preventDefault();
                const linkText = link.textContent.trim();
                infoTitle.textContent = linkText;
                
                if(linkText.includes('Privacy')) {
                    infoContent.innerHTML = `<p>We respect your privacy. Your account information and purchase history are encrypted and will never be shared with third parties.</p>`;
                } else if(linkText.includes('Terms')) {
                    infoContent.innerHTML = `<p>By purchasing prompts on ProAIPrompts, you gain full commercial rights to use the generated outputs for personal and client projects.</p>`;
                } else if(linkText.includes('Contact')) {
                    infoContent.innerHTML = `<p>Need help with your prompt order? Reach out to our 24/7 AI Engineering Support Team at <strong>support@proaiprompts.com</strong></p>`;
                } else {
                    infoContent.innerHTML = `<p>Welcome to ProAIPrompts — The Premier AI Prompt Marketplace designed for high-performing creators and developers.</p>`;
                }
                
                if(infoModal) infoModal.classList.add('active');
            }
        });
    });

    // --------------------------------------------------------------------------
    // 9. WISHLIST TOGGLE & FAQ ACCORDION
    // --------------------------------------------------------------------------
    function attachWishlistEvents() {
        const wishlistBtns = document.querySelectorAll('.wishlist-btn');
        wishlistBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.textContent === '🤍') {
                    btn.textContent = '❤️';
                } else {
                    btn.textContent = '🤍';
                }
            });
        });
    }

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

});