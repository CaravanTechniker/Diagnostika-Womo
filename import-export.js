// Import a export funkcie

function openExportModal() {
    closeAdminModal();
    document.getElementById('exportModal').classList.add('active');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
}

function openImportModal() {
    closeAdminModal();
    document.getElementById('importStep1').classList.remove('hidden');
    document.getElementById('importTreeStep').classList.add('hidden');
    document.getElementById('importErrorStep').classList.add('hidden');
    document.getElementById('importModal').classList.add('active');
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('active');
}

function selectImportType(type) {
    document.getElementById('selectedImportType').value = type;
    
    if (type === 'tree') {
        document.getElementById('importStep1').classList.add('hidden');
        document.getElementById('importTreeStep').classList.remove('hidden');
        document.getElementById('importErrorStep').classList.add('hidden');
        populateReplaceTreeSelect();
        
        document.querySelectorAll('input[name="treeImportAction"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.getElementById('replaceTreeSelect').style.display = this.value === 'replace' ? 'block' : 'none';
            });
        });
    } else if (type === 'errorcodes') {
        document.getElementById('importStep1').classList.add('hidden');
        document.getElementById('importTreeStep').classList.add('hidden');
        document.getElementById('importErrorStep').classList.remove('hidden');
    }
}

function backToImportStep1() {
    document.getElementById('importStep1').classList.remove('hidden');
    document.getElementById('importTreeStep').classList.add('hidden');
    document.getElementById('importErrorStep').classList.add('hidden');
}

function doExport() {
    const treeId = document.getElementById('exportTreeSelect').value;
    const dataToExport = findTree(treeId);
    
    if (!dataToExport) {
        alert('Strom nebol nájdený!');
        return;
    }
    
    const json = JSON.stringify(dataToExport, null, 2);
    document.getElementById('exportCodeDisplay').textContent = json;
    document.getElementById('exportCodeModal').classList.add('active');
    closeExportModal();
}

function closeExportCodeModal() {
    document.getElementById('exportCodeModal').classList.remove('active');
}

function copyExportCode() {
    const text = document.getElementById('exportCodeDisplay').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Kód skopírovaný!');
    });
}

function downloadExportCode() {
    const text = document.getElementById('exportCodeDisplay').textContent;
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'strom.json';
    a.click();
}

function normalizeImportText(value) {
    return (value || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isEblTree(data) {
    const haystack = [
        data?.id,
        data?.title,
        data?.name,
        data?.desc,
        data?.description,
        data?.device,
        data?.brand
    ].map(normalizeImportText).join(' ');
    
    return (
        haystack.includes('ebl') ||
        haystack.includes('nordelettronica') ||
        haystack.includes('nord elettronica') ||
        haystack.includes('nordellettronica') ||
        haystack.includes('schaudt') ||
        haystack.includes('cbe')
    );
}

function getCategoryById(id) {
    return appData.categories.find(c => c.id === id);
}

function getImportTargetCategory(data) {
    const targetId = isEblTree(data) ? 'ebl' : 'elektro';
    return getCategoryById(targetId) || getCategoryById('elektro') || appData.categories[0];
}

function removeDiagnosisFromAllCategories(id) {
    for (const cat of appData.categories) {
        if (!cat.diagnoses) continue;
        cat.diagnoses = cat.diagnoses.filter(d => d.id !== id);
    }
}

function doImportTree() {
    const code = document.getElementById('importTreeCode').value;
    if (!code.trim()) {
        alert('Vložte kód!');
        return;
    }
    
    try {
        const data = JSON.parse(code);
        const action = document.querySelector('input[name="treeImportAction"]:checked').value;
        
        if (action === 'new') {
            if (!data.id || typeof data.id !== 'string' || !data.id.trim()) {
                data.id = 'imported-' + Date.now();
            }
            
            removeDiagnosisFromAllCategories(data.id);
            
            const targetCat = getImportTargetCategory(data);
            if (!targetCat.diagnoses) targetCat.diagnoses = [];
            targetCat.diagnoses.push(data);
        } else {
            const replaceId = document.getElementById('replaceTreeSelect').value;
            let replaced = false;
            
            removeDiagnosisFromAllCategories(replaceId);
            data.id = replaceId;
            
            const targetCat = getImportTargetCategory(data);
            if (!targetCat.diagnoses) targetCat.diagnoses = [];
            targetCat.diagnoses.push(data);
            replaced = true;
            
            if (!replaced) {
                throw new Error('Nepodarilo sa nahradiť vybraný strom.');
            }
        }
        
        saveDataToStorage();
        alert('Import úspešný!');
        renderCategories();
        populateExportSelects();
        closeImportModal();
    } catch (err) {
        alert('Chyba: ' + err.message);
    }
}

function handleTreeFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('importTreeCode').value = e.target.result;
    };
    reader.readAsText(file);
}

function doImportErrorCodes() {
    const code = document.getElementById('importErrorCode').value;
    const brandId = document.getElementById('selectedBrand').value;
    const model = document.getElementById('importDeviceModel').value;
    
    if (!brandId) {
        alert('Vyberte značku!');
        return;
    }
    
    if (!code.trim()) {
        alert('Vložte kód!');
        return;
    }
    
    try {
        const data = JSON.parse(code);
        
        if (!appData.errorCodes) appData.errorCodes = {};
        
        const newCodes = Array.isArray(data) ? data : (data.codes || []);
        
        newCodes.forEach(ec => {
            appData.errorCodes[ec.code] = {
                ...ec,
                device: CONFIG.DEVICE_BRANDS.find(b => b.id === brandId)?.name || brandId,
                brand: brandId,
                model: model || ''
            };
        });
        
        saveDataToStorage();
        alert('Import úspešný!');
        closeImportModal();
    } catch (err) {
        alert('Chyba: ' + err.message);
    }
}

function handleErrorFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('importErrorCode').value = e.target.result;
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (!confirm('Naozaj vymazať všetko?')) return;
    
    appData = JSON.parse(JSON.stringify(DEFAULT_APP_DATA));
    saveDataToStorage();
    
    renderCategories();
    populateExportSelects();
    loadPhotos();
    updateFlagDisplay();
    closeAdminModal();
}
