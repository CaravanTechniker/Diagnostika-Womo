// Import a export funkcie

let currentImportType = null;
let currentMode = 'import'; // 'import' alebo 'export'

function openImportModal() {
    closeAdminModal();
    currentMode = 'import';
    document.getElementById('importExportModal').classList.add('active');
    document.getElementById('modalTitle').textContent = '⬆️ Import';
    
    // Zobraziť import sekcie, skryť export sekcie
    document.getElementById('importSection').classList.remove('hidden');
    document.getElementById('exportSection').classList.add('hidden');
    document.getElementById('importExportBtn').textContent = 'Importovať';
    document.getElementById('importExportBtn').onclick = processImport;
    
    // Reset formulára
    resetImportForm();
}

function openExportModal() {
    closeAdminModal();
    currentMode = 'export';
    document.getElementById('importExportModal').classList.add('active');
    document.getElementById('modalTitle').textContent = '⬇️ Export';
    
    // Skryť import sekcie, zobraziť export sekcie
    document.getElementById('importSection').classList.add('hidden');
    document.getElementById('exportSection').classList.remove('hidden');
    document.getElementById('importExportBtn').textContent = '📋 Kopírovať do schránky';
    document.getElementById('importExportBtn').onclick = processExport;
    
    updateExportOptions();
}

function closeImportExportModal() {
    document.getElementById('importExportModal').classList.remove('active');
}

function resetImportForm() {
    document.getElementById('importBrandSection').classList.add('hidden');
    document.querySelectorAll('.import-type-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('importJson').value = '';
    document.getElementById('importAction').value = 'new';
    document.getElementById('importFile').value = '';
    
    currentImportType = null;
    const hiddenInput = document.getElementById('selectedImportType');
    if (hiddenInput) hiddenInput.value = '';
}

function selectImportType(type) {
    document.querySelectorAll('.import-type-btn').forEach(btn => btn.classList.remove('selected'));
    
    const buttons = document.querySelectorAll('.import-type-btn');
    buttons.forEach(btn => {
        const onclick = btn.getAttribute('onclick') || '';
        if (onclick.indexOf("'" + type + "'") !== -1 || onclick.indexOf('"' + type + '"') !== -1) {
            btn.classList.add('selected');
        }
    });
    
    currentImportType = type;
    const hiddenInput = document.getElementById('selectedImportType');
    if (hiddenInput) hiddenInput.value = type;

    const brandSection = document.getElementById('importBrandSection');
    
    if (type === 'error' || type === 'manual') {
        brandSection.classList.remove('hidden');
        initBrandGrid('importBrandGrid');
    } else {
        brandSection.classList.add('hidden');
    }
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('importJson').value = e.target.result;
        showNotification('Súbor načítaný');
    };
    reader.onerror = function() {
        showNotification('Chyba pri čítaní súboru', 'error');
    };
    reader.readAsText(file);
}

function processImport() {
    const jsonText = document.getElementById('importJson').value.trim();
    if (!jsonText) {
        showNotification('Vložte JSON kód alebo vyberte súbor', 'error');
        return;
    }

    const type = currentImportType || document.getElementById('selectedImportType').value || 'tree';
    const action = document.getElementById('importAction').value;

    try {
        const data = JSON.parse(jsonText);
        
        console.log('Import type:', type, 'Action:', action);

        if (type === 'tree') {
            importTreeData(data, action);
        } else if (type === 'error') {
            importErrors(data, action);
        } else if (type === 'manual') {
            importManual(data, action);
        } else if (type === 'photo') {
            importPhotos(data, action);
        } else {
            importTreeData(data, action);
        }

        saveDataToStorage();
        closeImportExportModal();
        showNotification('Import úspešný');

        if (typeof renderCategories === 'function') renderCategories();
        if (typeof populateExportSelects === 'function') populateExportSelects();

    } catch (e) {
        showNotification('Chyba v JSON: ' + e.message, 'error');
        console.error('Import error:', e);
    }
}

function importTreeData(data, action) {
    if (!data.id) {
        throw new Error('Chýba ID stromu (data.id)');
    }
    
    if (!data.translations) {
        throw new Error('Chýbajú preklady (data.translations)');
    }

    let category = null;
    
    if (data.categoryId) {
        category = appData.categories.find(c => c.id === data.categoryId);
    }
    
    if (!category) {
        category = appData.categories.find(c => c.id === 'elektro') || appData.categories[0];
    }

    if (!category) {
        throw new Error('Žiadna kategória nie je k dispozícii');
    }

    if (!category.diagnoses) {
        category.diagnoses = [];
    }

    const existingIndex = category.diagnoses.findIndex(d => d.id === data.id);

    if (action === 'replace' && existingIndex >= 0) {
        category.diagnoses[existingIndex] = data;
        console.log('Strom nahradený:', data.id);
    } else if (action === 'merge' && existingIndex >= 0) {
        const existing = category.diagnoses[existingIndex];
        existing.steps = { ...existing.steps, ...data.steps };
        existing.results = { ...existing.results, ...data.results };
        if (data.translations) {
            Object.keys(data.translations).forEach(lang => {
                if (!existing.translations[lang]) existing.translations[lang] = {};
                existing.translations[lang] = { 
                    ...existing.translations[lang], 
                    ...data.translations[lang] 
                };
            });
        }
        console.log('Strom spojený:', data.id);
    } else {
        if (existingIndex >= 0) {
            const newId = data.id + '_import_' + Date.now();
            console.log('Duplicitné ID, zmenené na:', newId);
            data.id = newId;
        }
        category.diagnoses.push(data);
        console.log('Nový strom pridaný:', data.id);
    }
}

