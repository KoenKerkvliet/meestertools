/* ============================================
   MEESTERTOOLS - JavaScript
   Versie: v0.0.1
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Dynamic Footer Year ----------
    const footerYear = document.getElementById('footerYear');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    // ---------- Login Form (Supabase Auth) ----------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // If user is already logged in, redirect to dashboard
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                window.location.href = 'dashboard.html';
            }
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const errorEl = document.getElementById('loginError');

            loginBtn.disabled = true;
            loginBtn.textContent = 'Bezig met inloggen...';
            errorEl.style.display = 'none';

            const { error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                errorEl.textContent = 'Inloggen mislukt. Controleer je e-mail en wachtwoord.';
                errorEl.style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.textContent = 'Inloggen';
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }

    // ---------- Register Form (Supabase Auth) ----------
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const registerBtn = document.getElementById('registerBtn');
            const errorEl = document.getElementById('registerError');
            const successEl = document.getElementById('registerSuccess');

            registerBtn.disabled = true;
            registerBtn.textContent = 'Account aanmaken...';
            errorEl.style.display = 'none';
            successEl.style.display = 'none';

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });

            if (error) {
                errorEl.textContent = 'Registratie mislukt: ' + error.message;
                errorEl.style.display = 'block';
                registerBtn.disabled = false;
                registerBtn.textContent = 'Account aanmaken';
            } else {
                successEl.textContent = 'Account aangemaakt! Controleer je e-mail om je account te bevestigen.';
                successEl.style.display = 'block';
                registerForm.reset();
                registerBtn.disabled = false;
                registerBtn.textContent = 'Account aanmaken';
            }
        });
    }

    // ---------- Auth Guard (dashboard & tool pages) ----------
    const isDashboard = document.querySelector('.dashboard-content');
    const isToolPage = document.querySelector('.tool-page-content');

    if (isDashboard || isToolPage) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // Determine correct path to index
                const isInSubfolder = window.location.pathname.includes('/pages/');
                window.location.href = isInSubfolder ? '../index.html' : 'index.html';
                return;
            }
            // Set profile info
            setProfileInfo(session.user);
        });
    }

    // ---------- Set Profile Info ----------
    function setProfileInfo(user) {
        const profileBtn = document.getElementById('profileBtn');
        const nameEl = document.querySelector('.dropdown-header .name');
        const emailEl = document.querySelector('.dropdown-header .email');

        if (user) {
            const fullName = user.user_metadata?.full_name || user.email;
            const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

            if (profileBtn) profileBtn.textContent = initials;
            if (nameEl) nameEl.textContent = fullName;
            if (emailEl) emailEl.textContent = user.email;
        }
    }

    // ---------- Profile Dropdown ----------
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && e.target !== profileBtn) {
                profileDropdown.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // ---------- Logout ----------
    const logoutBtn = document.querySelector('.dropdown-item.logout');
    if (logoutBtn) {
        logoutBtn.setAttribute('onclick', '');
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            const isInSubfolder = window.location.pathname.includes('/pages/');
            window.location.href = isInSubfolder ? '../index.html' : 'index.html';
        });
    }

    // ---------- Card hover animation ----------
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-6px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

});
