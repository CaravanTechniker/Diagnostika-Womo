// Hlavný aplikačný súbor

// ===== GLOBÁLNE PREMENNÉ =====
let currentPhotoData = null;
let currentPhotoTargetType = null;
let currentPhotoTargetId = null;
let isAdminLoggedIn = false;
let isEditMode = false;
let currentCategory = null;

// ===== JAZYKOVÉ FUNKCIE =====
function updateLanguage() {
    const lang = appData.currentLang || 'sk';
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['sk'];

    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });

    const categoriesTitle = document.querySelector('#categoriesView [data-translate="categories"]');
    if (categoriesTitle) categoriesTitle.textContent = t.categories || 'Kategórie';

    const wizardPathTitle = document.querySelector('#pathHistory [data-translate="currentPath"]');
    if (wizardPathTitle) wizardPathTitle.textContent = t.currentPath || 'CESTA';

    const currentVisibleView = {
        categories: !document.getElementById('categoriesView')?.classList.contains('hidden'),
        electric: !document.getElementById('electricView')?.classList.contains('hidden'),
        diagnoses: !document.getElementById('diagnosesView')?.classList.contains('hidden'),
        wizard: !document.getElementById('wizardView')?.classList.contains('hidden'),
        errors: !document.getElementById('errorCodesView')?.classList.contains('hidden')
    };

    if (t.appTitle) {
        document.title = t.appTitle;
    }

    if (currentVisibleView.categories && typeof renderCategories === 'function') renderCategories();
    if (currentVisibleView.electric && typeof showElectricSubcategories === 'function') showElectricSubcategories();
    if (currentVisibleView.diagnoses && currentCategory && typeof showDiagnoses === 'function') showDiagnoses(currentCategory);
    if (currentVisibleView.errors && typeof showErrorCodesSection === 'function') showErrorCodesSection();
    if (currentVisibleView.wizard && typeof renderWizard === 'function' && currentDiagnosis) renderWizard();
}


// ===== ADMIN FUNKCIE =====
function toggleAdmin() {
    if (isAdminLoggedIn) {
        const panel = document.getElementById('adminPanel');
        panel.classList.toggle('hidden');
        updateAdminButton();
    } else {
        openPasswordModal();
    }
}

function updateAdminButton() {
    const btn = document.getElementById('adminBtn');
    const panel = document.getElementById('adminPanel');

    if (isAdminLoggedIn && !panel.classList.contains('hidden')) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}

function openPasswordModal() {
    document.getElementById('passwordModal').classList.add('active');
    document.getElementById('adminPassword').value = '';
    setTimeout(() => document.getElementById('adminPassword').focus(), 100);
}

function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('active');
}

function checkPassword() {
    const input = document.getElementById('adminPassword').value;
    if (input === CONFIG.ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminSession', 'true');
        document.getElementById('appContainer').classList.add('admin-mode');

        closePasswordModal();
        document.getElementById('adminPanel').classList.remove('hidden');
        updateAdminButton();
        updateAdminStatus();
        showNotification('Prihlásený ako admin');
    } else {
        showNotification('Nesprávne heslo!', 'error');
        document.getElementById('adminPassword').value = '';
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    sessionStorage.removeItem('adminSession');
    document.getElementById('appContainer').classList.remove('admin-mode');
    document.getElementById('adminPanel').classList.add('hidden');
    updateAdminButton();
    updateAdminStatus();
    showNotification('Odhlásený');
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const container = document.getElementById('appContainer');
    if (isEditMode) {
        container.classList.add('admin-mode');
        showNotification('Edit mód zapnutý');
    } else {
        container.classList.remove('admin-mode');
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
    
    appData = JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
    
    const savedLang = localStorage.getItem('currentLanguage');
    if (savedLang && appData.languages[savedLang]) {
        appData.currentLang = savedLang;
    }
    
    saveDataToStorage();
    
    renderCategories();
    updateLogoDisplay();
    updateContactDisplay();
    showCategories();
    
    showNotification('Všetky dáta boli vymazané');
}

// ===== FOTO EDITOR =====
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

    document.getElementById('savePhotoBtn').disabled = !currentPhotoData;
    document.getElementById('photoEditorModal').classList.add('active');
}

function closePhotoEditor() {
    document.getElementById('photoEditorModal').classList.remove('active');
    currentPhotoData = null;
    currentPhotoTargetType = null;
    currentPhotoTargetId = null;
}

function handlePhotoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        currentPhotoData = e.target.result;

        const preview = document.getElementById('photoPreview');
        const placeholder = document.getElementById('photoPlaceholder');

        preview.src = currentPhotoData;
        preview.classList.add('active');
        placeholder.classList.add('hidden');

        document.getElementById('savePhotoBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

function removeCurrentPhoto() {
    currentPhotoData = null;

    const preview = document.getElementById('photoPreview');
    const placeholder = document.getElementById('photoPlaceholder');

    preview.classList.remove('active');
    placeholder.classList.remove('hidden');
    preview.src = '';

    document.getElementById('savePhotoBtn').disabled = true;
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
        if (contactModalText) {
            contactModalText.classList.add('hidden');
        }
    } else {
        if (contactModalImg) {
            contactModalImg.classList.add('hidden');
        }
        if (contactModalText) {
            contactModalText.classList.remove('hidden');
        }
    }
}

// ===== KONTAKT =====
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
    document.getElementById('contactModal').classList.add('active');
}

function closeContactModal() {
    document.getElementById('contactModal').classList.remove('active');
}

function openWhatsApp() {
    window.open('https://wa.me/' + CONFIG.CONTACT.whatsapp, '_blank');
}

function openSMS() {
    window.open('sms:' + CONFIG.CONTACT.phone, '_blank');
}

function openFeedback() {
    window.location.href = 'mailto:' + CONFIG.CONTACT.email + '?subject=Spatna vazba';
}

// ===== JAZYKY =====
function openLangModal() {
    const modal = document.getElementById('langModal');
    const options = document.getElementById('langOptions');

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
    document.getElementById('langModal').classList.remove('active');
}

function setLanguage(code) {
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

    saveDataToStorage();
    closeLangModal();
    showNotification(`Jazyk: ${appData.languages[code].name}`);
}

// ===== MANUÁLY =====
function openManualsModal() {
    const modal = document.getElementById('langModal');
    const options = document.getElementById('langOptions');

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
    const modal = document.getElementById('langModal');
    const options = document.getElementById('langOptions');
    const section = MANUALS_DATA[sectionKey];

    if (!section) return;

    if (!section.items.length) {
        options.innerHTML = `
            <div class="lang-option selected" onclick="openManualsModal()">
                <div class="lang-info">
                    <div class="lang-name">${section.name}</div>
                    <div class="lang-code">Zatiaľ bez PDF súborov</div>
                </div>
            </div>
            <button class="btn-secondary" onclick="openManualsModal()">Späť</button>
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
        <button class="btn-secondary" onclick="openManualsModal()">Späť</button>
    `;
}

// ===== NOTIFIKÁCIA =====
function showNotification(message, type = 'success') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
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
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(-50%) translateY(-20px)';
        notif.style.transition = 'all 0.3s';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ===== INICIALIZÁCIA =====
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
    
    if (typeof init === 'function') {
        init();
    }
    
    updateLogoDisplay();

    const adminSession = sessionStorage.getItem('adminSession');
    if (adminSession === 'true') {
        isAdminLoggedIn = true;
        document.getElementById('appContainer').classList.add('admin-mode');
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.classList.remove('hidden');
        }
        updateAdminButton();
        updateAdminStatus();
    }
});
