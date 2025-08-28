(function() {
    'use strict';
    
    const _0x1a2b = atob('NWp1aW4yMDI1');
    const _0x3c4d = 'medical_viewer_auth';
    
    function _0x5e6f() {
        const _0x7g8h = sessionStorage.getItem(_0x3c4d);
        return _0x7g8h === _0x1a2b;
    }
    
    function _0x9i0j() {
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: #2a2a2a;
                padding: 3rem;
                border-radius: 12px;
                text-align: center;
                color: white;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 2px solid #4a90e2;
                max-width: 400px;
                width: 90%;
            ">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🏥</div>
                <h2 style="color: #4a90e2; margin-bottom: 1rem; font-size: 1.5rem;">
                    Accès Médical Sécurisé
                </h2>
                <p style="margin-bottom: 2rem; color: #b0b0b0; line-height: 1.4;">
                    Cette interface contient des données médicales sensibles.<br>
                    Veuillez entrer le mot de passe d'accès.
                </p>
                <input 
                    type="password" 
                    id="auth-input"
                    placeholder="Mot de passe"
                    style="
                        width: 100%;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border: 2px solid #555;
                        border-radius: 6px;
                        background: #333;
                        color: white;
                        font-size: 1rem;
                        outline: none;
                    "
                >
                <button 
                    id="auth-submit"
                    style="
                        width: 100%;
                        padding: 1rem;
                        background: #4a90e2;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    "
                    onmouseover="this.style.background='#357abd'"
                    onmouseout="this.style.background='#4a90e2'"
                >
                    Accéder à l'interface médicale
                </button>
                <div id="auth-error" style="
                    color: #ff6b6b;
                    margin-top: 1rem;
                    display: none;
                    font-size: 0.9rem;
                ">
                    ❌ Mot de passe incorrect
                </div>
                <div style="
                    margin-top: 2rem;
                    font-size: 0.8rem;
                    color: #666;
                ">
                    🔒 Données médicales protégées • Interface sécurisée
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add event listeners
        const input = document.getElementById('auth-input');
        const button = document.getElementById('auth-submit');
        const error = document.getElementById('auth-error');
        
        function _0xklmn() {
            const _0xopqr = input.value;
            if (_0xopqr === _0x1a2b) {
                sessionStorage.setItem(_0x3c4d, _0xopqr);
                overlay.remove();
            } else {
                error.style.display = 'block';
                input.value = '';
                input.style.borderColor = '#ff6b6b';
                setTimeout(() => {
                    input.style.borderColor = '#555';
                    error.style.display = 'none';
                }, 3000);
            }
        }
        
        button.addEventListener('click', _0xklmn);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') _0xklmn();
        });
        
        
        setTimeout(() => input.focus(), 100);
    }
    
    
    function _0xstu() {
        if (!_0x5e6f()) {
            _0x9i0j();
        }
    }
    
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _0xstu);
    } else {
        _0xstu();
    }
})();