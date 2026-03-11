// Hlavný aplikačný súbor

// Základná príprava pre manuály
const MANUALS_DATA = {
    truma: {
        name: 'Truma',
        items: []
    },
    alde: {
        name: 'Alde',
        items: []
    },
    alphatronics: {
        name: 'Alphatronics',
        items: []
    },
    schaudt: {
        name: 'Schaudt',
        items: []
    },
    nordelettronica: {
        name: 'Nordelettronica',
        items: []
    },
    cbe: {
        name: 'CBE',
        items: []
    }
};

// Admin funkcie
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
        alert('Rezim uprav zapnuty');
    } else {
        container.classList.remove('admin-mode');
    }
    closeAdminModal();
}

// Password funkcie
function openPasswordModal() {
    document.getElementById('passwordModal').classList.add('active');
    document.getElementById('adminPassword').value = '';
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
    } else {
        alert('Nespravne heslo!');
        document.getElementById('adminPassword').value = '';
    }
}

function openAdminModal() {
    document.getElementById('adminModal').classList.add('active');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
}

// Kontakt funkcie
function openContactModal() {
    const lang = appData.currentLang;
    const ct = CONTACT_TRANSLATIONS[lang] || CONTACT_TRANSLATIONS.de;
    
    document.getElementById('contactWarningTitle').textContent = ct.warningTitle;
    document.getElementById('contactWarningSubtext').textContent = ct.warningSubtext;

    const smsLabel = document.querySelector('.sms-action span:last-child');
    if (smsLabel) smsLabel.textContent = ct.smsText;

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

// Jazykové funkcie
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
    updateFlagDisplay();
    updateLanguage();

    if (typeof renderCategories === 'function') {
        renderCategories();
    }

    if (currentCategory && typeof showDiagnoses === 'function') {
        showDiagnoses(currentCategory);
    }

    if (currentDiagnosis && typeof renderWizard === 'function') {
        renderWizard();
    }

    saveDataToStorage();
    closeLangModal();
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
                    <div class="lang-code">Zatial bez PDF suborov</div>
                </div>
            </div>
            <button class="btn-secondary" onclick="openManualsModal()">Spat</button>
        `;
        modal.classList.add('active');
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
        <button class="btn-secondary" onclick="openManualsModal()">Spat</button>
    `;

    modal.classList.add('active');
}

// Foto funkcie
function handleHeaderIconClick() {
    if (isEditMode || isAdminLoggedIn) {
        document.getElementById('currentPhotoTarget').value = 'header';
        document.getElementById('photoModal').classList.add('active');
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
    event.stopPropagation();
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
        if (target === 'header') {
            appData.headerPhoto = e.target.result;
            document.getElementById('headerIconImg').src = e.target.result;
            document.getElementById('headerIconImg').classList.remove('hidden');
            document.getElementById('headerIconText').classList.add('hidden');
        } else if (target === 'contact') {
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
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    const target = document.getElementById('currentPhotoTarget').value;
    if (target === 'header') {
        appData.headerPhoto = null;
        document.getElementById('headerIconImg').classList.add('hidden');
        document.getElementById('headerIconText').classList.remove('hidden');
    } else if (target === 'contact') {
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
}

// Inicializácia
document.addEventListener('DOMContentLoaded', init);
