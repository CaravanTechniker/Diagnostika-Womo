// UI funkcie - Fixed Version 5.5

function init() {
    updateFlagDisplay();
    updateLanguage();
    renderCategories();
    populateExportSelects();
    loadPhotos();
    initBrandGrid();
    updateAdminStatus();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch(this.value, true);
                this.blur();
            }
        });
    }

    const adminSession = sessionStorage.getItem('adminSession');
    if (adminSession === 'true') {
        isAdminLoggedIn = true;
        const appContainer = document.getElementById('appContainer');
        if (appContainer) appContainer.classList.add('admin-mode');
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.classList.remove('hidden');
        updateAdminButton();
    }
}

function updateLanguage() {
    const lang = appData.currentLang;
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.de;

    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (t[key]) el.textContent = t[key];
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = t.search || 'Hľadať...';
    }

    const categoriesView = document.getElementById('categoriesView');
    if (categoriesView && !categoriesView.classList.contains('hidden')) {
        renderCategories();
    }
}

function getUiText(key) {
    const lang = appData.currentLang;
    const map = {
        noTrees: {
            sk: 'Žiadne diagnostické postupy v tejto kategórii',
            de: 'Keine Diagnoseablaeufe in dieser Kategorie',
            en: 'No diagnostic procedures in this category',
            it: 'Nessuna procedura diagnostica in questa categoria',
            fr: 'Aucune procedure de diagnostic dans cette categorie',
            es: 'No hay procedimientos de diagnostico en esta categoria'
        },
        noResults: {
            sk: 'Žiadne výsledky',
            de: 'Keine Ergebnisse',
            en: 'No results',
            it: 'Nessun risultato',
            fr: 'Aucun resultat',
            es: 'Sin resultados'
        },
        searchResults: {
            sk: 'Výsledky vyhľadávania',
            de: 'Suchergebnisse',
            en: 'Search results',
            it: 'Risultati della ricerca',
            fr: 'Resultats de recherche',
            es: 'Resultados de busqueda'
        },
        searchErrorCode: {
            sk: 'Vyhľadať chybový kód',
            de: 'Fehlercode suchen',
            en: 'Search error code',
            it: 'Cerca codice errore',
            fr: 'Rechercher un code erreur',
            es: 'Buscar codigo de error'
        },
        enterCode: {
            sk: 'Zadajte kód napr E212H',
            de: 'Code eingeben zB E212H',
            en: 'Enter code e.g. E212H',
            it: 'Inserisci codice es E212H',
            fr: 'Entrez le code ex E212H',
            es: 'Introduzca el codigo p ej E212H'
        },
        searchButton: {
            sk: 'Vyhľadať',
            de: 'Suchen',
            en: 'Search',
            it: 'Cerca',
            fr: 'Rechercher',
            es: 'Buscar'
        },
        codeNotFound: {
            sk: 'Kód nebol nájdený',
            de: 'Code wurde nicht gefunden',
            en: 'Code not found',
            it: 'Codice non trovato',
            fr: 'Code introuvable',
            es: 'Codigo no encontrado'
        },
        device: {
            sk: 'Zariadenie',
            de: 'Geraet',
            en: 'Device',
            it: 'Dispositivo',
            fr: 'Appareil',
            es: 'Dispositivo'
        },
        description: {
            sk: 'Popis',
            de: 'Beschreibung',
            en: 'Description',
            it: 'Descrizione',
            fr: 'Description',
            es: 'Descripcion'
        },
        solution: {
            sk: 'Riešenie',
            de: 'Loesung',
            en: 'Solution',
            it: 'Soluzione',
            fr: 'Solution',
            es: 'Solucion'
        },
        severityHigh: {
            sk: 'Vysoká',
            de: 'Hoch',
            en: 'High',
            it: 'Alta',
            fr: 'Elevee',
            es: 'Alta'
        },
        severityMedium: {
            sk: 'Stredná',
            de: 'Mittel',
            en: 'Medium',
            it: 'Media',
            fr: 'Moyenne',
            es: 'Media'
        },
        severityLow: {
            sk: 'Nízka',
            de: 'Niedrig',
            en: 'Low',
            it: 'Bassa',
            fr: 'Faible',
            es: 'Baja'
        },
        categoriesTitle: {
            sk: 'Kategórie',
            de: 'Kategorien',
            en: 'Categories',
            it: 'Categorie',
            fr: 'Categories',
            es: 'Categorias'
        },
        electricTitle: {
            sk: 'Elektrina',
            de: 'Elektrik',
            en: 'Electric',
            it: 'Elettricita',
            fr: 'Electricite',
            es: 'Electricidad'
        },
        measurementsTitle: {
            sk: 'Merania',
            de: 'Messungen',
            en: 'Measurements',
            it: 'Misurazioni',
            fr: 'Mesures',
            es: 'Mediciones'
        },
        measurementsIntro: {
            sk: 'Vyber typ merania a pokračuj do konkrétneho meracieho postupu',
            de: 'Messart waehlen und in den konkreten Messablauf wechseln',
            en: 'Choose measurement type and continue to the specific workflow',
            it: 'Scegli il tipo di misura e continua nel flusso specifico',
            fr: 'Choisissez le type de mesure et continuez dans la procedure',
            es: 'Elija el tipo de medicion y continue al flujo especifico'
        }
    };

    const text = map[key];
    if (!text) return key;
    return text[lang] || text.de || key;
}

