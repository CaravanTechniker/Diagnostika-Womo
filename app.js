// Hlavný aplikačný súbor - Fixed Version 5.5

let currentPhotoData = null;
let currentPhotoTargetType = null;
let currentPhotoTargetId = null;
let isAdminLoggedIn = false;
let isEditMode = false;
let currentCategory = null;

function updateLanguage() {
    const lang = appData.currentLang || 'sk';
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['sk'];
    
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (t[key]) el.textContent = t[key];
    });
    
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
    
    if (t.appTitle) document.title = t.appTitle;
}

function toggleAdmin() {
    if (isAdminLoggedIn) {
        const panel = document.getElementById('adminPanel');
        if (panel) panel.classList.toggle('hidden');
        updateAdminButton();
    } else {
        openPasswordModal();
    }
}

function updateAdminButton() {
    const btn = document.getElementById('adminBtn');
    const panel = document.getElementById('adminPanel');
    if (!btn) return;

    if (isAdminLoggedIn && panel && !panel.classList.contains('hidden')) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}

function openPasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.classList.add('active');
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            passwordInput.value = '';
            setTimeout(() => passwordInput.focus(), 100);
        }
    }
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) modal.classList.remove('active');
}

function checkPassword() {
    const input = document.getElementById('adminPassword');
    if (!input) return;
    
    const password = input.value;
    if (password === CONFIG.ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminSession', 'true');
        
        const appContainer = document.getElementById('appContainer');
        if (appContainer) appContainer.classList.add('admin-mode');

        closePasswordModal();
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.classList.remove('hidden');
        updateAdminButton();
        updateAdminStatus();
        showNotification('Prihlásený ako admin');
    } else {
        showNotification('Nesprávne heslo!', 'error');
        input.value = '';
        input.focus();
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    isEditMode = false;
    sessionStorage.removeItem('adminSession');
    
    const appContainer = document.getElementById('appContainer');
    if (appContainer) appContainer.classList.remove('admin-mode');
    
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.classList.add('hidden');
    
    updateAdminButton();
    updateAdminStatus();
    showNotification('Odhlásený');
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const container = document.getElementById('appContainer');
    
    if (isEditMode) {
        if (container) container.classList.add('admin-mode');
        showNotification('Edit mód zapnutý');
    } else {
        if (container) container.classList.remove('admin-mode');
        showNotification('Edit mód vypnutý');
    }
}

function openPhotoManager() {
    toggleEditMode();
    closeAdminModal();
}

function clearAllData() {
    if (!confirm('Naozaj chcete vymazať všetky dáta? Táto akcia je nevratná!')) return;
    if (!confirm('Ste si istí? Všetky stromy, chybové kódy a fotky budú vymazané.')) return;
    
    const savedLang = localStorage.getItem('currentLanguage');
    appData = JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
    
    if (savedLang && appData.languages[savedLang]) {
        appData.currentLang = savedLang;
    }
    
    saveDataToStorage();
    
    if (typeof renderCategories === 'function') renderCategories();
    updateLogoDisplay();
    updateContactDisplay();
    showCategories();
    showNotification('Všetky dáta boli vymazané');
}

function openPhotoEditor(type, id = null) {
    if (!isAdminLoggedIn && !isEditMode) return;
    
    currentPhotoTargetType = type;
    currentPhotoTargetId = id;
    currentPhotoData = null;

    let currentPhoto = null;
    if (type === 'logo') {
        currentPhoto = appData.logoPhoto;
    } else if (type === 'contact') {
        currentPhoto = appData.contactPhoto;
    } else if (type === 'category') {
        const cat = appData.categories.find(c => c.id === id);
        currentPhoto = cat ? cat.iconPhoto : null;
    }

    const preview = document.getElementById('photoPreview');
    const placeholder = document.getElementById('photoPlaceholder');

    if (preview && placeholder) {
        if (currentPhoto) {
            preview.src = currentPhoto;
            preview.classList.add('active');
            placeholder.classList.add('hidden');
            currentPhotoData = currentPhoto;
        } else {
            preview.classList.remove('active');
            placeholder.classList.remove('hidden');
            preview.src = '';
        }
    }

    const saveBtn = document.getElementById('savePhotoBtn');
    if (saveBtn) saveBtn.disabled = !currentPhotoData;
    
    const modal = document.getElementById('photoEditorModal');
    if (modal) modal.classList.add('active');
}

function closePhotoEditor() {
    const modal = document.getElementById('photoEditorModal');
    if (modal) modal.classList.remove('active');
    currentPhotoData = null;
    currentPhotoTargetType = null;
    currentPhotoTargetId = null;
}

function handlePhotoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Súbor je príliš veľký (max 5MB)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        currentPhotoData = e.target.result;
        const preview = document.getElementById('photoPreview');
        const placeholder = document.getElementById('photoPlaceholder');

        if (preview && placeholder) {
            preview.src = currentPhotoData;
            preview.classList.add('active');
            placeholder.classList.add('hidden');
        }

        const saveBtn = document.getElementById('savePhotoBtn');
        if (saveBtn) saveBtn.disabled = false;
    };
    
    reader.onerror = function() {
        showNotification('Chyba pri načítaní súboru', 'error');
    };
    
    reader.readAsDataURL(file);
}

