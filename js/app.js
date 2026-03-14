/* ============================================
   MEESTERTOOLS - JavaScript
   Versie: v0.0.2
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Timeout Helper ----------
    function withTimeout(promise, ms) {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Verzoek duurde te lang. Controleer je internetverbinding.')), ms)
        );
        return Promise.race([promise, timeout]);
    }

    // ---------- Base Path Helper (handles nested subfolders) ----------
    function getBasePath() {
        const path = window.location.pathname;
        if (!path.includes('/pages/')) return '';
        const afterPages = path.split('/pages/')[1];
        const depth = (afterPages.match(/\//g) || []).length;
        return '../' + '../'.repeat(depth);
    }

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
                window.location.href = 'dashboard';
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

            try {
                console.log('Login gestart voor:', email);
                const { error } = await withTimeout(
                    supabase.auth.signInWithPassword({ email, password }),
                    15000
                );

                if (error) {
                    errorEl.textContent = 'Inloggen mislukt. Controleer je e-mail en wachtwoord.';
                    errorEl.style.display = 'block';
                } else {
                    window.location.href = 'dashboard';
                    return;
                }
            } catch (err) {
                console.error('Login fout:', err);
                errorEl.textContent = err.message || 'Er ging iets mis. Probeer het opnieuw.';
                errorEl.style.display = 'block';
            }

            loginBtn.disabled = false;
            loginBtn.textContent = 'Inloggen';
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

            try {
                console.log('Registratie gestart voor:', email);
                const { data, error } = await withTimeout(
                    supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { full_name: fullName }
                        }
                    }),
                    15000
                );
                console.log('Registratie response:', { data, error });

                if (error) {
                    errorEl.textContent = 'Registratie mislukt: ' + error.message;
                    errorEl.style.display = 'block';
                } else if (data?.user?.identities?.length === 0) {
                    errorEl.textContent = 'Er bestaat al een account met dit e-mailadres.';
                    errorEl.style.display = 'block';
                } else {
                    successEl.textContent = 'Account aangemaakt! Controleer je e-mail om je account te bevestigen.';
                    successEl.style.display = 'block';
                    registerForm.reset();
                }
            } catch (err) {
                console.error('Registratie fout:', err);
                errorEl.textContent = err.message || 'Er ging iets mis. Probeer het opnieuw.';
                errorEl.style.display = 'block';
            }

            registerBtn.disabled = false;
            registerBtn.textContent = 'Account aanmaken';
        });
    }

    // ---------- Auth Guard (dashboard, tool pages & admin) ----------
    const isDashboard = document.querySelector('.dashboard-content');
    const isToolPage = document.querySelector('.tool-page-content');
    const isAdminPage = document.querySelector('.admin-content');

    if (isDashboard || isToolPage || isAdminPage) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                window.location.href = getBasePath() + 'index';
                return;
            }
            // Set profile info and fetch role from database
            setProfileInfo(session.user);
        });
    }

    // ---------- Set Profile Info (with role from profiles table) ----------
    async function setProfileInfo(user) {
        const profileBtn = document.getElementById('profileBtn');
        const nameEl = document.querySelector('.dropdown-header .name');
        const emailEl = document.querySelector('.dropdown-header .email');

        if (!user) return;

        const fullName = user.user_metadata?.full_name || user.email;
        const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

        if (profileBtn) profileBtn.textContent = initials;
        if (nameEl) nameEl.textContent = fullName;
        if (emailEl) emailEl.textContent = user.email;

        // Fetch role from profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile) {
            // Store role globally for other scripts
            window.userRole = profile.role;

            // Dispatch event so admin.js and other scripts can react
            window.dispatchEvent(new CustomEvent('userRoleReady', { detail: { role: profile.role } }));

            // Add admin link if super_admin
            if (profile.role === 'super_admin') {
                addAdminLink();
            }

            // If admin page, verify super_admin access
            if (isAdminPage && profile.role !== 'super_admin') {
                window.location.href = getBasePath() + 'dashboard';
            }
        }
    }

    // ---------- Add Admin Link to Dropdown ----------
    function addAdminLink() {
        const dropdown = document.getElementById('profileDropdown');
        if (!dropdown) return;

        // Don't add if already exists
        if (dropdown.querySelector('.admin-link')) return;

        const logoutItem = dropdown.querySelector('.dropdown-item.logout');
        if (!logoutItem) return;

        const adminItem = document.createElement('div');
        adminItem.className = 'dropdown-item admin-link';

        const beheerPath = getBasePath() + 'beheer';

        adminItem.innerHTML = '&#128736;&#65039; Beheer';
        adminItem.addEventListener('click', () => {
            window.location.href = beheerPath;
        });

        // Insert before logout
        logoutItem.parentNode.insertBefore(adminItem, logoutItem);
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

    // ---------- Dropdown Items: Instellingen & Profiel ----------
    const dropdownItems = document.querySelectorAll('.profile-dropdown .dropdown-item');
    dropdownItems.forEach(item => {
        const text = item.textContent.trim();
        if (text.includes('Instellingen')) {
            item.setAttribute('onclick', '');
            item.addEventListener('click', (e) => {
                e.preventDefault();
                profileDropdown.classList.remove('active');
                if (typeof openInstellingen === 'function') openInstellingen('mijnklas');
            });
        }
        if (text.includes('Mijn profiel')) {
            item.setAttribute('onclick', '');
            item.addEventListener('click', (e) => {
                e.preventDefault();
                profileDropdown.classList.remove('active');
                if (typeof openInstellingen === 'function') openInstellingen('profiel');
            });
        }
    });

    // ---------- Logout ----------
    const logoutBtn = document.querySelector('.dropdown-item.logout');
    if (logoutBtn) {
        logoutBtn.setAttribute('onclick', '');
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = getBasePath() + 'index';
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