function getTreeCountText(count) {
    const lang = appData.currentLang;

    if (lang === 'de') return count === 1 ? '1 Diagn. Ablauf' : `${count} Diagn. Ablaeufe`;
    if (lang === 'en') return count === 1 ? '1 diagnostic procedure' : `${count} diagnostic procedures`;
    if (lang === 'it') return count === 1 ? '1 procedura diagnostica' : `${count} procedure diagnostiche`;
    if (lang === 'fr') return count === 1 ? '1 procedure diag.' : `${count} procedures diag.`;
    if (lang === 'es') return count === 1 ? '1 proced. diag.' : `${count} proced. diag.`;

    return count === 1 ? '1 Diagn. postup' : `${count} Diagn. postupov`;
}

function setActiveMenu(section) {
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === section) {
            btn.classList.add('active');
        }
    });
}

function hideAllMainViews() {
    const views = ['categoriesView', 'electricView', 'diagnosesView', 'errorCodesView', 'wizardView', 'editorView'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    document.body.classList.remove('wizard-active');
}

function showSection(section) {
    currentSection = section;
    setActiveMenu(section);
    hideAllMainViews();

    switch(section) {
        case 'diagnostic':
            showCategories();
            break;
        case 'errorcodes':
            showErrorCodesSection();
            break;
        case 'devices':
            showDevicesSection();
            break;
        case 'measurements':
            showMeasurementsSection();
            break;
        case 'ebl':
            showDiagnoses('ebl');
            break;
        default:
            showCategories();
            break;
    }
}

function showMainMenu() {
    showSection('diagnostic');
}

function closeWizard() {
    const savedCategory = currentCategory;
    
    document.body.classList.remove('wizard-active');
    
    if (savedCategory === 'elektro') {
        showElectricSubcategories();
    } else if (savedCategory) {
        showDiagnoses(savedCategory);
    } else {
        showCategories();
    }
}

function handleSearchInput(value) {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        handleSearch(value, false);
    }, 300);
}

function renderCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    
    const lang = appData.currentLang;

    list.innerHTML = appData.categories.map(cat => {
        const t = cat.translations[lang] || cat.translations['de'];
        const count = cat.diagnoses ? cat.diagnoses.length : 0;
        const countText = getTreeCountText(count);

        const iconContent = cat.iconPhoto ? `<img src="${cat.iconPhoto}" alt="">` : `${cat.icon}`;

        return `
            <div class="category-item" onclick="showCategoryContent('${cat.id}')">
                <div class="category-icon" onclick="editCategoryPhoto('${cat.id}'); event.stopPropagation();">
                    ${iconContent}
                    <span class="edit-badge">✏️</span>
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
    hideAllMainViews();
    
    const electricView = document.getElementById('electricView');
    if (electricView) {
        electricView.classList.remove('hidden');
    }

    const container = document.getElementById('electricSubcategories');
    const electricTitle = document.querySelector('#electricView .categories-title span:last-child');
    if (electricTitle) electricTitle.textContent = getUiText('electricTitle');

    if (container) {
        container.innerHTML = CONFIG.ELECTRIC_SUBCATEGORIES.map(sub => {
            const elektroCat = appData.categories.find(c => c.id === 'elektro');
            const count = elektroCat && elektroCat.diagnoses ?
                elektroCat.diagnoses.filter(d => TREE_TO_SUBCATEGORY[d.id] === sub.id).length : 0;

            return `
                <div class="subcategory-item" onclick="showElectricTrees('${sub.id}')">
                    <span class="subcategory-icon">${sub.icon}</span>
                    <span class="subcategory-name">${sub.name}</span>
                    <span style="margin-left:auto;color:var(--primary);font-weight:700;font-size:0.85em;">${getTreeCountText(count)}</span>
                    <span style="color:#94a3b8;">›</span>
                </div>
            `;
        }).join('');
    }
}

function showElectricTrees(subcategoryId) {
    currentCategory = 'elektro';
    const elektroCat = appData.categories.find(c => c.id === 'elektro');
    const sub = CONFIG.ELECTRIC_SUBCATEGORIES.find(s => s.id === subcategoryId);

    const electricView = document.getElementById('electricView');
    const diagnosesView = document.getElementById('diagnosesView');
    
    if (electricView) electricView.classList.add('hidden');
    if (diagnosesView) diagnosesView.classList.remove('hidden');

    const categoryName = document.getElementById('currentCategoryName');
    if (categoryName) {
        categoryName.textContent = `${getUiText('electricTitle')} › ${sub ? sub.name : ''}`;
    }

    const list = document.getElementById('diagnosesList');
    const trees = elektroCat && elektroCat.diagnoses ?
        elektroCat.diagnoses.filter(d => TREE_TO_SUBCATEGORY[d.id] === subcategoryId) : [];

    if (list) {
        if (trees.length === 0) {
            list.innerHTML = `<div style="text-align:center;color:var(--muted);padding:40px 20px;">${getUiText('noTrees')}</div>`;
        } else {
            const lang = appData.currentLang;
            list.innerHTML = trees.map(d => {
                const dt = d.translations[lang] || d.translations['de'];
                return `
                    <div class="diagnosis-item" onclick="startWizard('${d.id}')">
                        <div class="diagnosis-title">${dt.title}</div>
                        <span style="color:#94a3b8;">›</span>
                    </div>
                `;
            }).join('');
        }
    }
}

function showDiagnoses(categoryId) {
    currentCategory = categoryId;
    const cat = appData.categories.find(c => c.id === categoryId);
    if (!cat) return;

    const lang = appData.currentLang;
    const t = cat.translations[lang] || cat.translations['de'];

    hideAllMainViews();
    
    const diagnosesView = document.getElementById('diagnosesView');
    if (diagnosesView) {
        diagnosesView.classList.remove('hidden');
    }

    const categoryName = document.getElementById('currentCategoryName');
    if (categoryName) {
        categoryName.textContent = t.name;
    }

    const list = document.getElementById('diagnosesList');
    if (list) {
        if (!cat.diagnoses || cat.diagnoses.length === 0) {
            list.innerHTML = `<div style="text-align:center;color:var(--muted);padding:40px 20px;">${getUiText('noTrees')}</div>`;
        } else {
            const lang = appData.currentLang;
            list.innerHTML = cat.diagnoses.map(d => {
                const dt = d.translations[lang] || d.translations['de'];
                return `
                    <div class="diagnosis-item" onclick="startWizard('${d.id}')">
                        <div class="diagnosis-title">${dt.title}</div>
                        <span style="color:#94a3b8;">›</span>
                    </div>
                `;
            }).join('');
        }
    }
}

function showCategories() {
    hideAllMainViews();
    
    const categoriesView = document.getElementById('categoriesView');
    if (categoriesView) {
        categoriesView.classList.remove('hidden');
    }

    const categoriesTitle = document.querySelector('#categoriesView [data-translate="categories"]');
    if (categoriesTitle) {
        categoriesTitle.textContent = getUiText('categoriesTitle');
    }

    currentCategory = null;
    currentDiagnosis = null;
}

function showErrorCodesSection() {
    hideAllMainViews();
    
    const errorCodesView = document.getElementById('errorCodesView');
    if (errorCodesView) {
        errorCodesView.classList.remove('hidden');
    }

    const content = document.getElementById('errorCodesContent');
    if (content) {
        content.innerHTML = `
            <div class="error-search-box">
                <div style="font-weight:700;margin-bottom:10px;">${getUiText('searchErrorCode')}:</div>
                <input type="text" id="errorCodeInput" class="error-search-input" placeholder="${getUiText('enterCode')}" maxlength="10">
                <button class="btn-primary" style="margin-top:10px;" onclick="searchErrorCode(document.getElementById('errorCodeInput').value)">${getUiText('searchButton')}</button>
            </div>
            <div id="errorCodeResult"></div>
        `;
        
        const input = document.getElementById('errorCodeInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchErrorCode(input.value);
                }
            });
            input.focus();
        }
    }
}

function searchErrorCode(code) {
    if (!code || !code.trim()) return;

    const resultDiv = document.getElementById('errorCodeResult');
    if (!resultDiv) return;
    
    const found = findErrorCode(code.trim().toUpperCase());

    if (found) {
        const lang = appData.currentLang;
        const et = found.translations[lang] || found.translations['de'] || found.translations['sk'];
        const severityClass = 'severity-' + found.severity;
        const severityText =
            found.severity === 'high' ? getUiText('severityHigh') :
            found.severity === 'medium' ? getUiText('severityMedium') :
            getUiText('severityLow');

        resultDiv.innerHTML = `
            <div style="background:var(--card);border-radius:14px;padding:15px;border:1px solid #dbe4f0;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                    <span style="font-size:1.3em;font-weight:800;color:var(--primary);">${found.code}</span>
                    <span class="${severityClass}" style="padding:4px 10px;border-radius:20px;font-size:0.8em;font-weight:700;">${severityText}</span>
                </div>
                
                <div style="margin-bottom:12px;">
                    <div style="font-size:0.85em;color:var(--muted);margin-bottom:4px;">${getUiText('device')}:</div>
                    <div style="font-weight:700;">${found.device || 'N/A'}</div>
                </div>
                
                <div style="margin-bottom:12px;">
                    <div style="font-size:0.85em;color:var(--muted);margin-bottom:4px;">${getUiText('description')}:</div>
                    <div>${et.description || 'N/A'}</div>
                </div>
                
                <div>
                    <div style="font-size:0.85em;color:var(--muted);margin-bottom:4px;">${getUiText('solution')}:</div>
                    <div style="background:#f8fbff;padding:12px;border-radius:10px;border-left:3px solid var(--primary);">${et.solution || 'N/A'}</div>
                </div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `<div style="text-align:center;color:#dc2626;padding:20px;font-weight:700;">${getUiText('codeNotFound')}</div>`;
    }
}

