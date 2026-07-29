document.addEventListener('DOMContentLoaded', () => {
    
    // --------------------------------------------------------------------------
    // 1. REAL-TIME SEARCH FILTER FOR PROMPT CARDS
    // --------------------------------------------------------------------------
    const searchInput = document.getElementById('searchInput');
    const promptCards = document.querySelectorAll('.prompt-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            promptCards.forEach(card => {
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
    // 2. WISHLIST TOGGLE (🤍 -> ❤️)
    // --------------------------------------------------------------------------
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

    // --------------------------------------------------------------------------
    // 3. FAQ ACCORDION TOGGLE
    // --------------------------------------------------------------------------
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        question.style.cursor = 'pointer';
        
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    // --------------------------------------------------------------------------
    // 4. SMOOTH SCROLLING FOR NAVBAR LINKS
    // --------------------------------------------------------------------------
    const navLinks = document.querySelectorAll('.nav-links a, .hero-cta-buttons a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    console.log("ProAIPrompts V2: All Interactive Logic Ready!");
});