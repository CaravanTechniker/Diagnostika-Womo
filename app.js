// Hlavný aplikačný súbor

const MANUALS_DATA = {
    truma: { name: 'Truma', items: [] },
    alde: { name: 'Alde', items: [] },
    alphatronics: { name: 'Alphatronics', items: [] },
    schaudt: { name: 'Schaudt', items: [] },
    nordelettronica: { name: 'Nordelettronica', items: [] },
    cbe: { name: 'CBE', items: [] }
};

let adminPressTimer = null;
let adminLongPressTriggered = false;

// Admin funkcie - SKRYTÉ V SEARCH POLI (3 sekundy)
function setupHiddenAdminTrigger() {
    const trigger = document.getElementById('adminTrigger');
    if (!trigger) return;

    const startPress = () => {
        if (isEditMode || isAdminLoggedIn) return;
        adminLongPressTriggered = false;

        if (adminPressTimer) clearTimeout(adminPressTimer);
        adminPressTimer = setTimeout(() => {
            adminLongPressTriggered = true;
            openPasswordModal();
        }, 3000); // 3 SEKUNDY podržanie
    };

    const endPress = () => {
        if (adminPressTimer) {
            clearTimeout(adminPressTimer);
            adminPressTimer = null;
        }
    };

    // Podpora pre touch aj mouse
    trigger.addEventListener('touchstart', startPress, { passive: true });
    trigger.addEventListener('touchend', endPress);
    trigger.addEventListener('touchcancel', endPress);
    trigger.addEventListener('mousedown', startPress);
    trigger.addEventListener('mouseup', endPress);
    trigger.addEventListener('mouseleave', endPress);
}

function toggleAdmin() {
    if (isAdminLoggedIn) {
        openAdminModal();
    } else {
        openPasswordModal();
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    sessionStorage.removeItem('adminSession');
    document.getElementById('appContainer').classList.remove('admin-mode');
    updateAdminStatus();
    closeAdminModal();
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const container = document.getElementById('appContainer');
    if (isEditMode) {
        container.classList.add('admin-mode');
        showNotification('Režim úprav zapnutý');
    } else {
        container.classList.remove('admin-mode');
    }
    closeAdminModal();
}

// Password funkcie
function openPasswordModal() {
    document.getElementById('passwordModal').classList.add('active');
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
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
        updateAdminStatus();
        closePasswordModal();
        openAdminModal();
        showNotification('Prihlásený ako admin');
    } else {
        showNotification('Nesprávne heslo!', 'error');
        document.getElementById('adminPassword').value = '';
    }
}

function openAdminModal() {
    document.getElementById('adminModal').classList.add('active');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
}

// Notifikácia
function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
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
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Kontakt funkcie
function openContactModal() {
    const lang = appData.currentLang;
    const ct = CONTACT_TRANSLATIONS[lang] || CONTACT_TRANSLATIONS.de;
    
    document.getElementById('contactWarningTitle').textContent = ct.warningTitle;
    document.getElementById('contactWarningSubtext').textContent = ct.warningSubtext;
    document.getElementById('contactNotice').innerHTML = `<strong>⚠️</strong> ${ct.notice}`;
    document.getElementById('closeContactBtn').textContent = ct.closeBtn;
    
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

// Jazykové funkcie - OPRAVENÉ
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
    
    // Aktualizácia vlajky
    const flagImg = document.getElementById('currentFlag');
    const langSpan = document.getElementById('currentLang');
    if (flagImg) flagImg.src = CONFIG.FLAG_URLS[code];
    if (langSpan) langSpan.textContent = appData.languages[code].code;
    
    // Aktualizácia textov
    updateLanguage();
    
    // Re-render kategórií
    if (typeof renderCategories === 'function') {
        renderCategories();
    }
    
    // Re-render aktuálnej sekcie
    if (currentCategory && typeof showDiagnoses === 'function') {
        showDiagnoses(currentCategory);
    } else if (typeof showCategories === 'function') {
        showCategories();
    }
    
    saveDataToStorage();
    closeLangModal();
    showNotification(`Jazyk zmenený na ${appData.languages[code].name}`);
}

// Manuály
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

// Foto funkcie
function handleHeaderIconClick() {
    if (adminLongPressTriggered) {
        adminLongPressTriggered = false;
        return;
    }
}

function handleContactPhotoClick() {
    if (isEditMode || isAdminLoggedIn) {
        document.getElementById('currentPhotoTarget').value = 'contact';
        document.getElementById('photoModal').classList.add('active');
    }
}

function editCategoryPhoto(catId) {
    if (!isEditMode && !isAdminLoggedIn) return;
    if (event) event.stopPropagation();
    document.getElementById('currentPhotoTarget').value = 'category:' + catId;
    document.getElementById('photoModal').classList.add('active');
}

function closePhotoModal() {
    document.getElementById('photoModal').classList.remove('active');
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const target = document.getElementById('currentPhotoTarget').value;
        if (target === 'contact') {
            appData.contactPhoto = e.target.result;
            document.getElementById('contactBtnImg').src = e.target.result;
            document.getElementById('contactBtnImg').classList.remove('hidden');
            document.getElementById('contactBtnText').classList.add('hidden');
            document.getElementById('contactModalImg').src = e.target.result;
            document.getElementById('contactModalImg').classList.remove('hidden');
            document.getElementById('contactModalText').classList.add('hidden');
        } else if (target.startsWith('category:')) {
            const catId = target.split(':')[1];
            const cat = appData.categories.find(c => c.id === catId);
            if (cat) {
                cat.iconPhoto = e.target.result;
                if (typeof renderCategories === 'function') renderCategories();
            }
        }
        saveDataToStorage();
        closePhotoModal();
        showNotification('Fotka uložená');
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    const target = document.getElementById('currentPhotoTarget').value;
    if (target === 'contact') {
        appData.contactPhoto = null;
        document.getElementById('contactBtnImg').classList.add('hidden');
        document.getElementById('contactBtnText').classList.remove('hidden');
        document.getElementById('contactModalImg').classList.add('hidden');
        document.getElementById('contactModalText').classList.remove('hidden');
    } else if (target.startsWith('category:')) {
        const catId = target.split(':')[1];
        const cat = appData.categories.find(c => c.id === catId);
        if (cat) {
            cat.iconPhoto = null;
            if (typeof renderCategories === 'function') renderCategories();
        }
    }
    saveDataToStorage();
    closePhotoModal();
    showNotification('Fotka odstránená');
}

// Inicializácia
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupHiddenAdminTrigger();
});
