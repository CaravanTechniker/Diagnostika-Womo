// ===== PREMIENNÉ =====
let isAdminLoggedIn = false;
let isEditMode = false;
let currentPhotoData = null;
let currentPhotoType = null;
let currentPhotoId = null;
let appData = {
    currentLang: 'de',
    logoPhoto: null,
    contactPhoto: null,
    categories: [
        { id: 'elektro', icon: '⚡', name: 'Elektrina', diagnoses: [] },
        { id: 'voda', icon: '💧', name: 'Voda', diagnoses: [] },
        { id: 'kurenie', icon: '🔥', name: 'Kúrenie', diagnoses: [] },
        { id: 'chladnicka', icon: '❄️', name: 'Chladnička', diagnoses: [] },
        { id: 'klimatizacia', icon: '🌡️', name: 'Klimatizácia', diagnoses: [] },
        { id: 'sattv', icon: '📡', name: 'SAT TV', diagnoses: [] },
        { id: 'panel', icon: '📟', name: 'Panely', diagnoses: [] },
        { id: 'ebl', icon: '⚡', name: 'EBL', diagnoses: [] }
    ],
    languages: {
        de: { name: 'Deutsch', code: 'DE', flag: 'https://flagcdn.com/w40/de.png' },
        sk: { name: 'Slovenčina', code: 'SK', flag: 'https://flagcdn.com/w40/sk.png' },
        en: { name: 'English', code: 'EN', flag: 'https://flagcdn.com/w40/gb.png' }
    }
};

// ===== ADMIN =====
function toggleAdmin() {
    if (isAdminLoggedIn) {
        const panel = document.getElementById('adminPanel');
        panel.classList.toggle('hidden');
        updateAdminBtn();
    } else {
        document.getElementById('passwordModal').classList.add('active');
        setTimeout(() => document.getElementById('adminPassword').focus(), 100);
    }
}

function updateAdminBtn() {
    const btn = document.getElementById('adminBtn');
    const panel = document.getElementById('adminPanel');
    btn.classList.toggle('active', isAdminLoggedIn && !panel.classList.contains('hidden'));
}

function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('active');
}