function importErrors(data, action) {
    if (!appData.errorCodes) appData.errorCodes = {};

    const brand = document.querySelector('#importBrandGrid .selected')?.dataset.brand || 'other';

    if (!appData.errorCodes[brand]) {
        appData.errorCodes[brand] = [];
    }

    let newCodes = [];
    if (Array.isArray(data)) {
        newCodes = data;
    } else if (data.codes && Array.isArray(data.codes)) {
        newCodes = data.codes;
    } else if (data.code) {
        newCodes = [data];
    } else {
        throw new Error('Neplatný formát chybových kódov');
    }

    if (action === 'replace') {
        appData.errorCodes[brand] = newCodes;
    } else {
        newCodes.forEach(code => {
            const existingIndex = appData.errorCodes[brand].findIndex(c => c.code === code.code);
            if (existingIndex >= 0) {
                appData.errorCodes[brand][existingIndex] = code;
            } else {
                appData.errorCodes[brand].push(code);
            }
        });
    }
}

function importManual(data, action) {
    const brand = document.querySelector('#importBrandGrid .selected')?.dataset.brand || 'other';

    if (!window.MANUALS_DATA) window.MANUALS_DATA = {};
    if (!MANUALS_DATA[brand]) {
        MANUALS_DATA[brand] = { name: brand, items: [] };
    }

    let newItems = [];
    if (Array.isArray(data)) {
        newItems = data;
    } else if (data.items && Array.isArray(data.items)) {
        newItems = data.items;
    } else if (data.title && data.url) {
        newItems = [data];
    } else {
        throw new Error('Neplatný formát manuálu');
    }

    if (action === 'replace') {
        MANUALS_DATA[brand].items = newItems;
    } else {
        MANUALS_DATA[brand].items = [...MANUALS_DATA[brand].items, ...newItems];
    }
}

function importPhotos(data, action) {
    if (!data || typeof data !== 'object') {
        throw new Error('Neplatný formát fotiek');
    }

    if (data.logoPhoto) {
        appData.logoPhoto = data.logoPhoto;
        if (typeof updateLogoDisplay === 'function') updateLogoDisplay();
    }
    
    if (data.contactPhoto) {
        appData.contactPhoto = data.contactPhoto;
        if (typeof updateContactDisplay === 'function') updateContactDisplay();
    }
    
    if (data.categoryPhotos && typeof data.categoryPhotos === 'object') {
        Object.entries(data.categoryPhotos).forEach(([catId, photo]) => {
            const cat = appData.categories.find(c => c.id === catId);
            if (cat) {
                cat.iconPhoto = photo;
            }
        });
        if (typeof renderCategories === 'function') renderCategories();
    }
    
    if (typeof loadPhotos === 'function') loadPhotos();
}

function updateExportOptions() {
    const type = document.querySelector('input[name="exportType"]:checked')?.value || 'all';
    const selectSection = document.getElementById('exportSelectSection');
    const brandSection = document.getElementById('exportBrandSection');

    if (selectSection) selectSection.classList.add('hidden');
    if (brandSection) brandSection.classList.add('hidden');

    if (type === 'category') {
        if (selectSection) selectSection.classList.remove('hidden');
        const select = document.getElementById('exportSelect');
        if (select) {
            select.innerHTML = appData.categories.map(cat => {
                const t = cat.translations[appData.currentLang] || cat.translations.de || { name: cat.id };
                return '<option value="' + cat.id + '">' + t.name + '</option>';
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
                        const t = diag.translations[appData.currentLang] || diag.translations.de || { title: diag.id };
                        options += '<option value="' + cat.id + ':' + diag.id + '">' + (t.title || diag.id) + '</option>';
                    });
                }
            });
            select.innerHTML = options || '<option value="">Žiadne stromy</option>';
        }
    } else if (type === 'errors' || type === 'manuals') {
        if (brandSection) brandSection.classList.remove('hidden');
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
            data = { 
                categories: appData.categories.map(c => ({ 
                    id: c.id, 
                    diagnoses: c.diagnoses || [] 
                })) 
            };
            break;
        case 'errors': {
            const errorBrand = document.querySelector('#exportBrandGrid .selected')?.dataset.brand;
            data = errorBrand ? { [errorBrand]: appData.errorCodes?.[errorBrand] || [] } : (appData.errorCodes || {});
            break;
        }
        case 'manuals': {
            const manualBrand = document.querySelector('#exportBrandGrid .selected')?.dataset.brand;
            data = manualBrand ? { [manualBrand]: window.MANUALS_DATA?.[manualBrand] } : (window.MANUALS_DATA || {});
            break;
        }
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
        case 'category': {
            const catId = document.getElementById('exportSelect')?.value;
            const cat = appData.categories.find(c => c.id === catId);
            data = cat || {};
            break;
        }
        case 'tree': {
            const value = document.getElementById('exportSelect')?.value || '';
            const parts = value.split(':');
            const treeCatId = parts[0];
            const treeId = parts[1];
            const treeCat = appData.categories.find(c => c.id === treeCatId);
            data = treeCat?.diagnoses?.find(d => d.id === treeId) || {};
            break;
        }
    }

    const jsonString = format === 'pretty' ? JSON.stringify(data, null, 2) : JSON.stringify(data);

    const resultDiv = document.getElementById('exportResult');
    if (resultDiv) {
        resultDiv.textContent = jsonString;
    }

    navigator.clipboard.writeText(jsonString).then(() => {
        showNotification('Skopírované do schránky');
    }).catch(err => {
        console.error('Clipboard error:', err);
        showNotification('Skopírujte manuálne', 'error');
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
    a.download = 'diagnostika-export-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Súbor stiahnutý');
}
