// UI funkcie

function init() {
    updateFlagDisplay();
    updateLanguage();
    renderCategories();
    populateExportSelects();
    loadPhotos();
    initBrandGrid();
    updateAdminStatus();
    
    const adminSession = sessionStorage.getItem('adminSession');
    if (adminSession === 'true') {
        isAdminLoggedIn = true;
        document.getElementById('appContainer').classList.add('admin-mode');
    }
}

function updateLanguage() {
    const lang = appData.currentLang;
    const t = UI_TRANSLATIONS[lang];
    
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (t[key]) el.textContent = t[key];
    });
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t.search || 'Hľadať...';
}

function showSection(section) {
    currentSection = section;
    
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === section) {
            btn.classList.add('active');
        }
    });
    
    document.getElementById('categoriesView').classList.add('hidden');
    document.getElementById('electricView').classList.add('hidden');
    document.getElementById('diagnosesView').classList.add('hidden');
    document.getElementById('errorCodesView').classList.add('hidden');
    document.getElementById('wizardView').classList.add('hidden');
    document.getElementById('editorView').classList.add('hidden');
    
    switch(section) {
        case 'diagnostic':
            showCategories();
            break;
        case 'errorcodes':
            showErrorCodesSection();
            break;
        case 'devices':
        case 'measurements':
        case 'ebl':
            alert('Sekcia sa pripravuje');
            showCategories();
            break;
    }
}

function showMainMenu() {
    showSection('diagnostic');
}

function renderCategories() {
    const list = document.getElementById('categoriesList');
    const lang = appData.currentLang;
    
    list.innerHTML = appData.categories.map(cat => {
        const t = cat.translations[lang] || cat.translations['de'];
        const count = cat.diagnoses ? cat.diagnoses.length : 0;
        const countText = count === 1 ? '1 strom' : count + ' stromov';
        
        const iconContent = cat.iconPhoto ? 
            `<img src="${cat.iconPhoto}" alt="">` : 
            `<span>${cat.icon}</span>`;
        
        return `
            <div class="category-item" onclick="showCategoryContent('${cat.id}')">
                <div class="category-icon" onclick="editCategoryPhoto('${cat.id}')">
                    ${iconContent}
                    <span class="edit-badge">UPRAVIT</span>
                </div>
                <div class="category-info">
                    <div class="category-name">${t.name}</div>
                    <div class="category-count">${countText}</div>
                </div>
                <div class="category-arrow">›</div>
            </div>
        `;
    }).join('');
}

function showCategoryContent(categoryId) {
    if (categoryId === 'elektro') {
        showElectricSubcategories();
    } else {
        showDiagnoses(categoryId);
    }
}

function showElectricSubcategories() {
    document.getElementById('categoriesView').classList.add('hidden');
    document.getElementById('electricView').classList.remove('hidden');
    document.getElementById('diagnosesView').classList.add('hidden');
    document.getElementById('errorCodesView').classList.add('hidden');
    document.getElementById('wizardView').classList.add('hidden');
    document.getElementById('editorView').classList.add('hidden');
    
    const container = document.getElementById('electricSubcategories');
    const lang = appData.currentLang;
    
    container.innerHTML = CONFIG.ELECTRIC_SUBCATEGORIES.map(sub => {
        const elektroCat = appData.categories.find(c => c.id === 'elektro');
        const count = elektroCat && elektroCat.diagnoses ? 
            elektroCat.diagnoses.filter(d => TREE_TO_SUBCATEGORY[d.id] === sub.id).length : 0;
        
        return `
            <div class="subcategory-item" onclick="showElectricTrees('${sub.id}')">
                <span class="subcategory-icon">${sub.icon}</span>
                <div style="flex: 1;">
                    <div class="subcategory-name">${sub.name}</div>
                    <div style="color: #60a5fa; font-size: 0.85em; font-weight: 600;">${count} stromov</div>
                </div>
                <span style="color: #9ca3af;">›</span>
            </div>
        `;
    }).join('');
}

function showElectricTrees(subcategoryId) {
    currentCategory = 'elektro';
    const elektroCat = appData.categories.find(c => c.id === 'elektro');
    const lang = appData.currentLang;
    const sub = CONFIG.ELECTRIC_SUBCATEGORIES.find(s => s.id === subcategoryId);
    
    document.getElementById('electricView').classList.add('hidden');
    document.getElementById('diagnosesView').classList.remove('hidden');
    
    document.getElementById('currentCategoryName').textContent = 'Elektrina › ' + sub.name;
    
    const list = document.getElementById('diagnosesList');
    const trees = elektroCat && elektroCat.diagnoses ? 
        elektroCat.diagnoses.filter(d => TREE_TO_SUBCATEGORY[d.id] === subcategoryId) : [];
    
    if (trees.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280;">Žiadne stromy v tejto kategórii</div>';
    } else {
        list.innerHTML = trees.map(d => {
            const dt = d.translations[lang] || d.translations['de'];
            return `
                <div class="diagnosis-item" onclick="startWizard('${d.id}')">
                    <div class="diagnosis-title">${dt.title}</div>
                    <span style="color: #9ca3af;">›</span>
                </div>
            `;
        }).join('');
    }
}

