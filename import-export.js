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
    // Reset
    document.getElementById('importBrandSection').classList.add('hidden');
    document.querySelectorAll('.import-type-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('importJson').value = '';
    document.getElementById('selectedImportType').value = '';
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
    
    // Uložíme typ pre processImport
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
        console.error('Import error:', e);
    }
}

function importTree(data, action) {
    if (!data.id || !data.translations) {
        throw new Error('Neplatný formát stromu - chýba id alebo translations');
    }

    // Nájdeme cieľovú kategóriu
    let category = null;
    
    // Ak strom má categoryId a existuje, použijeme ju
    if (data.categoryId) {
        category = appData.categories.find(c => c.id === data.categoryId);
    }
    
    // Ak nie je categoryId alebo neexistuje, použijeme elektro ako default
    if (!category) {
        // Skúsime nájsť podľa TREE_TO_SUBCATEGORY mapovania
        const subcategoryId = TREE_TO_SUBCATEGORY[data.id];
        if (subcategoryId) {
            category = appData.categories.find(c => c.id === 'elektro');
        }
    }
    
    // Ak stále nemáme kategóriu, použijeme prvú
    if (!category) {
        category = appData.categories[0];
    }

    if (!category.diagnoses) category.diagnoses = [];

    // Kontrola či strom už existuje
    const existingIndex = category.diagnoses.findIndex(d => d.id === data.id);
    const exists = existingIndex >= 0;

    // Vykonáme akciu podľa výberu
    if (action === 'replace' && exists) {
        // Nahradíme existujúci strom
        category.diagnoses[existingIndex] = data;
        showNotification('Strom bol nahradený');
        
    } else if (action === 'merge' && exists) {
        // Spojíme kroky existujúceho a nového stromu
        const existing = category.diagnoses[existingIndex];
        
        // Merge translations
        Object.keys(data.translations).forEach(lang => {
            if (!existing.translations[lang]) {
                existing.translations[lang] = data.translations[lang];
            } else {
                // Merge steps a results
                if (data.translations[lang].steps) {
                    existing.translations[lang].steps = {
                        ...existing.translations[lang].steps,
                        ...data.translations[lang].steps
                    };
                }
                if (data.translations[lang].results) {
                    existing.translations[lang].results = {
                        ...existing.translations[lang].results,
                        ...data.translations[lang].results
                    };
                }
            }
        });
        
        // Merge root properties
        if (data.steps) {
            existing.steps = { ...existing.steps, ...data.steps };
        }
        if (data.results) {
            existing.results = { ...existing.results, ...data.results };
        }
        
        showNotification('Strom bol spojený s existujúcim');
        
    } else if (action === 'new' || !exists) {
        // Pridáme ako nový strom (alebo ak neexistuje pri replace/merge)
        if (exists && action === 'new') {
            // Vygenerujeme nové ID aby sme predišli konfliktu
            data.id = data.id + '-import-' + Date.now();
        }
        
        // Uistíme sa že máme správne categoryId
        data.categoryId = category.id;
        
        category.diagnoses.push(data);
        showNotification('Nový strom bol pridaný');
    }
}

function importErrors(data, action) {
    if (!appData.errorCodes) appData.errorCodes = {};

    const brand = document.querySelector('#importBrandGrid .selected')?.dataset.brand || 'other';

    if (!appData.errorCodes[brand]) {
        appData.errorCodes[brand] = [];
    }

    if (Array.isArray(data)) {
        if (action === 'replace') {
            appData.errorCodes[brand] = data;
        } else {
            // Merge - pridáme len nové kódy
            const existingCodes = new Set(appData.errorCodes[brand].map(e => e.code));
            const newCodes = data.filter(e => !existingCodes.has(e.code));
            appData.errorCodes[brand] = [...appData.errorCodes[brand], ...newCodes];
        }
    } else {
        // Single error code
        const existingIndex = appData.errorCodes[brand].findIndex(e => e.code === data.code);
        if (existingIndex >= 0 && action === 'replace') {
            appData.errorCodes[brand][existingIndex] = data;
        } else if (existingIndex < 0) {
            appData.errorCodes[brand].push(data);
        }
    }
}

function importManual(data, action) {
    const brand = document.querySelector('#importBrandGrid .selected')?.dataset.brand || 'other';

    if (!MANUALS_DATA[brand]) {
        MANUALS_DATA[brand] = { name: brand, items: [] };
    }

    if (Array.isArray(data)) {
        if (action === 'replace') {
            MANUALS_DATA[brand].items = data;
        } else {
            // Merge podľa URL alebo title
            const existingUrls = new Set(MANUALS_DATA[brand].items.map(i => i.url || i.title));
            const newItems = data.filter(i => !existingUrls.has(i.url || i.title));
            MANUALS_DATA[brand].items = [...MANUALS_DATA[brand].items, ...newItems];
        }
    } else {
        // Single manual
        const exists = MANUALS_DATA[brand].items.some(i => 
            (i.url && i.url === data.url) || (i.title && i.title === data.title)
        );
        if (!exists) {
            MANUALS_DATA[brand].items.push(data);
        }
    }
}

