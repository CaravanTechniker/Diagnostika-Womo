// Hlavný aplikačný súbor

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
    const ct = CONTACT_TRANSLATIONS[lang];
    
    document.getElementById('contactWarningTitle').textContent = ct.warningTitle;
    document.getElementById('contactWarningSubtext').textContent = ct.warningSubtext;
    document.querySelector('.sms-action span:last-child').textContent = ct.smsText;
    document.getElementById('contactNotice').innerHTML = `<strong>⚠️ ${ct.notice.split(':')[0]}:</strong> ${ct.notice.split(':')[1] || ct.notice}`;
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
    renderCategories();
    if (currentCategory) {
        showDiagnoses(currentCategory);
    }
    if (currentDiagnosis) renderWizard();
    saveDataToStorage();
    closeLangModal();
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
                renderCategories();
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
            renderCategories();
        }
    }
    saveDataToStorage();
    closePhotoModal();
}

// Inicializácia
document.addEventListener('DOMContentLoaded', init);