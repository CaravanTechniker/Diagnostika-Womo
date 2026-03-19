// Import a export funkcie - Fixed Version 5.5

function openExportModal() {
    closeAdminModal();
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
    closeAdminModal();
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.add('active');
    }
    
    const brandSection = document.getElementById('importBrandSection');
    if (brandSection) {
        brandSection.classList.add('hidden');
    }
    
    document.querySelectorAll('.import-type-btn').forEach(btn => btn.classList.remove('selected'));
    
    const importJson = document.getElementById('importJson');
    if (importJson) {
        importJson.value = '';
    }
}

function closeImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function selectImportType(type) {
    document.querySelectorAll('.import-type-btn').forEach(btn => btn.classList.remove('selected'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }

    const brandSection = document.getElementById('importBrandSection');
    
    if (brandSection) {
        if (type === 'error' || type === 'manual') {
            brandSection.classList.remove('hidden');
            initBrandGrid('importBrandGrid');
        } else {
            brandSection.classList.add('hidden');
        }
    }
    
    const selectedImportType = document.getElementById('selectedImportType');
    if (selectedImportType) {
        selectedImportType.value = type;
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
    
    reader.onerror = function() {
        showNotification('Chyba pri čítaní súboru', 'error');
    };
    
    reader.readAsText(file);
}

function processImport() {
    const importJson = document.getElementById('importJson');
    if (!importJson) return;
    
    const jsonText = importJson.value.trim();
    if (!jsonText) {
        showNotification('Vložte JSON kód', 'error');
        return;
    }

    const selectedImportType = document.getElementById('selectedImportType');
    const type = selectedImportType ? (selectedImportType.value || 'complete') : 'complete';
    
    const importAction = document.getElementById('importAction');
    const action = importAction ? importAction.value : 'new';

    try {
        const data = JSON.parse(jsonText);

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

        if (typeof renderCategories === 'function') renderCategories();

    } catch (e) {
        showNotification('Chyba v JSON: ' + e.message, 'error');
    }
}

function importTree(data, action) {
    if (!data.id || !data.translations) {
        throw new Error('Neplatný formát stromu');
    }

    let category = appData.categories.find(c => c.id === data.categoryId);
    if (!category) {
        category = appData.categories[0];
    }

    if (!category.diagnoses) category.diagnoses = [];

    const existingIndex = category.diagnoses.findIndex(d => d.id === data.id);

    if (action === 'replace' && existingIndex >= 0) {
        category.diagnoses[existingIndex] = data;
    } else if (action === 'merge' && existingIndex >= 0) {
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

    const selectedBrand = document.querySelector('#importBrandGrid .selected');
    const brand = selectedBrand ? selectedBrand.dataset.brand : 'other';

    if (!appData.errorCodes[brand]) appData.errorCodes[brand] = [];

    if (Array.isArray(data)) {
        if (action === 'replace') {
            appData.errorCodes[brand] = data;
        } else {
            appData.errorCodes[brand] = [...appData.errorCodes[brand], ...data];
        }
    } else if (data && typeof data === 'object') {
        appData.errorCodes[brand].push(data);
    }
}

function importManual(data, action) {
    const selectedBrand = document.querySelector('#importBrandGrid .selected');
    const brand = selectedBrand ? selectedBrand.dataset.brand : 'other';

    if (!MANUALS_DATA[brand]) MANUALS_DATA[brand] = { name: brand, items: [] };

    if (Array.isArray(data)) {
        if (action === 'replace') {
            MANUALS_DATA[brand].items = data;
        } else {
            MANUALS_DATA[brand].items = [...MANUALS_DATA[brand].items, ...data];
        }
    } else if (data && typeof data === 'object') {
        MANUALS_DATA[brand].items.push(data);
    }
}

function importPhotos(data, action) {
    if (data.logoPhoto) appData.logoPhoto = data.logoPhoto;
    if (data.contactPhoto) appData.contactPhoto = data.contactPhoto;
    if (data.categoryPhotos && typeof data.categoryPhotos === 'object') {
        Object.entries(data.categoryPhotos).forEach(([catId, photo]) => {
            const cat = appData.categories.find(c => c.id === catId);
            if (cat) cat.iconPhoto = photo;
        });
    }
    loadPhotos();
}

function importComplete(data, action) {
    if (action === 'replace') {
        const savedLang = appData.currentLang;
        Object.assign(appData, data);
        if (data.currentLang) {
            appData.currentLang = data.currentLang;
        }
    } else {
        if (data.categories && Array.isArray(data.categories)) {
            data.categories.forEach(newCat => {
                const existing = appData.categories.find(c => c.id === newCat.id);
                if (existing) {
                    if (newCat.diagnoses && Array.isArray(newCat.diagnoses)) {
                        existing.diagnoses = [...(existing.diagnoses || []), ...newCat.diagnoses];
                    }
                } else {
                    appData.categories.push(newCat);
                }
            });
        }
        
        if (data.errorCodes && typeof data.errorCodes === 'object') {
            if (!appData.errorCodes) appData.errorCodes = {};
            Object.assign(appData.errorCodes, data.errorCodes);
        }
    }
}

function updateExportOptions() {
    const exportType = document.querySelector('input[name="exportType"]:checked');
    const type = exportType ? exportType.value : 'all';
    
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
                if (cat.diagnoses && Array.isArray(cat.diagnoses)) {
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
    const exportType = document.querySelector('input[name="exportType"]:checked');
    const type = exportType ? exportType.value : 'all';
    
    const exportFormat = document.querySelector('input[name="exportFormat"]:checked');
    const format = exportFormat ? exportFormat.value : 'json';

    let data = {};

    switch(type) {
        case 'all':
            data = JSON.parse(JSON.stringify(appData));
            break;
        case 'trees':
            data = { 
                categories: appData.categories.map(c => ({ 
                    id: c.id, 
                    diagnoses: c.diagnoses 
                })) 
            };
            break;
        case 'errors':
            const errorBrand = document.querySelector('#exportBrandGrid .selected');
            const eb = errorBrand ? errorBrand.dataset.brand : null;
            data = eb ? { [eb]: appData.errorCodes[eb] } : appData.errorCodes;
            break;
        case 'manuals':
            const manualBrand = document.querySelector('#exportBrandGrid .selected');
            const mb = manualBrand ? manualBrand.dataset.brand : null;
            data = mb ? { [mb]: MANUALS_DATA[mb] } : MANUALS_DATA;
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
            const exportSelect = document.getElementById('exportSelect');
            const catId = exportSelect ? exportSelect.value : null;
            const cat = catId ? appData.categories.find(c => c.id === catId) : null;
            data = cat || {};
            break;
        case 'tree':
            const exportSelectTree = document.getElementById('exportSelect');
            const treeValue = exportSelectTree ? exportSelectTree.value : '';
            const [treeCatId, treeId] = treeValue.split(':');
            const treeCat = treeCatId ? appData.categories.find(c => c.id === treeCatId) : null;
            data = treeCat && treeId ? (treeCat.diagnoses?.find(d => d.id === treeId) || {}) : {};
            break;
    }

    const jsonString = format === 'pretty' ? JSON.stringify(data, null, 2) : JSON.stringify(data);

    const exportResult = document.getElementById('exportResult');
    if (exportResult) {
        exportResult.textContent = jsonString;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonString).then(() => {
            showNotification('Skopírované do schránky');
        }).catch(() => {
            showNotification('Chyba pri kopírovaní', 'error');
        });
    }
}

function downloadExport() {
    const exportResult = document.getElementById('exportResult');
    const content = exportResult ? exportResult.textContent : '';
    
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
