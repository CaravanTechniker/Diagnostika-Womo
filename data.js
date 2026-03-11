// Globálne premenné
let appData = loadDataFromStorage();
let currentCategory = null;
let currentDiagnosis = null;
let currentStep = 0;
let pathHistory = [];
let currentEditingTree = null;
let currentSection = 'diagnostic';
let isAdminLoggedIn = false;
let isEditMode = false;

// Načítanie dát z localStorage
function loadDataFromStorage() {
    try {
        const stored = localStorage.getItem('caravanDiagnosticData');
        if (stored) {
            const parsed = JSON.parse(stored);
            return mergeWithDefault(parsed);
        }
    } catch (e) {
        console.error('Error loading from storage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
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