function showDiagnoses(categoryId) {
    currentCategory = categoryId;
    const cat = appData.categories.find(c => c.id === categoryId);
    const lang = appData.currentLang;
    const t = cat.translations[lang] || cat.translations['de'];
    
    document.getElementById('categoriesView').classList.add('hidden');
    document.getElementById('electricView').classList.add('hidden');
    document.getElementById('diagnosesView').classList.remove('hidden');
    document.getElementById('errorCodesView').classList.add('hidden');
    document.getElementById('wizardView').classList.add('hidden');
    document.getElementById('editorView').classList.add('hidden');
    
    document.getElementById('currentCategoryName').textContent = t.name;
    
    const list = document.getElementById('diagnosesList');
    if (!cat.diagnoses || cat.diagnoses.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280;">Žiadne stromy v tejto kategórii</div>';
    } else {
        list.innerHTML = cat.diagnoses.map(d => {
            const dt = d.translations[lang] || d.translations['de'];
            return `
                <div class="diagnosis-item" onclick="startWizard('${d.id}')">
                    <div class="diagnosis-title">${dt.title}</div>
                    <span style="color: #9ca3af;">›</span>
                </div>
            `;
        }).join('');
    }
}

function showCategories() {
    document.getElementById('categoriesView').classList.remove('hidden');
    document.getElementById('electricView').classList.add('hidden');
    document.getElementById('diagnosesView').classList.add('hidden');
    document.getElementById('errorCodesView').classList.add('hidden');
    document.getElementById('wizardView').classList.add('hidden');
    document.getElementById('editorView').classList.add('hidden');
    currentCategory = null;
    currentDiagnosis = null;
}

function showErrorCodesSection() {
    document.getElementById('categoriesView').classList.add('hidden');
    document.getElementById('electricView').classList.add('hidden');
    document.getElementById('diagnosesView').classList.add('hidden');
    document.getElementById('errorCodesView').classList.remove('hidden');
    document.getElementById('wizardView').classList.add('hidden');
    document.getElementById('editorView').classList.add('hidden');
    
    const content = document.getElementById('errorCodesContent');
    content.innerHTML = `
        <div class="error-search-box">
            <div style="font-weight: 600; margin-bottom: 10px; color: #374151;">Vyhľadať chybový kód:</div>
            <input type="text" class="error-search-input" id="errorCodeSearch" placeholder="Zadajte kód (napr. E212H)" onkeypress="if(event.key==='Enter') searchErrorCode(this.value)">
            <button class="btn-primary" onclick="searchErrorCode(document.getElementById('errorCodeSearch').value)" style="margin-top: 10px;">
                Vyhľadať
            </button>
        </div>
        <div id="errorCodeResult"></div>
    `;
}

function searchErrorCode(code) {
    if (!code.trim()) return;
    
    const resultDiv = document.getElementById('errorCodeResult');
    const found = findErrorCode(code.trim().toUpperCase());
    
    if (found) {
        const lang = appData.currentLang;
        const et = found.translations[lang] || found.translations['de'] || found.translations['sk'];
        const severityClass = 'severity-' + found.severity;
        const severityText = found.severity === 'high' ? 'Vysoká' : (found.severity === 'medium' ? 'Stredná' : 'Nízka');
        
        resultDiv.innerHTML = `
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-top: 15px;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <span class="error-code" style="font-size: 1.3em;">${found.code}</span>
                    <span class="error-severity ${severityClass}">${severityText}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <div style="color: #6b7280; font-size: 0.85em; margin-bottom: 4px;">Zariadenie:</div>
                    <div style="font-weight: 600;">${found.device}</div>
                </div>
                <div style="margin-bottom: 10px;">
                    <div style="color: #6b7280; font-size: 0.85em; margin-bottom: 4px;">Popis:</div>
                    <div>${et.description}</div>
                </div>
                <div>
                    <div style="color: #6b7280; font-size: 0.85em; margin-bottom: 4px;">Riešenie:</div>
                    <div>${et.solution}</div>
                </div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = '<div style="text-align: center; padding: 30px; color: #6b7280;">Kód nebol nájdený</div>';
    }
}

function handleSearch(query) {
    if (!query.trim()) {
        if (currentCategory) {
            showDiagnoses(currentCategory);
        } else {
            renderCategories();
        }
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const lang = appData.currentLang;
    
    let results = [];
    appData.categories.forEach(cat => {
        if (cat.diagnoses) {
            cat.diagnoses.forEach(diag => {
                const t = diag.translations[lang] || diag.translations['de'];
                if (t && t.title && t.title.toLowerCase().includes(lowerQuery)) {
                    results.push({ diag, cat });
                }
            });
        }
    });
    
    const list = document.getElementById('diagnosesList');
    document.getElementById('categoriesView').classList.add('hidden');
    document.getElementById('electricView').classList.add('hidden');
    document.getElementById('diagnosesView').classList.remove('hidden');
    document.getElementById('errorCodesView').classList.add('hidden');
    document.getElementById('wizardView').classList.add('hidden');
    document.getElementById('editorView').classList.add('hidden');
    
    document.getElementById('currentCategoryName').textContent = 'Výsledky vyhľadávania: "' + query + '"';
    
    if (results.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280;">Žiadne výsledky</div>';
    } else {
        list.innerHTML = results.map(r => {
            const dt = r.diag.translations[lang] || r.diag.translations['de'];
            return `
                <div class="diagnosis-item" onclick="startWizardFromSearch('${r.diag.id}', '${r.cat.id}')">
                    <div class="diagnosis-title">${dt.title}</div>
                    <div style="color: #9ca3af; font-size: 0.85em;">${r.cat.translations[lang].name}</div>
                </div>
            `;
        }).join('');
    }
}

function startWizardFromSearch(diagId, catId) {
    currentCategory = catId;
    startWizard(diagId);
}