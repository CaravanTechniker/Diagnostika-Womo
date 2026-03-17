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
    
    // Aktualizovať všetky elementy s data-translate
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // Aktualizovať placeholder-y
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });
    
    // Aktualizovať názov stránky
    if (t.appTitle) {
        document.title = t.appTitle;
    }
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

// ===== FOTO EDITOR =====
function openPhotoEditor(type, id = null) {
    currentPhotoTargetType = type;
    currentPhotoTargetId = id;
    currentPhotoData = null;

    // Načítať aktuálnu fotku
    let currentPhoto = null;
    if (type === 'logo') {
        currentPhoto = appData.logoPhoto;
    } else if (type === 'contact') {
        currentPhoto = appData.contactPhoto;
    } else if (type === 'category') {
        const cat = appData.categories.find(c => c.id === id);
        currentPhoto = cat ? cat.iconPhoto : null;
    }

    // Zobraziť preview
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

    document.getElementById('savePhotoBtn').disabled = true;
}

function savePhoto() {
    if (!currentPhotoData) {
        showNotification('Najprv vyberte fotku', 'error');
        return;
    }

    // Uložiť fotku
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

// ===== EDIT FOTIEK =====
function editLogoPhoto() {
    if (!isAdminLoggedIn && !isEditMode) return;
    openPhotoEditor('logo');
}

function editContactPhoto() {
    if (!isAdminLoggedIn && !isEditMode) return;
    openPhotoEditor('contact');
}

function editCategoryPhoto(catId) {
    if (!isAdminLoggedIn && !isEditMode) return;
    if (event) event.stopPropagation();
    openPhotoEditor('category', catId);
}

// ===== AKTUALIZÁCIA ZOBRAZENIA =====
function updateLogoDisplay() {
    const logoIcon = document.getElementById('logoIcon');
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
        contactModalImg.src = appData.contactPhoto;
        contactModalImg.classList.remove('hidden');
        contactModalText.classList.add('hidden');
    } else {
        contactModalImg.classList.add('hidden');
        contactModalText.classList.remove('hidden');
    }
}

// ===== IMPORT/EXPORT =====
let currentImportType = null;

