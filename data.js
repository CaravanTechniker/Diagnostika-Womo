// Globálne premenné - ODSTRÁNENÉ DUPLICITNÉ DEKLARÁCIE
// Tieto sú definované v app.js:
// let currentPhotoData = null;
// let currentPhotoTargetType = null;
// let currentPhotoTargetId = null;
// let isAdminLoggedIn = false;
// let isEditMode = false;
// let currentCategory = null;

let appData = loadDataFromStorage();
let currentDiagnosis = null;
let currentStep = 0;
let pathHistory = [];
let currentEditingTree = null;
let currentSection = 'diagnostic';

// Načítanie dát z localStorage
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

// Uloženie dát do localStorage
function saveDataToStorage() {
    try {
        localStorage.setItem('caravanDiagnosticData', JSON.stringify(appData));
    } catch (e) {
        console.error('Error saving to storage:', e);
        alert('Chyba pri ukladaní dát.');
    }
}

// Merge uložených dát s defaultnými
function mergeWithDefault(stored) {
    const merged = JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
    if (stored.languages) merged.languages = stored.languages;
    if (stored.currentLang) merged.currentLang = stored.currentLang;
    if (stored.headerPhoto !== undefined) merged.headerPhoto = stored.headerPhoto;
    if (stored.contactPhoto !== undefined) merged.contactPhoto = stored.contactPhoto;

    if (stored.categories) {
        stored.categories.forEach((storedCat, idx) => {
            if (merged.categories[idx]) {
                if (storedCat.iconPhoto !== undefined) {
                    merged.categories[idx].iconPhoto = storedCat.iconPhoto;
                }
                if (storedCat.diagnoses) {
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
    return (value || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isEblDiagnosis(diag) {
    const haystack = [
        diag?.id,
        diag?.title,
        diag?.name,
        diag?.desc,
        diag?.description,
        diag?.device,
        diag?.brand
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

// Nájdenie stromu podľa ID
function findTree(treeId) {
    for (let cat of appData.categories) {
        if (!cat.diagnoses) continue;
        const diag = cat.diagnoses.find(d => d.id === treeId);
        if (diag) return diag;
    }
    return null;
}

// Nájdenie chybového kódu
function findErrorCode(code) {
    if (appData.errorCodes && appData.errorCodes[code]) {
        return appData.errorCodes[code];
    }

    for (let cat of appData.categories) {
        if (cat.errorCodeBrands) {
            for (let brand in cat.errorCodeBrands) {
                const codes = cat.errorCodeBrands[brand].codes || [];
                const found = codes.find(c => c.code === code);
                if (found) return found;
            }
        }
    }

    return null;
}
