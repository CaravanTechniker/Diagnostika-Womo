// Pomocné funkcie

function updateFlagDisplay() {
    const lang = appData.currentLang;
    const langData = appData.languages[lang];
    document.getElementById('currentLangFlagImg').src = CONFIG.FLAG_URLS[lang];
    document.getElementById('currentLangFlagImg').alt = langData.code;
    document.getElementById('currentLangCode').textContent = langData.code;
}

function updateAdminStatus() {
    const statusEl = document.getElementById('adminStatus');
    if (isAdminLoggedIn) {
        statusEl.textContent = '• Admin';
        statusEl.style.color = '#22c55e';
    } else {
        statusEl.textContent = '';
    }
}

function loadPhotos() {
    if (appData.headerPhoto) {
        document.getElementById('headerIconImg').src = appData.headerPhoto;
        document.getElementById('headerIconImg').classList.remove('hidden');
        document.getElementById('headerIconText').classList.add('hidden');
    }
    if (appData.contactPhoto) {
        document.getElementById('contactBtnImg').src = appData.contactPhoto;
        document.getElementById('contactBtnImg').classList.remove('hidden');
        document.getElementById('contactBtnText').classList.add('hidden');
        document.getElementById('contactModalImg').src = appData.contactPhoto;
        document.getElementById('contactModalImg').classList.remove('hidden');
        document.getElementById('contactModalText').classList.add('hidden');
    }
}

function initBrandGrid() {
    const grid = document.getElementById('brandGrid');
    grid.innerHTML = CONFIG.DEVICE_BRANDS.map(brand => `
        <div class="brand-btn" onclick="selectBrand('${brand.id}')" data-brand="${brand.id}">
            <div style="font-size: 1.3em; margin-bottom: 4px;">${brand.icon}</div>
            <div style="font-size: 0.85em;">${brand.name}</div>
        </div>
    `).join('');
}

function selectBrand(brandId) {
    document.querySelectorAll('.brand-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`.brand-btn[data-brand="${brandId}"]`).classList.add('selected');
    document.getElementById('selectedBrand').value = brandId;
}

function populateExportSelects() {
    const treeSelect = document.getElementById('exportTreeSelect');
    
    treeSelect.innerHTML = appData.categories.flatMap(c => 
        c.diagnoses ? c.diagnoses.map(d => {
            const t = d.translations.sk || d.translations.de;
            return `<option value="${d.id}">${t.title}</option>`;
        }) : []
    ).join('');
}

function populateReplaceTreeSelect() {
    const select = document.getElementById('replaceTreeSelect');
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