function importPhotos(data, action) {
    if (!data || typeof data !== 'object') {
        throw new Error('Neplatný formát fotiek');
    }
    
    if (data.logoPhoto) appData.logoPhoto = data.logoPhoto;
    if (data.contactPhoto) appData.contactPhoto = data.contactPhoto;
    if (data.headerPhoto) appData.headerPhoto = data.headerPhoto;
    
    if (data.categoryPhotos && typeof data.categoryPhotos === 'object') {
        Object.entries(data.categoryPhotos).forEach(([catId, photo]) => {
            const cat = appData.categories.find(c => c.id === catId);
            if (cat) cat.iconPhoto = photo;
        });
    }
    
    // Aktualizujeme zobrazenie
    if (typeof loadPhotos === 'function') loadPhotos();
    if (typeof updateLogoDisplay === 'function') updateLogoDisplay();
}

function importComplete(data, action) {
    if (!data || typeof data !== 'object') {
        throw new Error('Neplatný formát dát');
    }
    
    if (action === 'replace') {
        // Nahradíme všetko, ale zachováme štruktúru
        if (data.categories) {
            data.categories.forEach(newCat => {
                const existing = appData.categories.find(c => c.id === newCat.id);
                if (existing) {
                    existing.diagnoses = newCat.diagnoses || [];
                    existing.iconPhoto = newCat.iconPhoto || existing.iconPhoto;
                    if (newCat.eblBrands) existing.eblBrands = newCat.eblBrands;
                } else {
                    appData.categories.push(newCat);
                }
            });
        }
        if (data.errorCodes) appData.errorCodes = data.errorCodes;
        if (data.languages) appData.languages = data.languages;
        if (data.currentLang) appData.currentLang = data.currentLang;
        if (data.logoPhoto) appData.logoPhoto = data.logoPhoto;
        if (data.contactPhoto) appData.contactPhoto = data.contactPhoto;
        if (data.headerPhoto) appData.headerPhoto = data.headerPhoto;
        
    } else {
        // Merge - pridáme len nové veci
        if (data.categories) {
            data.categories.forEach(newCat => {
                const existing = appData.categories.find(c => c.id === newCat.id);
                if (existing) {
                    // Merge diagnóz
                    if (newCat.diagnoses) {
                        newCat.diagnoses.forEach(newDiag => {
                            const exists = existing.diagnoses?.find(d => d.id === newDiag.id);
                            if (!exists) {
                                if (!existing.diagnoses) existing.diagnoses = [];
                                existing.diagnoses.push(newDiag);
                            }
                        });
                    }
                } else {
                    appData.categories.push(newCat);
                }
            });
        }
        
        // Merge error codes
        if (data.errorCodes) {
            if (!appData.errorCodes) appData.errorCodes = {};
            Object.entries(data.errorCodes).forEach(([brand, codes]) => {
                if (!appData.errorCodes[brand]) {
                    appData.errorCodes[brand] = codes;
                } else {
                    const existingCodes = new Set(appData.errorCodes[brand].map(e => e.code));
                    const newCodes = codes.filter(e => !existingCodes.has(e.code));
                    appData.errorCodes[brand] = [...appData.errorCodes[brand], ...newCodes];
                }
            });
        }
    }
}

function updateExportOptions() {
    const type = document.querySelector('input[name="exportType"]:checked')?.value || 'all';
    const selectSection = document.getElementById('exportSelectSection');
    const brandSection = document.getElementById('exportBrandSection');

    selectSection?.classList.add('hidden');
    brandSection?.classList.add('hidden');

    if (type === 'category') {
        selectSection?.classList.remove('hidden');
        const select = document.getElementById('exportSelect');
        if (select) {
            select.innerHTML = appData.categories.map(cat => {
                const t = cat.translations[appData.currentLang] || cat.translations.de;
                return `<option value="${cat.id}">${t.name}</option>`;
            }).join('');
        }
    } else if (type === 'tree') {
        selectSection?.classList.remove('hidden');
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
        brandSection?.classList.remove('hidden');
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
                    diagnoses: c.diagnoses 
                })) 
            };
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
                headerPhoto: appData.headerPhoto,
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
        showNotification('Chyba pri kopírovaní', 'error');
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
