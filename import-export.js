// Import a export funkcie

function openExportModal() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.add('hidden');
    }
    if (typeof updateAdminButton === 'function') {
        updateAdminButton();
    }
    
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.classList.add('active');
    }
    updateExportOptions();
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function openImportModal() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.add('hidden');
    }
    if (typeof updateAdminButton === 'function') {
        updateAdminButton();
    }
    
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Reset
    const brandSection = document.getElementById('importBrandSection');
    if (brandSection) {
        brandSection.classList.add('hidden');
    }
    
    document.querySelectorAll('.import-type-btn').forEach(btn => btn.classList.remove('selected'));
    
    const importJson = document.getElementById('importJson');
    if (importJson) {
        importJson.value = '';
    }
    
    const selectedType = document.getElementById('selectedImportType');
    if (selectedType) {
        selectedType.value = '';
    }
}

function closeImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// OPRAVA: Pridaný parameter element
function selectImportType(type, element) {
    // Odstránime selected zo všetkých tlačidiel
    document.querySelectorAll('.import-type-btn').forEach(btn => btn.classList.remove('selected'));
    
    // Pridáme selected na kliknuté tlačidlo
    if (element) {
        element.classList.add('selected');
    }

    const brandSection = document.getElementById('importBrandSection');
    
    if (type === 'error' || type === 'manual') {
        if (brandSection) {
            brandSection.classList.remove('hidden');
        }
        initBrandGrid('importBrandGrid');
    } else {
        if (brandSection) {
            brandSection.classList.add('hidden');
        }
    }
    
    // Uložíme typ pre processImport
    const selectedType = document.getElementById('selectedImportType');
    if (selectedType) {
        selectedType.value = type;
    }
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const importJson = document.getElementById('importJson');
        if (importJson) {
            importJson.value = e.target.result;
        }
    };
    reader.readAsText(file);
}

function processImport() {
    const jsonText = document.getElementById('importJson');
    if (!jsonText || !jsonText.value.trim()) {
        showNotification('Vložte JSON kód', 'error');
        return;
    }

    const typeInput = document.getElementById('selectedImportType');
    const type = typeInput ? (typeInput.value || 'complete') : 'complete';
    
    const actionInput = document.getElementById('importAction');
    const action = actionInput ? actionInput.value : 'new';

    try {
        const data = JSON.parse(jsonText.value);

        if (type === 'tree') {
            importTree(data, action);
        } else if (type === 'error') {
            importErrors(data, action);
        } else if (type === 'manual') {
            importManual(data, action);
        } else if (type === 'photo') {
            importPhotos(data, action);
        } else {
            importComplete(data, action);
        }

        saveDataToStorage();
        closeImportModal();
        showNotification('Import úspešný');

        if (typeof renderCategories === 'function') {
            renderCategories();
        }

    } catch (e) {
        showNotification('Chyba v JSON: ' + e.message, 'error');
        console.error('Import error:', e);
    }
}

function importTree(data, action) {
    if (!data.id || !data.translations) {
        throw new Error('Neplatný formát stromu - chýba id alebo translations');
    }

    // Nájdeme cieľovú kategóriu
    let category = appData.categories.find(c => c.id === data.categoryId);
    if (!category) {
        // Ak nie je špecifikovaná, dáme do prvej kategórie (elektro)
        category = appData.categories[0];
    }

    if (!category.diagnoses) {
        category.diagnoses = [];
    }

    const existingIndex = category.diagnoses.findIndex(d => d.id === data.id);

    if (action === 'replace' && existingIndex >= 0) {
        category.diagnoses[existingIndex] = data;
    } else if (action === 'merge' && existingIndex >= 0) {
        // Merge steps
        const existing = category.diagnoses[existingIndex];
        if (!existing.translations) existing.translations = {};
        
        // Pre každý jazyk v importovaných dátach
        Object.keys(data.translations).forEach(lang => {
            if (!existing.translations[lang]) {
                existing.translations[lang] = data.translations[lang];
            } else {
                // Spojíme steps
                existing.translations[lang].steps = {
                    ...existing.translations[lang].steps,
                    ...data.translations[lang].steps
                };
                // Spojíme results
                if (data.translations[lang].results) {
                    existing.translations[lang].results = {
                        ...existing.translations[lang].results,
                        ...data.translations[lang].results
                    };
                }
            }
        });
    } else {
        // Nový strom - kontrola duplicity ID
        if (existingIndex >= 0) {
            // Zmeníme ID aby bolo unikátne
            data.id = data.id + '_import_' + Date.now();
        }
        category.diagnoses.push(data);
    }
}

function importErrors(data, action) {
    if (!appData.errorCodes) appData.errorCodes = {};

    const selectedBrand = document.querySelector('#importBrandGrid .selected');
    const brand = selectedBrand ? selectedBrand.dataset.brand : 'other';

    if (!appData.errorCodes[brand]) {
        appData.errorCodes[brand] = [];
    }

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
    const selectedBrand = document.querySelector('#importBrandGrid .selected');
    const brand = selectedBrand ? selectedBrand.dataset.brand : 'other';

    if (!MANUALS_DATA[brand]) {
        MANUALS_DATA[brand] = { name: brand, items: [] };
    }

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
    if (typeof loadPhotos === 'function') {
        loadPhotos();
    }
    if (typeof renderCategories === 'function') {
        renderCategories();
    }
}

