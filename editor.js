// Editor funkcie - Fixed Version 5.5

function openEditor() {
    closeAdminModal();
    
    const views = ['categoriesView', 'electricView', 'diagnosesView', 'errorCodesView', 'wizardView'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    const editorView = document.getElementById('editorView');
    if (editorView) {
        editorView.classList.remove('hidden');
    }
    
    renderEditorTrees();
}

function switchEditorTab(tab) {
    document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    }

    if (tab === 'trees') {
        renderEditorTrees();
    } else if (tab === 'languages') {
        renderEditorLanguages();
    } else if (tab === 'errors' || tab === 'errorcodes') {
        renderEditorErrorCodes();
    } else if (tab === 'categories') {
        renderEditorCategories();
    }
}

function renderEditorTrees() {
    const content = document.getElementById('editorContent');
    if (!content) return;
    
    content.innerHTML = '<h2 style="margin-bottom: 15px; font-size: 1.2em;">Stromy</h2>';

    let hasTrees = false;
    
    appData.categories.forEach(cat => {
        if (!cat.diagnoses || cat.diagnoses.length === 0) return;
        
        hasTrees = true;

        const catDiv = document.createElement('div');
        catDiv.style.marginBottom = '20px';
        
        const catName = (cat.translations?.sk || cat.translations?.de)?.name || cat.id;
        catDiv.innerHTML = `<h3 style="color: #60a5fa; margin-bottom: 10px; font-size: 1em;">${catName}</h3>`;

        cat.diagnoses.forEach(diag => {
            const diagTitle = (diag.translations?.sk || diag.translations?.de)?.title || diag.id;
            const diagDiv = document.createElement('div');
            diagDiv.className = 'node-editor';
            diagDiv.style.padding = '12px';
            diagDiv.style.marginBottom = '10px';
            diagDiv.innerHTML = `
                <div class="node-header" style="font-size: 0.95em; margin-bottom: 10px;">${diagTitle}</div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-add" style="padding: 8px 16px; font-size: 0.85em;" onclick="editTree('${diag.id}')">Editovať</button>
                    <button class="btn-delete" style="padding: 8px 16px; font-size: 0.85em;" onclick="deleteTree('${diag.id}')">Zmazať</button>
                </div>
            `;
            catDiv.appendChild(diagDiv);
        });

        content.appendChild(catDiv);
    });
    
    if (!hasTrees) {
        content.innerHTML += '<p style="color: var(--text-muted);">Žiadne stromy na zobrazenie.</p>';
    }

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-save';
    backBtn.textContent = 'Späť';
    backBtn.onclick = showCategories;
    backBtn.style.marginTop = '20px';
    content.appendChild(backBtn);
}

function renderEditorLanguages() {
    const content = document.getElementById('editorContent');
    if (!content) return;
    
    content.innerHTML = '<h2 style="margin-bottom: 15px; font-size: 1.2em;">Jazyky</h2>';

    appData.categories.forEach(cat => {
        if (!cat.diagnoses) return;
        
        cat.diagnoses.forEach(diag => {
            const diagTitle = (diag.translations?.sk || diag.translations?.de)?.title || diag.id;
            const div = document.createElement('div');
            div.className = 'node-editor';
            div.style.padding = '12px';
            div.style.marginBottom = '10px';
            
            let translationsHtml = '';
            Object.keys(appData.languages).forEach(lang => {
                const flagUrl = CONFIG.FLAG_URLS[lang];
                const langName = appData.languages[lang].name;
                const translation = diag.translations?.[lang]?.title || '';
                
                translationsHtml += `
                    <div class="input-group" style="margin-bottom: 8px;">
                        <label style="font-size: 0.8em; display: flex; align-items: center; gap: 6px;">
                            <img src="${flagUrl}" style="width: 16px; height: 12px; border-radius: 2px;"> 
                            ${langName}
                        </label>
                        <input type="text" value="${translation}" 
                            onchange="updateTranslation('${diag.id}', '${lang}', 'title', this.value)" 
                            style="padding: 8px; font-size: 0.9em; width: 100%;">
                    </div>
                `;
            });
            
            div.innerHTML = `
                <div class="node-header" style="font-size: 0.95em; margin-bottom: 10px;">${diagTitle}</div>
                ${translationsHtml}
            `;
            content.appendChild(div);
        });
    });

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-save';
    backBtn.textContent = 'Späť';
    backBtn.onclick = showCategories;
    backBtn.style.marginTop = '20px';
    content.appendChild(backBtn);
}

