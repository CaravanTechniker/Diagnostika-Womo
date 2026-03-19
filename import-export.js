// Import a export funkcie

function openExportModal() {
    closeAdminModal();
    document.getElementById('exportModal').classList.add('active');
    updateExportOptions();
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
}

function openImportModal() {
    closeAdminModal();
    document.getElementById('importModal').classList.add('active');
    document.getElementById('importBrandSection').classList.add('hidden');
    document.querySelectorAll('.import-type-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('importJson').value = '';
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('active');
}

function selectImportType(type) {
    document.querySelectorAll('.import-type-btn').forEach(btn => btn.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    const brandSection = document.getElementById('importBrandSection');
    
    if (type === 'error' || type === 'manual') {
        brandSection.classList.remove('hidden');
        initBrandGrid('importBrandGrid');
    } else {
        brandSection.classList.add('hidden');
    }
    
    document.getElementById('selectedImportType').value = type;
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

    const type = document.getElementById('selectedImportType').value || 'complete';
    const action = document.getElementById('importAction').value;

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
    loadPhotos();
}

function importComplete(data, action) {
    if (action === 'replace') {
        Object.assign(appData, data);
    } else {
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
