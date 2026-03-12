// Editor funkcie

function openEditor() {
    closeAdminModal();
    document.getElementById('categoriesView').classList.add('hidden');
    document.getElementById('electricView').classList.add('hidden');
    document.getElementById('diagnosesView').classList.add('hidden');
    document.getElementById('errorCodesView').classList.add('hidden');
    document.getElementById('wizardView').classList.add('hidden');
    document.getElementById('editorView').classList.remove('hidden');
    renderEditorTrees();
}

function switchEditorTab(tab) {
    document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    if (tab === 'trees') {
        renderEditorTrees();
    } else if (tab === 'languages') {
        renderEditorLanguages();
    } else if (tab === 'errorcodes') {
        renderEditorErrorCodes();
    }
}

function renderEditorTrees() {
    const content = document.getElementById('editorContent');
    content.innerHTML = '<h2 style="margin-bottom: 15px; font-size: 1.2em;">Stromy</h2>';

    appData.categories.forEach(cat => {
        if (!cat.diagnoses || cat.diagnoses.length === 0) return;

        const catDiv = document.createElement('div');
        catDiv.style.marginBottom = '20px';
        catDiv.innerHTML = `<h3 style="color: #60a5fa; margin-bottom: 10px; font-size: 1em;">${(cat.translations.sk || cat.translations.de).name}</h3>`;

        cat.diagnoses.forEach(diag => {
            const diagDiv = document.createElement('div');
            diagDiv.className = 'node-editor';
            diagDiv.style.padding = '12px';
            diagDiv.innerHTML = `
                <div class="node-header" style="font-size: 0.95em; margin-bottom: 10px;">${(diag.translations.sk || diag.translations.de).title}</div>
                <button class="btn-add" style="padding: 8px 16px; font-size: 0.85em;" onclick="editTree('${diag.id}')">Editovať</button>
                <button class="btn-delete" style="padding: 8px 16px; font-size: 0.85em;" onclick="deleteTree('${diag.id}')">Zmazať</button>
            `;
            catDiv.appendChild(diagDiv);
        });

        content.appendChild(catDiv);
    });

    content.innerHTML += `<button class="btn-save" onclick="showCategories()">Späť</button>`;
}

function renderEditorLanguages() {
    const content = document.getElementById('editorContent');
    content.innerHTML = '<h2 style="margin-bottom: 15px; font-size: 1.2em;">Jazyky</h2>';

    appData.categories.forEach(cat => {
        if (!cat.diagnoses) return;
        cat.diagnoses.forEach(diag => {
            const div = document.createElement('div');
            div.className = 'node-editor';
            div.style.padding = '12px';
            div.innerHTML = `
                <div class="node-header" style="font-size: 0.95em; margin-bottom: 10px;">${(diag.translations.sk || diag.translations.de).title}</div>
                ${Object.keys(appData.languages).map(lang => `
                    <div class="input-group" style="margin-bottom: 8px;">
                        <label style="font-size: 0.8em;"><img src="${CONFIG.FLAG_URLS[lang]}" style="width: 16px; height: 12px; vertical-align: middle; margin-right: 4px; border-radius: 2px;"> ${appData.languages[lang].name}</label>
                        <input type="text" value="${(diag.translations[lang] || diag.translations.de)?.title || ''}" 
                            onchange="updateTranslation('${diag.id}', '${lang}', 'title', this.value)" style="padding: 8px; font-size: 0.9em;">
                    </div>
                `).join('')}
            `;
            content.appendChild(div);
        });
    });

    content.innerHTML += `<button class="btn-save" onclick="showCategories()">Späť</button>`;
}

function renderEditorErrorCodes() {
    const content = document.getElementById('editorContent');
    content.innerHTML = '<h2 style="margin-bottom: 15px; font-size: 1.2em;">Chybové kódy</h2>';

    if (!appData.errorCodes || Object.keys(appData.errorCodes).length === 0) {
        content.innerHTML += '<p>Žiadne kódy.</p>';
    } else {
        Object.entries(appData.errorCodes).forEach(([code, ec]) => {
            const div = document.createElement('div');
            div.className = 'node-editor';
            div.style.padding = '12px';
            div.innerHTML = `
                <div style="font-weight: bold; color: #dc2626; margin-bottom: 8px; font-size: 0.95em;">${code}</div>
                <div style="font-size: 0.85em; color: #6b7280; margin-bottom: 8px;">${ec.device}</div>
                <button class="btn-delete" style="padding: 6px 12px; font-size: 0.8em;" onclick="deleteErrorCode('${code}')">Zmazať</button>
            `;
            content.appendChild(div);
        });
    }

    content.innerHTML += `<button class="btn-save" onclick="showCategories()">Späť</button>`;
}

function deleteErrorCode(code) {
    if (!confirm('Zmazať kód ' + code + '?')) return;
    delete appData.errorCodes[code];
    saveDataToStorage();
    renderEditorErrorCodes();
}

function editTree(diagId) {
    currentEditingTree = diagId;
    const tree = findTree(diagId);
    document.getElementById('treeEditCode').value = JSON.stringify(tree, null, 2);
    document.getElementById('editTreeModal').classList.add('active');
}

function closeEditTreeModal() {
    document.getElementById('editTreeModal').classList.remove('active');
}

function saveTreeEdit() {
    try {
        const newData = JSON.parse(document.getElementById('treeEditCode').value);
        for (let cat of appData.categories) {
            if (!cat.diagnoses) continue;
            const idx = cat.diagnoses.findIndex(d => d.id === currentEditingTree);
            if (idx >= 0) {
                cat.diagnoses[idx] = newData;
                break;
            }
        }
        saveDataToStorage();
        alert('Uložené!');
        closeEditTreeModal();
        renderEditorTrees();
    } catch (err) {
        alert('Chyba v JSON: ' + err.message);
    }
}

function updateTranslation(diagId, lang, field, value) {
    for (let cat of appData.categories) {
        if (!cat.diagnoses) continue;
        const diag = cat.diagnoses.find(d => d.id === diagId);
        if (diag) {
            if (!diag.translations[lang]) diag.translations[lang] = {};
            diag.translations[lang][field] = value;
            saveDataToStorage();
            break;
        }
    }
}

function deleteTree(diagId) {
    if (!confirm('Naozaj zmazať?')) return;
    for (let cat of appData.categories) {
        if (!cat.diagnoses) continue;
        const idx = cat.diagnoses.findIndex(d => d.id === diagId);
        if (idx >= 0) {
            cat.diagnoses.splice(idx, 1);
            break;
        }
    }
    saveDataToStorage();
    renderEditorTrees();
    renderCategories();
}