function openImportModal() {
    currentImportType = null;
    document.getElementById('importJson').value = '';
    document.getElementById('importFile').value = '';
    document.getElementById('importBrandSection').classList.add('hidden');

    // Reset výberu
    document.querySelectorAll('.import-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    document.getElementById('importModal').classList.add('active');
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('active');
}

function selectImportType(type) {
    currentImportType = type;

    document.querySelectorAll('.import-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // Zobraziť/skryť brand sekcie
    if (type === 'error' || type === 'manual') {
        document.getElementById('importBrandSection').classList.remove('hidden');
        initBrandGrid('importBrandGrid');
    } else {
        document.getElementById('importBrandSection').classList.add('hidden');
    }
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('importJson').value = e.target.result;
    };
    reader.readAsText(file);
}

function processImport() {
    const jsonText = document.getElementById('importJson').value.trim();
    if (!jsonText) {
        showNotification('Vložte JSON kód', 'error');
        return;
    }

    try {
        const data = JSON.parse(jsonText);
        const action = document.getElementById('importAction').value;

        // Import podľa typu
        if (currentImportType === 'tree') {
            importTree(data, action);
        } else if (currentImportType === 'error') {
            importErrors(data, action);
        } else if (currentImportType === 'manual') {
            importManual(data, action);
        } else if (currentImportType === 'photo') {
            importPhotos(data, action);
        } else {
            // Kompletný import
            importComplete(data, action);
        }

        saveDataToStorage();
        closeImportModal();
        showNotification('Import úspešný');

        // Refresh
        if (typeof renderCategories === 'function') renderCategories();

    } catch (e) {
        showNotification('Chyba v JSON: ' + e.message, 'error');
    }
}

function importTree(data, action) {
    if (!data.id || !data.translations) {
        throw new Error('Neplatný formát stromu');
    }

    // Nájsť kategóriu
    let category = appData.categories.find(c => c.id === data.categoryId);
    if (!category) {
        category = appData.categories[0]; // Default prvá
    }

    if (!category.diagnoses) category.diagnoses = [];

    const existingIndex = category.diagnoses.findIndex(d => d.id === data.id);

    if (action === 'replace' && existingIndex >= 0) {
        category.diagnoses[existingIndex] = data;
    } else if (action === 'merge' && existingIndex >= 0) {
        // Spojiť kroky
        category.diagnoses[existingIndex].steps = {
            ...category.diagnoses[existingIndex].steps,
            ...data.steps
        };
    } else {
        category.diagnoses.push(data);
    }
}

function importErrors(data, action) {
    if (!appData.errorCodes) appData.errorCodes = {};

    const brand = document.querySelector('#importBrandGrid .selected')?.dataset.brand || 'other';

    if (!appData.errorCodes[brand]) appData.errorCodes[brand] = [];

    if (Array.isArray(data)) {
        if (action === 'replace') {
            appData.errorCodes[brand] = data;
        } else {
            appData.errorCodes[brand] = [...appData.errorCodes[brand], ...data];
        }
    } else {
        appData.errorCodes[brand].push(data);
    }
}

function importManual(data, action) {
    const brand = document.querySelector('#importBrandGrid .selected')?.dataset.brand || 'other';

    if (!MANUALS_DATA[brand]) MANUALS_DATA[brand] = { name: brand, items: [] };

    if (Array.isArray(data)) {
        if (action === 'replace') {
            MANUALS_DATA[brand].items = data;
        } else {
            MANUALS_DATA[brand].items = [...MANUALS_DATA[brand].items, ...data];
        }
    } else {
        MANUALS_DATA[brand].items.push(data);
    }
}

function importPhotos(data, action) {
    if (data.logoPhoto) appData.logoPhoto = data.logoPhoto;
    if (data.contactPhoto) appData.contactPhoto = data.contactPhoto;
    if (data.categoryPhotos) {
        Object.entries(data.categoryPhotos).forEach(([catId, photo]) => {
            const cat = appData.categories.find(c => c.id === catId);
            if (cat) cat.iconPhoto = photo;
        });
    }
}

function importComplete(data, action) {
    if (action === 'replace') {
        // Nahradiť všetko
        Object.assign(appData, data);
    } else {
        // Spojiť
        if (data.categories) {
            data.categories.forEach(newCat => {
                const existing = appData.categories.find(c => c.id === newCat.id);
                if (existing) {
                    existing.diagnoses = [...(existing.diagnoses || []), ...(newCat.diagnoses || [])];
                } else {
                    appData.categories.push(newCat);
                }
            });
        }
    }
}

// ===== EXPORT =====
function openExportModal() {
    updateExportOptions();
    document.getElementById('exportResult').textContent = '';
    document.getElementById('exportModal').classList.add('active');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
}

function updateExportOptions() {
    const type = document.querySelector('input[name="exportType"]:checked')?.value || 'all';
    const selectSection = document.getElementById('exportSelectSection');
    const brandSection = document.getElementById('exportBrandSection');

    selectSection.classList.add('hidden');
    brandSection.classList.add('hidden');

    if (type === 'category') {
        selectSection.classList.remove('hidden');
        const select = document.getElementById('exportSelect');
        select.innerHTML = appData.categories.map(cat => {
            const t = cat.translations[appData.currentLang] || cat.translations.de;
            return `<option value="${cat.id}">${t.name}</option>`;
        }).join('');
    } else if (type === 'tree') {
        selectSection.classList.remove('hidden');
        const select = document.getElementById('exportSelect');
        let options = '';
        appData.categories.forEach(cat => {
            if (cat.diagnoses) {
                cat.diagnoses.forEach(diag => {
                    const t = diag.translations[appData.currentLang] || diag.translations.de;
                    options += `<option value="${cat.id}:${diag.id}">${t.title}</option>`;
                });
            }
        });
        select.innerHTML = options;
    } else if (type === 'errors' || type === 'manuals') {
        brandSection.classList.remove('hidden');
        initBrandGrid('exportBrandGrid');
    }
}

function processExport() {
    const type = document.querySelector('input[name="exportType"]:checked')?.value || 'all';
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'json';

    let data = {};

    switch(type) {
        case 'all':
            data = JSON.parse(JSON.stringify(appData));
            break;
        case 'trees':
            data = { categories: appData.categories.map(c => ({ id: c.id, diagnoses: c.diagnoses })) };
            break;
        case 'errors':
            const errorBrand = document.querySelector('#exportBrandGrid .selected')?.dataset.brand;
            data = errorBrand ? { [errorBrand]: appData.errorCodes[errorBrand] } : appData.errorCodes;
            break;
        case 'manuals':
            const manualBrand = document.querySelector('#exportBrandGrid .selected')?.dataset.brand;
            data = manualBrand ? { [manualBrand]: MANUALS_DATA[manualBrand] } : MANUALS_DATA;
            break;
        case 'photos':
            data = {
                logoPhoto: appData.logoPhoto,
                contactPhoto: appData.contactPhoto,
                categoryPhotos: {}
            };
            appData.categories.forEach(c => {
                if (c.iconPhoto) data.categoryPhotos[c.id] = c.iconPhoto;
            });
            break;
        case 'category':
            const catId = document.getElementById('exportSelect').value;
            const cat = appData.categories.find(c => c.id === catId);
            data = cat;
            break;
        case 'tree':
            const [treeCatId, treeId] = document.getElementById('exportSelect').value.split(':');
            const treeCat = appData.categories.find(c => c.id === treeCatId);
            data = treeCat?.diagnoses?.find(d => d.id === treeId);
            break;
    }

    const jsonString = format === 'pretty' ? JSON.stringify(data, null, 2) : JSON.stringify(data);

    document.getElementById('exportResult').textContent = jsonString;

    // Kopírovať do schránky
    navigator.clipboard.writeText(jsonString).then(() => {
        showNotification('Skopírované do schránky');
    });
}

function downloadExport() {
    const content = document.getElementById('exportResult').textContent;
    if (!content) {
        showNotification('Najprv vytvorte export', 'error');
        return;
    }

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostika-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Súbor stiahnutý');
}

// ===== POMOCNÉ FUNKCIE =====
function initBrandGrid(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = CONFIG.DEVICE_BRANDS.map(brand => `
        <div class="brand-btn" data-brand="${brand.id}" onclick="selectBrand(this)">
            ${brand.icon} ${brand.name}
        </div>
    `).join('');
}

function selectBrand(btn) {
    btn.parentElement.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function clearAllData() {
    if (!confirm('Naozaj chcete vymazať všetky dáta? Táto akcia je nezvratná!')) return;

    localStorage.removeItem('diagnostikaData');
    sessionStorage.removeItem('adminSession');
    location.reload();
}

// ===== KONTAKT =====
function openContactModal() {
    const lang = appData.currentLang;
    const ct = CONTACT_TRANSLATIONS[lang] || CONTACT_TRANSLATIONS.de;

    document.getElementById('contactWarningTitle').textContent = ct.warningTitle;
    document.getElementById('contactWarningSubtext').textContent = ct.warningSubtext;
    document.getElementById('contactNotice').innerHTML = `<strong>⚠️</strong> ${ct.notice}`;
    document.getElementById('closeContactBtn').textContent = ct.closeBtn;

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
        font-size: 15px;
        max-width: 90%;
        text-align: center;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// ===== INICIALIZÁCIA =====
document.addEventListener('DOMContentLoaded', () => {
    // Načítať uložený jazyk
    const savedLang = localStorage.getItem('currentLanguage');
    if (savedLang && appData.languages[savedLang]) {
        appData.currentLang = savedLang;
    }
    
    // Aktualizovať jazykové tlačidlo
    const flagImg = document.getElementById('currentFlag');
    const langSpan = document.getElementById('currentLang');
    if (flagImg) flagImg.src = CONFIG.FLAG_URLS[appData.currentLang];
    if (langSpan) langSpan.textContent = appData.languages[appData.currentLang].code;
    
    // Aktualizovať všetky texty
    updateLanguage();
    
    init();
    updateLogoDisplay();

    // Skontrolovať admin session
    const adminSession = sessionStorage.getItem('adminSession');
    if (adminSession === 'true') {
        isAdminLoggedIn = true;
        document.getElementById('appContainer').classList.add('admin-mode');
        document.getElementById('adminPanel').classList.remove('hidden');
        updateAdminButton();
    }
});