function importComplete(data, action) {
    if (action === 'replace') {
        // Nahradíme všetky dáta, ale zachováme štruktúru
        if (data.categories) appData.categories = data.categories;
        if (data.errorCodes) appData.errorCodes = data.errorCodes;
        if (data.languages) appData.languages = data.languages;
        if (data.currentLang) appData.currentLang = data.currentLang;
        if (data.logoPhoto !== undefined) appData.logoPhoto = data.logoPhoto;
        if (data.contactPhoto !== undefined) appData.contactPhoto = data.contactPhoto;
    } else {
        // Merge - spojíme kategórie
        if (data.categories) {
            data.categories.forEach(newCat => {
                const existing = appData.categories.find(c => c.id === newCat.id);
                if (existing) {
                    // Spojíme diagnózy
                    if (newCat.diagnoses) {
                        newCat.diagnoses.forEach(newDiag => {
                            const existingDiag = existing.diagnoses.find(d => d.id === newDiag.id);
                            if (existingDiag) {
                                // Aktualizujeme existujúcu
                                Object.assign(existingDiag, newDiag);
                            } else {
                                // Pridáme novú
                                existing.diagnoses.push(newDiag);
                            }
                        });
                    }
                } else {
                    // Pridáme novú kategóriu
                    appData.categories.push(newCat);
                }
            });
        }
        
        // Spojíme error kódy
        if (data.errorCodes) {
            Object.assign(appData.errorCodes, data.errorCodes);
        }
    }
}

function updateExportOptions() {
    const typeInputs = document.querySelectorAll('input[name="exportType"]');
    let type = 'all';
    typeInputs.forEach(input => {
        if (input.checked) type = input.value;
    });

    const selectSection = document.getElementById('exportSelectSection');
    const brandSection = document.getElementById('exportBrandSection');

    if (selectSection) selectSection.classList.add('hidden');
    if (brandSection) brandSection.classList.add('hidden');

    if (type === 'category') {
        if (selectSection) selectSection.classList.remove('hidden');
        const select = document.getElementById('exportSelect');
        if (select) {
            select.innerHTML = appData.categories.map(cat => {
                const t = cat.translations[appData.currentLang] || cat.translations.de;
                return `<option value="${cat.id}">${t.name}</option>`;
            }).join('');
        }
    } else if (type === 'tree') {
        if (selectSection) selectSection.classList.remove('hidden');
        const select = document.getElementById('exportSelect');
        if (select) {
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
        }
    } else if (type === 'errors' || type === 'manuals') {
        if (brandSection) brandSection.classList.remove('hidden');
        initBrandGrid('exportBrandGrid');
    }
}

function processExport() {
    const typeInputs = document.querySelectorAll('input[name="exportType"]');
    let type = 'all';
    typeInputs.forEach(input => {
        if (input.checked) type = input.value;
    });

    const formatInputs = document.querySelectorAll('input[name="exportFormat"]');
    let format = 'json';
    formatInputs.forEach(input => {
        if (input.checked) format = input.value;
    });

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
            const catId = document.getElementById('exportSelect')?.value;
            const cat = appData.categories.find(c => c.id === catId);
            data = cat;
            break;
        case 'tree':
            const selectValue = document.getElementById('exportSelect')?.value;
            if (selectValue) {
                const [treeCatId, treeId] = selectValue.split(':');
                const treeCat = appData.categories.find(c => c.id === treeCatId);
                data = treeCat?.diagnoses?.find(d => d.id === treeId);
            }
            break;
    }

    const jsonString = format === 'pretty' ? JSON.stringify(data, null, 2) : JSON.stringify(data);

    const exportResult = document.getElementById('exportResult');
    if (exportResult) {
        exportResult.textContent = jsonString;
    }

    navigator.clipboard.writeText(jsonString).then(() => {
        showNotification('Skopírované do schránky');
    }).catch(err => {
        console.error('Clipboard error:', err);
        showNotification('Kód zobrazený nižšie', 'success');
    });
}

function downloadExport() {
    const content = document.getElementById('exportResult')?.textContent;
    if (!content) {
        showNotification('Najprv vytvorte export', 'error');
        return;
    }

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostika-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Súbor stiahnutý');
}

// Pomocná funkcia pre inicializáciu brand grid
function initBrandGrid(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = CONFIG.DEVICE_BRANDS.map(brand => `
        <div class="brand-btn" onclick="selectBrand('${brand.id}', '${gridId}')" data-brand="${brand.id}">
            <div style="font-size: 1.3em; margin-bottom: 4px;">${brand.icon}</div>
            <div style="font-size: 0.85em;">${brand.name}</div>
        </div>
    `).join('');
}

function selectBrand(brandId, gridId) {
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