function renderEditorErrorCodes() {
    const content = document.getElementById('editorContent');
    if (!content) return;
    
    content.innerHTML = '<h2 style="margin-bottom: 15px; font-size: 1.2em;">Chybové kódy</h2>';

    if (!appData.errorCodes || Object.keys(appData.errorCodes).length === 0) {
        content.innerHTML += '<p style="color: var(--text-muted);">Žiadne kódy.</p>';
    } else {
        Object.entries(appData.errorCodes).forEach(([code, ec]) => {
            const div = document.createElement('div');
            div.className = 'node-editor';
            div.style.padding = '12px';
            div.style.marginBottom = '10px';
            div.innerHTML = `
                <div style="font-weight: bold; color: #dc2626; margin-bottom: 8px; font-size: 0.95em;">${code}</div>
                <div style="font-size: 0.85em; color: #6b7280; margin-bottom: 8px;">${ec.device || 'Neznáme zariadenie'}</div>
                <button class="btn-delete" style="padding: 6px 12px; font-size: 0.8em;" onclick="deleteErrorCode('${code}')">Zmazať</button>
            `;
            content.appendChild(div);
        });
    }

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-save';
    backBtn.textContent = 'Späť';
    backBtn.onclick = showCategories;
    backBtn.style.marginTop = '20px';
    content.appendChild(backBtn);
}

function renderEditorCategories() {
    const content = document.getElementById('editorContent');
    if (!content) return;
    
    content.innerHTML = '<h2 style="margin-bottom: 15px; font-size: 1.2em;">Kategórie</h2>';
    
    appData.categories.forEach(cat => {
        const catName = (cat.translations?.sk || cat.translations?.de)?.name || cat.id;
        const div = document.createElement('div');
        div.className = 'node-editor';
        div.style.padding = '12px';
        div.style.marginBottom = '10px';
        div.innerHTML = `
            <div style="font-weight: bold; color: #3b82f6; margin-bottom: 8px; font-size: 0.95em;">
                ${cat.icon || '🔧'} ${catName}
            </div>
            <div style="font-size: 0.85em; color: #6b7280;">
                ID: ${cat.id} | Stromy: ${cat.diagnoses ? cat.diagnoses.length : 0}
            </div>
        `;
        content.appendChild(div);
    });

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-save';
    backBtn.textContent = 'Späť';
    backBtn.onclick = showCategories;
    backBtn.style.marginTop = '20px';
    content.appendChild(backBtn);
}

function deleteErrorCode(code) {
    if (!confirm('Zmazať kód ' + code + '?')) return;
    
    if (appData.errorCodes) {
        delete appData.errorCodes[code];
        saveDataToStorage();
        renderEditorErrorCodes();
        showNotification('Kód zmazaný');
    }
}

function editTree(diagId) {
    currentEditingTree = diagId;
    const tree = findTree(diagId);
    
    if (!tree) {
        showNotification('Strom nebol nájdený', 'error');
        return;
    }
    
    const content = document.getElementById('editorContent');
    if (!content) return;
    
    content.innerHTML = `
        <h2 style="margin-bottom: 15px; font-size: 1.2em;">Editovať strom</h2>
        <div class="input-group">
            <label>JSON:</label>
            <textarea id="treeEditCode" style="min-height: 300px; font-family: monospace; font-size: 12px; width: 100%; padding: 10px;">${JSON.stringify(tree, null, 2)}</textarea>
        </div>
        <button class="btn-save" onclick="saveTreeEdit()" style="margin-right: 10px;">
            <span>💾</span> Uložiť
        </button>
        <button class="btn-secondary" onclick="renderEditorTrees()" style="margin-top: 10px;">
            Zrušiť
        </button>
    `;
}

function saveTreeEdit() {
    try {
        const treeEditCode = document.getElementById('treeEditCode');
        if (!treeEditCode) return;
        
        const newData = JSON.parse(treeEditCode.value);
        
        for (let cat of appData.categories) {
            if (!cat.diagnoses) continue;
            const idx = cat.diagnoses.findIndex(d => d.id === currentEditingTree);
            if (idx >= 0) {
                cat.diagnoses[idx] = newData;
                break;
            }
        }
        
        saveDataToStorage();
        showNotification('Uložené!');
        renderEditorTrees();
    } catch (err) {
        showNotification('Chyba v JSON: ' + err.message, 'error');
    }
}

function updateTranslation(diagId, lang, field, value) {
    for (let cat of appData.categories) {
        if (!cat.diagnoses) continue;
        const diag = cat.diagnoses.find(d => d.id === diagId);
        if (diag) {
            if (!diag.translations) diag.translations = {};
            if (!diag.translations[lang]) diag.translations[lang] = {};
            diag.translations[lang][field] = value;
            saveDataToStorage();
            break;
        }
    }
}

function deleteTree(diagId) {
    if (!confirm('Naozaj zmazať tento strom?')) return;
    
    for (let cat of appData.categories) {
        if (!cat.diagnoses) continue;
        const idx = cat.diagnoses.findIndex(d => d.id === diagId);
        if (idx >= 0) {
            cat.diagnoses.splice(idx, 1);
            saveDataToStorage();
            renderEditorTrees();
            if (typeof renderCategories === 'function') renderCategories();
            showNotification('Strom zmazaný');
            break;
        }
    }
}