function checkPassword() {
    const input = document.getElementById('adminPassword').value;
    if (input === '1310') {
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminSession', 'true');
        document.getElementById('appContainer').classList.add('admin-mode');
        closePasswordModal();
        document.getElementById('adminPanel').classList.remove('hidden');
        updateAdminBtn();
        showNotification('Prihlásený ako admin');
    } else {
        showNotification('Nesprávne heslo!', 'error');
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    isEditMode = false;
    sessionStorage.removeItem('adminSession');
    document.getElementById('appContainer').classList.remove('admin-mode');
    document.getElementById('adminPanel').classList.add('hidden');
    updateAdminBtn();
    showNotification('Odhlásený');
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    document.getElementById('appContainer').classList.toggle('admin-mode', isEditMode);
    showNotification(isEditMode ? 'Edit mód zapnutý' : 'Edit mód vypnutý');
}

// ===== PHOTO EDITOR =====
function openPhotoEditor(type, id) {
    if (!isAdminLoggedIn && !isEditMode) return;
    
    currentPhotoType = type;
    currentPhotoId = id;
    currentPhotoData = null;
    
    let currentPhoto = null;
    if (type === 'logo') currentPhoto = appData.logoPhoto;
    else if (type === 'contact') currentPhoto = appData.contactPhoto;
    else if (type === 'category') {
        const cat = appData.categories.find(c => c.id === id);
        currentPhoto = cat?.iconPhoto;
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
    }
    
    document.getElementById('savePhotoBtn').disabled = !currentPhotoData;
    document.getElementById('photoEditorModal').classList.add('active');
}

function closePhotoEditor() {
    document.getElementById('photoEditorModal').classList.remove('active');
}

function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentPhotoData = e.target.result;
        document.getElementById('photoPreview').src = currentPhotoData;
        document.getElementById('photoPreview').classList.add('active');
        document.getElementById('photoPlaceholder').classList.add('hidden');
        document.getElementById('savePhotoBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

function removeCurrentPhoto() {
    currentPhotoData = null;
    document.getElementById('photoPreview').classList.remove('active');
    document.getElementById('photoPlaceholder').classList.remove('hidden');
    document.getElementById('savePhotoBtn').disabled = true;
}

function savePhoto() {
    if (!currentPhotoData) return;
    
    if (currentPhotoType === 'logo') {
        appData.logoPhoto = currentPhotoData;
        updateLogo();
    } else if (currentPhotoType === 'contact') {
        appData.contactPhoto = currentPhotoData;
    } else if (currentPhotoType === 'category') {
        const cat = appData.categories.find(c => c.id === currentPhotoId);
        if (cat) cat.iconPhoto = currentPhotoData;
    }
    
    saveData();
    renderCategories();
    closePhotoEditor();
    showNotification('Fotka uložená');
}

function editLogo() { openPhotoEditor('logo'); }
function editContactPhoto() { openPhotoEditor('contact'); }
function editCategoryPhoto(catId, e) {
    if (e) e.stopPropagation();
    openPhotoEditor('category', catId);
}

function updateLogo() {
    const logo = document.getElementById('logoIcon');
    if (appData.logoPhoto) {
        logo.innerHTML = `<img src="${appData.logoPhoto}" style="width:100%;height:100%;object-fit:cover"><span class="edit-badge">✏️</span>`;
    } else {
        logo.innerHTML = `🔧<span class="edit-badge">✏️</span>`;
    }
}

// ===== IMPORT/EXPORT =====
function openImportModal() {
    document.getElementById('importModal').classList.add('active');
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('active');
}

function selectImportType(btn, type) {
    document.querySelectorAll('.import-type-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => document.getElementById('importJson').value = e.target.result;
    reader.readAsText(file);
}

function processImport() {
    const text = document.getElementById('importJson').value.trim();
    if (!text) return showNotification('Vložte JSON', 'error');
    
    try {
        const data = JSON.parse(text);
        
        if (data.categories) {
            data.categories.forEach(newCat => {
                const exist = appData.categories.find(c => c.id === newCat.id);
                if (exist) {
                    exist.diagnoses = [...(exist.diagnoses||[]), ...(newCat.diagnoses||[])];
                } else {
                    appData.categories.push(newCat);
                }
            });
        }
        if (data.logoPhoto) appData.logoPhoto = data.logoPhoto;
        if (data.contactPhoto) appData.contactPhoto = data.contactPhoto;
        
        saveData();
        renderCategories();
        updateLogo();
        closeImportModal();
        showNotification('Import úspešný');
    } catch(e) {
        showNotification('Chyba: ' + e.message, 'error');
    }
}

function openExportModal() {
    document.getElementById('exportModal').classList.add('active');
    updateExport();
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
}

function updateExport() {
    const type = document.querySelector('input[name="exportType"]:checked')?.value || 'all';
    let data = appData;
    
    if (type === 'trees') {
        data = { categories: appData.categories.map(c => ({id: c.id, diagnoses: c.diagnoses})) };
    }
    
    document.getElementById('exportResult').textContent = JSON.stringify(data, null, 2);
}

function copyExport() {
    const text = document.getElementById('exportResult').textContent;
    navigator.clipboard.writeText(text).then(() => showNotification('Skopírované'));
}

function downloadExport() {
    const text = document.getElementById('exportResult').textContent;
    const blob = new Blob([text], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Súbor stiahnutý');
}

// ===== KONTAKT =====
function openContactModal() {
    const img = document.getElementById('contactModalImg');
    const text = document.getElementById('contactModalText');
    
    if (appData.contactPhoto) {
        img.src = appData.contactPhoto;
        img.classList.remove('hidden');
        text.classList.add('hidden');
    } else {
        img.classList.add('hidden');
        text.classList.remove('hidden');
    }
    
    document.getElementById('contactModal').classList.add('active');
}

function closeContactModal() {
    document.getElementById('contactModal').classList.remove('active');
}

function openWhatsApp() {
    window.open('https://wa.me/4915163812554', '_blank');
}

function openSMS() {
    window.open('sms:+4915163812554', '_blank');
}

// ===== JAZYKY =====
function openLangModal() {
    const opts = document.getElementById('langOptions');
    opts.innerHTML = Object.entries(appData.languages).map(([code, lang]) => `
        <div class="lang-option ${code === appData.currentLang ? 'selected' : ''}" onclick="setLanguage('${code}')">
            <img src="${lang.flag}" class="lang-flag">
            <div class="lang-info">
                <div class="lang-name">${lang.name}</div>
                <div class="lang-code">${lang.code}</div>
            </div>
        </div>
    `).join('');
    document.getElementById('langModal').classList.add('active');
}

function closeLangModal() {
    document.getElementById('langModal').classList.remove('active');
}

function setLanguage(code) {
    appData.currentLang = code;
    const lang = appData.languages[code];
    document.getElementById('currentFlag').src = lang.flag;
    document.getElementById('currentLang').textContent = lang.code;
    saveData();
    closeLangModal();
    showNotification(lang.name);
}

function openManualsModal() {
    showNotification('Manuály - pripravuje sa');
}

// ===== KATEGÓRIE =====
function renderCategories() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = appData.categories.map(cat => `
        <div class="category-item" onclick="showCategory('${cat.id}')">
            <div class="category-icon" onclick="editCategoryPhoto('${cat.id}', event)">
                ${cat.iconPhoto ? `<img src="${cat.iconPhoto}">` : cat.icon}
                <span class="edit-badge">✏️</span>
            </div>
            <div class="category-name">${cat.name}</div>
            <div class="category-count">${cat.diagnoses?.length || 0} stromov</div>
        </div>
    `).join('');
}

function showCategory(id) {
    showNotification('Kategória: ' + id);
}

function showSection(section) {
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// ===== POMOCNÉ =====
function showNotification(msg, type) {
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${type==='error'?'#ef4444':'#10b981'};color:white;padding:16px 24px;border-radius:12px;font-weight:700;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.3)`;
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}

function clearAllData() {
    if (!confirm('Vymazať všetko?')) return;
    localStorage.removeItem('diagnostikaData');
    location.reload();
}

function saveData() {
    localStorage.setItem('diagnostikaData', JSON.stringify(appData));
}

function loadData() {
    const saved = localStorage.getItem('diagnostikaData');
    if (saved) {
        const data = JSON.parse(saved);
        appData = { ...appData, ...data };
    }
}

function openFeedback() {
    window.location.href = 'mailto:caravantechnikerammain@gmail.com?subject=Spatna vazba';
}

// ===== INIT =====
function init() {
    loadData();
    renderCategories();
    updateLogo();
    
    if (sessionStorage.getItem('adminSession') === 'true') {
        isAdminLoggedIn = true;
        document.getElementById('appContainer').classList.add('admin-mode');
        document.getElementById('adminPanel').classList.remove('hidden');
        updateAdminBtn();
    }
}

document.addEventListener('DOMContentLoaded', init);