function showDevicesSection() {
    hideAllMainViews();
    
    const diagnosesView = document.getElementById('diagnosesView');
    if (diagnosesView) {
        diagnosesView.classList.remove('hidden');
    }
    
    const categoryName = document.getElementById('currentCategoryName');
    if (categoryName) {
        categoryName.textContent = getUiText('device');
    }

    const list = document.getElementById('diagnosesList');
    if (list) {
        const messages = {
            sk: 'Sekcia zariadení bude doplnená do ďalšej verzie',
            de: 'Geraetesektion wird in der naechsten Version ergaenzt',
            en: 'Devices section will be added in the next version',
            it: 'La sezione dispositivi verra aggiunta nella prossima versione',
            fr: 'La section appareils sera ajoutee dans la prochaine version',
            es: 'La seccion de dispositivos se agregara en la proxima version'
        };
        
        list.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--muted);">
                ${messages[appData.currentLang] || messages.en}
            </div>
        `;
    }
}

function showMeasurementsSection() {
    hideAllMainViews();
    
    const diagnosesView = document.getElementById('diagnosesView');
    if (diagnosesView) {
        diagnosesView.classList.remove('hidden');
    }
    
    const categoryName = document.getElementById('currentCategoryName');
    if (categoryName) {
        categoryName.textContent = getUiText('measurementsTitle');
    }

    const cards = [
        { icon: '🔋', title: { sk: 'Napätie batérie', de: 'Batteriespannung', en: 'Battery voltage', it: 'Tensione batteria', fr: 'Tension batterie', es: 'Voltaje de bateria' } },
        { icon: '⚡', title: { sk: 'D plus meranie', de: 'D plus Messung', en: 'D plus measurement', it: 'Misura D plus', fr: 'Mesure D plus', es: 'Medicion D plus' } },
        { icon: '☀️', title: { sk: 'Solárne napätie', de: 'Solarspannung', en: 'Solar voltage', it: 'Tensione solare', fr: 'Tension solaire', es: 'Voltaje solar' } },
        { icon: '🔌', title: { sk: '230V kontrola', de: '230V Pruefung', en: '230V check', it: 'Controllo 230V', fr: 'Controle 230V', es: 'Control 230V' } },
        { icon: '📟', title: { sk: 'Výstup EBL', de: 'EBL Ausgang', en: 'EBL output', it: 'Uscita EBL', fr: 'Sortie EBL', es: 'Salida EBL' } },
        { icon: '🧪', title: { sk: 'Pokles pod záťažou', de: 'Spannungsabfall unter Last', en: 'Voltage drop under load', it: 'Caduta sotto carico', fr: 'Chute sous charge', es: 'Caida bajo carga' } }
    ];

    const lang = appData.currentLang;
    const list = document.getElementById('diagnosesList');
    
    if (list) {
        list.innerHTML = `
            <div style="margin-bottom:15px;color:var(--muted);">${getUiText('measurementsIntro')}</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                ${cards.map(card => `
                    <div class="subcategory-item" style="cursor: default;">
                        <span style="font-size:1.3em;">${card.icon}</span>
                        <span style="font-weight:700;font-size:0.9em;">${card.title[lang] || card.title.de}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function handleSearch(query, blurAfterSearch = false) {
    const trimmed = query.trim();

    if (!trimmed) {
        if (currentCategory) {
            showDiagnoses(currentCategory);
        } else {
            renderCategories();
            showCategories();
        }
        return;
    }

    const lowerQuery = trimmed.toLowerCase();
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

    hideAllMainViews();
    
    const diagnosesView = document.getElementById('diagnosesView');
    if (diagnosesView) {
        diagnosesView.classList.remove('hidden');
    }

    const list = document.getElementById('diagnosesList');
    const categoryName = document.getElementById('currentCategoryName');
    
    if (categoryName) {
        categoryName.textContent = `${getUiText('searchResults')}: "${trimmed}"`;
    }

    if (list) {
        if (results.length === 0) {
            list.innerHTML = `<div style="text-align:center;color:var(--muted);padding:40px 20px;">${getUiText('noResults')}</div>`;
        } else {
            const lang = appData.currentLang;
            list.innerHTML = results.map(r => {
                const dt = r.diag.translations[lang] || r.diag.translations['de'];
                const ct = r.cat.translations[lang] || r.cat.translations['de'];
                return `
                    <div class="diagnosis-item" onclick="startWizardFromSearch('${r.diag.id}', '${r.cat.id}')">
                        <div>
                            <div class="diagnosis-title">${dt.title}</div>
                            <div style="font-size:0.85em;color:var(--muted);margin-top:2px;">${ct.name}</div>
                        </div>
                        <span style="color:#94a3b8;">›</span>
                    </div>
                `;
            }).join('');
        }
    }

    if (blurAfterSearch) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.blur();
    }
}

function startWizardFromSearch(diagId, catId) {
    currentCategory = catId;
    startWizard(diagId);
}