function removeCurrentPhoto() {
    currentPhotoData = null;
    const preview = document.getElementById('photoPreview');
    const placeholder = document.getElementById('photoPlaceholder');

    if (preview && placeholder) {
        preview.classList.remove('active');
        placeholder.classList.remove('hidden');
        preview.src = '';
    }

    const saveBtn = document.getElementById('savePhotoBtn');
    if (saveBtn) saveBtn.disabled = true;
}

function savePhoto() {
    if (!currentPhotoData) {
        showNotification('Najprv vyberte fotku', 'error');
        return;
    }

    if (currentPhotoTargetType === 'logo') {
        appData.logoPhoto = currentPhotoData;
        updateLogoDisplay();
    } else if (currentPhotoTargetType === 'contact') {
        appData.contactPhoto = currentPhotoData;
        updateContactDisplay();
    } else if (currentPhotoTargetType === 'category') {
        const cat = appData.categories.find(c => c.id === currentPhotoTargetId);
        if (cat) {
            cat.iconPhoto = currentPhotoData;
            if (typeof renderCategories === 'function') renderCategories();
        }
    }

    saveDataToStorage();
    closePhotoEditor();
    showNotification('Fotka uložená');
}

function editCategoryPhoto(catId) {
    if (!isAdminLoggedIn && !isEditMode) return;
    if (event) event.stopPropagation();
    openPhotoEditor('category', catId);
}

function updateLogoDisplay() {
    const logoIcon = document.getElementById('logoIcon');
    if (!logoIcon) return;
    
    if (appData.logoPhoto) {
        logoIcon.innerHTML = `<img src="${appData.logoPhoto}" style="width:100%;height:100%;object-fit:cover;"><span class="edit-badge">✏️</span>`;
    } else {
        logoIcon.innerHTML = `🔧<span class="edit-badge">✏️</span>`;
    }
}

function updateContactDisplay() {
    const contactModalImg = document.getElementById('contactModalImg');
    const contactModalText = document.getElementById('contactModalText');

    if (appData.contactPhoto) {
        if (contactModalImg) {
            contactModalImg.src = appData.contactPhoto;
            contactModalImg.classList.remove('hidden');
        }
        if (contactModalText) contactModalText.classList.add('hidden');
    } else {
        if (contactModalImg) contactModalImg.classList.add('hidden');
        if (contactModalText) contactModalText.classList.remove('hidden');
    }
}

function openContactModal() {
    const lang = appData.currentLang;
    const ct = CONTACT_TRANSLATIONS[lang] || CONTACT_TRANSLATIONS.de;

    const warningTitle = document.getElementById('contactWarningTitle');
    const warningSubtext = document.getElementById('contactWarningSubtext');
    const contactNotice = document.getElementById('contactNotice');
    const closeContactBtn = document.getElementById('closeContactBtn');

    if (warningTitle) warningTitle.textContent = ct.warningTitle;
    if (warningSubtext) warningSubtext.textContent = ct.warningSubtext;
    if (contactNotice) contactNotice.innerHTML = `<strong>⚠️</strong> ${ct.notice}`;
    if (closeContactBtn) closeContactBtn.textContent = ct.closeBtn;

    updateContactDisplay();
    
    const modal = document.getElementById('contactModal');
    if (modal) modal.classList.add('active');
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.classList.remove('active');
}

function openWhatsApp() {
    if (CONFIG.CONTACT && CONFIG.CONTACT.whatsapp) {
        window.open('https://wa.me/' + CONFIG.CONTACT.whatsapp, '_blank');
    }
}

function openSMS() {
    if (CONFIG.CONTACT && CONFIG.CONTACT.phone) {
        window.open('sms:' + CONFIG.CONTACT.phone, '_blank');
    }
}

function openFeedback() {
    if (CONFIG.CONTACT && CONFIG.CONTACT.email) {
        window.location.href = 'mailto:' + CONFIG.CONTACT.email + '?subject=Spatna vazba';
    }
}

