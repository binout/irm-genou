// Simple client-side authentication for GitHub Pages
class SimpleAuth {
    constructor() {
        this.isAuthenticated = false;
        this.password = 'medical2024'; // Change this password
        this.checkAuth();
    }

    checkAuth() {
        const stored = sessionStorage.getItem('medical_auth');
        if (stored === this.password) {
            this.isAuthenticated = true;
            this.showContent();
        } else {
            this.showLoginPrompt();
        }
    }

    showLoginPrompt() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        overlay.innerHTML = `
            <div style="background: #2a2a2a; padding: 2rem; border-radius: 8px; text-align: center; color: white;">
                <h2 style="color: #4a90e2; margin-bottom: 1rem;">🏥 Accès Médical Sécurisé</h2>
                <p style="margin-bottom: 1rem; color: #b0b0b0;">Entrez le mot de passe pour accéder aux données médicales</p>
                <input type="password" id="auth-password" 
                       style="padding: 0.5rem; margin: 0.5rem; border-radius: 4px; border: 1px solid #555; background: #333; color: white; width: 200px;"
                       placeholder="Mot de passe">
                <br>
                <button id="auth-submit" 
                        style="background: #4a90e2; color: white; border: none; padding: 0.5rem 1rem; margin-top: 0.5rem; border-radius: 4px; cursor: pointer;">
                    Accéder
                </button>
                <div id="auth-error" style="color: #ff4444; margin-top: 0.5rem; display: none;">
                    Mot de passe incorrect
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('auth-submit').addEventListener('click', () => {
            this.validatePassword();
        });

        document.getElementById('auth-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validatePassword();
            }
        });

        // Focus on password input
        setTimeout(() => {
            document.getElementById('auth-password').focus();
        }, 100);
    }

    validatePassword() {
        const input = document.getElementById('auth-password').value;
        if (input === this.password) {
            sessionStorage.setItem('medical_auth', this.password);
            this.isAuthenticated = true;
            document.querySelector('div[style*="position: fixed"]').remove();
            this.showContent();
        } else {
            document.getElementById('auth-error').style.display = 'block';
            document.getElementById('auth-password').value = '';
            document.getElementById('auth-password').focus();
        }
    }

    showContent() {
        // Show the main content
        document.body.style.visibility = 'visible';
        
        // Initialize the main application after authentication
        setTimeout(() => {
            if (window.MedicalImageViewer) {
                new MedicalImageViewer();
            }
        }, 100);
    }
}

// Initialize authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Hide content initially, but preserve the structure
    const mainContent = document.querySelector('body');
    mainContent.style.visibility = 'hidden';
    
    // Create auth instance
    const auth = new SimpleAuth();
    
    // Store reference for later use
    window.authInstance = auth;
});