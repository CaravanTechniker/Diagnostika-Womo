// Globálne premenné a dátové funkcie - Fixed Version 5.5

let appData = loadDataFromStorage();
let currentDiagnosis = null;
let currentStep = 0;
let pathHistory = [];
let currentEditingTree = null;
let currentSection = 'diagnostic';

function loadDataFromStorage() {
    try {
        const stored = localStorage.getItem('caravanDiagnosticData');
        if (stored) {
            const parsed = JSON.parse(stored);
            const merged = mergeWithDefault(parsed);
            migrateEblDiagnoses(merged);
            return merged;
        }
    } catch (e) {
        console.error('Error loading from storage:', e);
    }

    const fallback = JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
    migrateEblDiagnoses(fallback);
    return fallback;
}

function saveDataToStorage() {
    try {
        localStorage.setItem('caravanDiagnosticData', JSON.stringify(appData));
    } catch (e) {
        console.error('Error saving to storage:', e);
        if (e.name === 'QuotaExceededError') {
            showNotification('Úložisko je plné. Zmažte niektoré fotky.', 'error');
        } else {
            alert('Chyba pri ukladaní dát.');
        }
    }
}

function mergeWithDefault(stored) {
    const merged = JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
    
    if (!stored || typeof stored !== 'object') return merged;
    
    if (stored.languages) merged.languages = stored.languages;
    if (stored.currentLang) merged.currentLang = stored.currentLang;
    if (stored.logoPhoto !== undefined) merged.logoPhoto = stored.logoPhoto;
    if (stored.contactPhoto !== undefined) merged.contactPhoto = stored.contactPhoto;
    if (stored.headerPhoto !== undefined) merged.headerPhoto = stored.headerPhoto;

    if (stored.categories && Array.isArray(stored.categories)) {
        stored.categories.forEach((storedCat, idx) => {
            if (merged.categories[idx]) {
                if (storedCat.iconPhoto !== undefined) {
                    merged.categories[idx].iconPhoto = storedCat.iconPhoto;
                }
                if (storedCat.diagnoses && Array.isArray(storedCat.diagnoses)) {
                    merged.categories[idx].diagnoses = storedCat.diagnoses;
                }
                if (storedCat.eblBrands) {
                    merged.categories[idx].eblBrands = storedCat.eblBrands;
                }
            }
        });
    }

    if (stored.errorCodes) merged.errorCodes = stored.errorCodes;
    
    return merged;
}

function normalizeEblText(value) {
    if (!value) return '';
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isEblDiagnosis(diag) {
    if (!diag || typeof diag !== 'object') return false;
    
    const haystack = [
        diag.id,
        diag.title,
        diag.name,
        diag.desc,
        diag.description,
        diag.device,
        diag.brand
    ].map(normalizeEblText).join(' ');

    return (
        haystack.includes('ebl') ||
        haystack.includes('nordelettronica') ||
        haystack.includes('nord elettronica') ||
        haystack.includes('nordellettronica') ||
        haystack.includes('schaudt') ||
        haystack.includes('cbe')
    );
}

function migrateEblDiagnoses(data) {
    if (!data || !Array.isArray(data.categories)) return;

    const elektroCat = data.categories.find(cat => cat.id === 'elektro');
    const eblCat = data.categories.find(cat => cat.id === 'ebl');

    if (!elektroCat || !eblCat) return;

    if (!Array.isArray(elektroCat.diagnoses)) elektroCat.diagnoses = [];
    if (!Array.isArray(eblCat.diagnoses)) eblCat.diagnoses = [];

    const keepInElektro = [];
    const moveToEbl = [];

    for (const diag of elektroCat.diagnoses) {
        if (isEblDiagnosis(diag)) {
            moveToEbl.push(diag);
        } else {
            keepInElektro.push(diag);
        }
    }

    elektroCat.diagnoses = keepInElektro;

    for (const diag of moveToEbl) {
        const exists = eblCat.diagnoses.some(existing => existing.id === diag.id);
        if (!exists) {
            eblCat.diagnoses.push(diag);
        }
    }
}

function findTree(treeId) {
    if (!treeId) return null;
    
    for (let cat of appData.categories) {
        if (!cat.diagnoses) continue;
        const diag = cat.diagnoses.find(d => d.id === treeId);
        if (diag) return diag;
    }
    return null;
}

function findErrorCode(code) {
    if (!code) return null;
    
    const upperCode = code.toUpperCase();
    
    if (appData.errorCodes) {
        if (appData.errorCodes[upperCode]) {
            return appData.errorCodes[upperCode];
        }
        
        for (const [key, value] of Object.entries(appData.errorCodes)) {
            if (key.toUpperCase() === upperCode) {
                return value;
            }
        }
    }

    for (let cat of appData.categories) {
        if (cat.errorCodeBrands) {
            for (let brand in cat.errorCodeBrands) {
                const brandData = cat.errorCodeBrands[brand];
                if (brandData && brandData.codes && Array.isArray(brandData.codes)) {
                    const found = brandData.codes.find(c => 
                        c.code && c.code.toUpperCase() === upperCode
                    );
                    if (found) return found;
                }
            }
        }
    }

    return null;
}