function openLangModal() {
    const modal = document.getElementById('langModal');
    const options = document.getElementById('langOptions');
    
    if (!modal || !options) return;

    options.innerHTML = Object.entries(appData.languages).map(([code, lang]) => `
        <div class="lang-option ${code === appData.currentLang ? 'selected' : ''}" onclick="setLanguage('${code}')">
            <img src="${CONFIG.FLAG_URLS[code]}" alt="${lang.code}" class="lang-flag">
            <div class="lang-info">
                <div class="lang-name">${lang.name}</div>
                <div class="lang-code">${lang.code}</div>
            </div>
        </div>
    `).join('');

    modal.classList.add('active');
}

function closeLangModal() {
    const modal = document.getElementById('langModal');
    if (modal) modal.classList.remove('active');
}

function setLanguage(code) {
    if (!appData.languages[code]) return;
    
    appData.currentLang = code;

    const flagImg = document.getElementById('currentFlag');
    const langSpan = document.getElementById('currentLang');
    
    if (flagImg) flagImg.src = CONFIG.FLAG_URLS[code];
    if (langSpan) langSpan.textContent = appData.languages[code].code;

    updateLanguage();

    if (typeof renderCategories === 'function') renderCategories();
    
    if (currentCategory && typeof showDiagnoses === 'function') {
        showDiagnoses(currentCategory);
    } else if (typeof showCategories === 'function') {
        showCategories();
    }

    localStorage.setItem('currentLanguage', code);
    saveDataToStorage();
    closeLangModal();
    showNotification(`Jazyk: ${appData.languages[code].name}`);
}

function openManualsModal() {
    const modal = document.getElementById('langModal');
    const options = document.getElementById('langOptions');
    
    if (!modal || !options) return;

    options.innerHTML = Object.entries(MANUALS_DATA).map(([key, section]) => `
        <div class="lang-option" onclick="openManualSection('${key}')">
            <div class="lang-info">
                <div class="lang-name">${section.name}</div>
                <div class="lang-code">${section.items.length} PDF</div>
            </div>
        </div>
    `).join('');

    modal.classList.add('active');
}

function openManualSection(sectionKey) {
    const options = document.getElementById('langOptions');
    const section = MANUALS_DATA[sectionKey];
    
    if (!options || !section) return;

    if (!section.items.length) {
        options.innerHTML = `
            <div class="lang-option selected" onclick="openManualsModal()">
                <div class="lang-info">
                    <div class="lang-name">${section.name}</div>
                    <div class="lang-code">Zatiaľ bez PDF súborov</div>
                </div>
            </div>
            <button class="btn-secondary" onclick="openManualsModal()" style="margin: 10px 20px;">Späť</button>
        `;
        return;
    }

    options.innerHTML = `
        ${section.items.map(item => `
            <div class="lang-option" onclick="window.open('${item.url}', '_blank')">
                <div class="lang-info">
                    <div class="lang-name">${item.title}</div>
                    <div class="lang-code">PDF</div>
                </div>
            </div>
        `).join('')}
        <button class="btn-secondary" onclick="openManualsModal()" style="margin: 10px 20px;">Späť</button>
    `;
}

function showNotification(message, type = 'success') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    
    const bgColor = type === 'error' ? '#ef4444' : 
                    type === 'warning' ? '#f59e0b' : 
                    '#10b981';
    
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 700;
        z-index: 9999;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease;
        font-size: 15px;
        max-width: 90%;
        text-align: center;
        word-wrap: break-word;
    `;
    
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(-50%) translateY(-20px)';
        notif.style.transition = 'all 0.3s';
        setTimeout(() => {
            if (notif.parentNode) notif.remove();
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('currentLanguage');
    if (savedLang && appData.languages[savedLang]) {
        appData.currentLang = savedLang;
    }
    
    const flagImg = document.getElementById('currentFlag');
    const langSpan = document.getElementById('currentLang');
    
    if (flagImg) flagImg.src = CONFIG.FLAG_URLS[appData.currentLang];
    if (langSpan) langSpan.textContent = appData.languages[appData.currentLang].code;
    
    updateLanguage();
    
    if (typeof init === 'function') init();
    
    updateLogoDisplay();

    const adminSession = sessionStorage.getItem('adminSession');
    if (adminSession === 'true') {
        isAdminLoggedIn = true;
        const appContainer = document.getElementById('appContainer');
        if (appContainer) appContainer.classList.add('admin-mode');
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.classList.remove('hidden');
        updateAdminButton();
        updateAdminStatus();
    }
    
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }
});
