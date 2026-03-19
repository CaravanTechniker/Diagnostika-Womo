// Pomocné a chýbajúce utility funkcie

function updateFlagDisplay() {
    const lang = appData.currentLang || 'sk';
    const langData = appData.languages?.[lang];
    const flag = document.getElementById('currentFlag');
    const code = document.getElementById('currentLang');
    if (flag && CONFIG.FLAG_URLS[lang]) {
        flag.src = CONFIG.FLAG_URLS[lang];
        flag.alt = langData?.code || lang.toUpperCase();
    }
    if (code) {
        code.textContent = langData?.code || lang.toUpperCase();
    }
}

function updateAdminStatus() {
    const statusEl = document.getElementById('adminStatus');
    if (!statusEl) return;
    if (isAdminLoggedIn) {
        statusEl.textContent = '• Admin';
        statusEl.style.color = '#22c55e';
    } else {
        statusEl.textContent = '';
        statusEl.style.color = '';
    }
}

function updateLogoDisplay() {
    const logo = document.getElementById('logoIcon');
    if (!logo) return;
    if (appData.logoPhoto) {
        logo.innerHTML = `<img src="${appData.logoPhoto}" alt="Logo">`;
    } else {
        logo.textContent = '🔧';
    }
}

function updateContactDisplay() {
    const contactButton = document.querySelector('.contact-btn-main');
    if (contactButton) {
        const label = contactButton.querySelector('span:last-child');
        if (label) label.textContent = CONFIG.CONTACT.role || 'Caravan Techniker am Main';
    }

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

function loadPhotos() {
    updateLogoDisplay();
    updateContactDisplay();
}

function initBrandGrid(containerId = 'brandGrid') {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    grid.innerHTML = CONFIG.DEVICE_BRANDS.map(brand => `
        <div class="brand-btn" onclick="selectBrand('${brand.id}', '${containerId}')" data-brand="${brand.id}">
            <div style="font-size: 1.2em; margin-bottom: 3px;">${brand.icon}</div>
            <div style="font-size: 0.8em;">${brand.name}</div>
        </div>
    `).join('');
}

function selectBrand(brandId, containerId = 'brandGrid') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.brand-btn').forEach(btn => btn.classList.remove('selected'));
    const selected = container.querySelector(`.brand-btn[data-brand="${brandId}"]`);
    if (selected) selected.classList.add('selected');

    if (containerId === 'importBrandGrid') {
        document.getElementById('selectedBrand').value = brandId;
    }
}

function openAdminModal() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.remove('hidden');
        updateAdminButton();
    }
}

function closeAdminModal() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.add('hidden');
        updateAdminButton();
    }
}

function closeModal(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
}

function populateExportSelects() {
    if (typeof updateExportOptions === 'function') {
        updateExportOptions();
    }
}
