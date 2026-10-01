document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    function setMenuOpen(open) {
        navLinks.classList.toggle('active', open);
        mobileMenuBtn.setAttribute('aria-expanded', open);
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        }
    }

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            setMenuOpen(!navLinks.classList.contains('active'));
        });

        // Escape closes the open menu and returns focus to its button
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                setMenuOpen(false);
                mobileMenuBtn.focus();
            }
        });
    }

    const navItems = document.querySelectorAll('.nav-links a');

    // Close mobile menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                setMenuOpen(false);
            }
        });
    });

    // Set active nav link based on scroll position
    const spyTargets = ['home', 'services', 'portfolio', 'contact']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    function updateActiveLink() {
        let current = '';
        spyTargets.forEach(target => {
            if (window.scrollY >= (target.offsetTop - 200)) {
                current = target.id;
            }
        });

        // The footer is too short to reach the threshold on tall screens,
        // so treat the bottom of the page as the contact section.
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom && document.getElementById('contact')) {
            current = 'contact';
        }

        navItems.forEach(item => {
            const isActive = item.getAttribute('href') === `#${current}`;
            item.classList.toggle('active', isActive);
            if (isActive) {
                item.setAttribute('aria-current', 'location');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            updateActiveLink();
            ticking = false;
        });
    }, { passive: true });

    // Also run once now, so a page opened at an anchor (e.g. #services)
    // highlights the right link before the user scrolls
    updateActiveLink();
});
