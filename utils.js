// Pomocné funkcie

function updateFlagDisplay() {
    const lang = appData.currentLang;
    const langData = appData.languages[lang];
    const flagImg = document.getElementById('currentFlag');
    const langSpan = document.getElementById('currentLang');
    
    if (flagImg) {
        flagImg.src = CONFIG.FLAG_URLS[lang];
        flagImg.alt = langData.code;
    }
    if (langSpan) {
        langSpan.textContent = langData.code;
    }
}

function updateAdminStatus() {
    const statusEl = document.getElementById('adminStatus');
    if (!statusEl) return;
    
    // Používame globálnu premennú z app.js
    if (typeof isAdminLoggedIn !== 'undefined' && isAdminLoggedIn) {
        statusEl.textContent = '• Admin';
        statusEl.style.color = '#22c55e';
    } else {
        statusEl.textContent = '';
    }
}

function loadPhotos() {
    const headerIconImg = document.getElementById('headerIconImg');
    const headerIconText = document.getElementById('headerIconText');
    const contactBtnImg = document.getElementById('contactBtnImg');
    const contactBtnText = document.getElementById('contactBtnText');
    const contactModalImg = document.getElementById('contactModalImg');
    const contactModalText = document.getElementById('contactModalText');
    
    if (appData.headerPhoto && headerIconImg && headerIconText) {
        headerIconImg.src = appData.headerPhoto;
        headerIconImg.classList.remove('hidden');
        headerIconText.classList.add('hidden');
    }
    if (appData.contactPhoto) {
        if (contactBtnImg && contactBtnText) {
            contactBtnImg.src = appData.contactPhoto;
            contactBtnImg.classList.remove('hidden');
            contactBtnText.classList.add('hidden');
        }
        if (contactModalImg && contactModalText) {
            contactModalImg.src = appData.contactPhoto;
            contactModalImg.classList.remove('hidden');
            contactModalText.classList.add('hidden');
        }
    }
}

function initBrandGrid(gridId = 'brandGrid') {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = CONFIG.DEVICE_BRANDS.map(brand => `
        <div class="brand-btn" onclick="selectBrand('${brand.id}', '${gridId}')" data-brand="${brand.id}">
            <div style="font-size: 1.3em; margin-bottom: 4px;">${brand.icon}</div>
            <div style="font-size: 0.85em;">${brand.name}</div>
        </div>
    `).join('');
}

function selectBrand(brandId, gridId = 'brandGrid') {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    grid.querySelectorAll('.brand-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const selectedBtn = grid.querySelector(`.brand-btn[data-brand="${brandId}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    const selectedBrandInput = document.getElementById('selectedBrand');
    if (selectedBrandInput) {
        selectedBrandInput.value = brandId;
    }
}

function populateExportSelects() {
    // Táto funkcia je volaná z import-export.js
    updateExportOptions();
}

function populateReplaceTreeSelect() {
    const select = document.getElementById('replaceTreeSelect');
    if (!select) return;
    
    const trees = [];

    appData.categories.forEach(cat => {
        if (cat.diagnoses) {
            cat.diagnoses.forEach(d => {
                trees.push({
                    id: d.id,
                    title: (d.translations.sk || d.translations.de).title,
                    category: (cat.translations.sk || cat.translations.de).name
                });
            });
        }
    });

    select.innerHTML = trees.map(t => 
        `<option value="${t.id}">${t.title} (${t.category})</option>`
    ).join('');
}

function closeModal(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
}

// PRIDANÉ: Funkcia pre zatvorenie admin modálu
function closeAdminModal() {
    // Admin panel je teraz trvalo viditeľný, takže táto funkcia len skryje panel
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.add('hidden');
    }
    updateAdminButton();
}

// PRIDANÉ: Funkcia pre aktualizáciu admin tlačidla
function updateAdminButton() {
    const btn = document.getElementById('adminBtn');
    const panel = document.getElementById('adminPanel');
    if (!btn || !panel) return;

    if (isAdminLoggedIn && !panel.classList.contains('hidden')) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}
