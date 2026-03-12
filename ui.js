// UI funkcie

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
        document.getElementById('appContainer').classList.add('admin-mode');
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
    if (searchInput) searchInput.placeholder = t.search || 'Hľadať...';

    if (!document.getElementById('categoriesView').classList.contains('hidden')) {
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

    return (map[key] && (map[key][lang] || map[key].de)) || key;
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
    document.getElementById('categoriesView').classList.add('hidden');
    document.getElementById('electricView').classList.add('hidden');
    document.getElementById('diagnosesView').classList.add('hidden');
    document.getElementById('errorCodesView').classList.add('hidden');
    document.getElementById('wizardView').classList.add('hidden');
    document.getElementById('editorView').classList.add('hidden');
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

function renderCategories() {
    const list = document.getElementById('categoriesList');
    const lang = appData.currentLang;
    
    list.innerHTML = appData.categories.map(cat => {
        const t = cat.translations[lang] || cat.translations['de'];
        const count = cat.diagnoses ? cat.diagnoses.length : 0;
        const countText = getTreeCountText(count);
        
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
    hideAllMainViews();
    document.getElementById('electricView').classList.remove('hidden');
    
    const container = document.getElementById('electricSubcategories');
    const electricTitle = document.querySelector('#electricView .categories-title span:last-child');
    if (electricTitle) electricTitle.textContent = getUiText('electricTitle');
    
    container.innerHTML = CONFIG.ELECTRIC_SUBCATEGORIES.map(sub => {
        const elektroCat = appData.categories.find(c => c.id === 'elektro');
        const count = elektroCat && elektroCat.diagnoses ? 
            elektroCat.diagnoses.filter(d => TREE_TO_SUBCATEGORY[d.id] === sub.id).length : 0;
        
        return `
            <div class="subcategory-item" onclick="showElectricTrees('${sub.id}')">
                <span class="subcategory-icon">${sub.icon}</span>
                <div style="flex: 1;">
                    <div class="subcategory-name">${sub.name}</div>
                    <div style="color: #60a5fa; font-size: 0.85em; font-weight: 600;">${getTreeCountText(count)}</div>
                </div>
                <span style="color: #9ca3af;">›</span>
            </div>
        `;
    }).join('');
}

function showElectricTrees(subcategoryId) {
    currentCategory = 'elektro';
    const elektroCat = appData.categories.find(c => c.id === 'elektro');
    const sub = CONFIG.ELECTRIC_SUBCATEGORIES.find(s => s.id === subcategoryId);
    
    document.getElementById('electricView').classList.add('hidden');
    document.getElementById('diagnosesView').classList.remove('hidden');
    
    document.getElementById('currentCategoryName').textContent = `${getUiText('electricTitle')} › ${sub.name}`;
    
    const list = document.getElementById('diagnosesList');
    const trees = elektroCat && elektroCat.diagnoses ? 
        elektroCat.diagnoses.filter(d => TREE_TO_SUBCATEGORY[d.id] === subcategoryId) : [];
    
    if (trees.length === 0) {
        list.innerHTML = `<div style="text-align: center; padding: 40px; color: #6b7280;">${getUiText('noTrees')}</div>`;
    } else {
        const lang = appData.currentLang;
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
    if (!cat) return;

    const lang = appData.currentLang;
    const t = cat.translations[lang] || cat.translations['de'];
    
    hideAllMainViews();
    document.getElementById('diagnosesView').classList.remove('hidden');
    
    document.getElementById('currentCategoryName').textContent = t.name;
    
    const list = document.getElementById('diagnosesList');
    if (!cat.diagnoses || cat.diagnoses.length === 0) {
        list.innerHTML = `<div style="text-align: center; padding: 40px; color: #6b7280;">${getUiText('noTrees')}</div>`;
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
    hideAllMainViews();
    document.getElementById('categoriesView').classList.remove('hidden');

    const categoriesTitle = document.querySelector('#categoriesView [data-translate="categories"]');
    if (categoriesTitle) {
        categoriesTitle.textContent = getUiText('categoriesTitle');
    }

    currentCategory = null;
    currentDiagnosis = null;
}

function showErrorCodesSection() {
    hideAllMainViews();
    document.getElementById('errorCodesView').classList.remove('hidden');
    
    const content = document.getElementById('errorCodesContent');
    content.innerHTML = `
        <div class="error-search-box">
            <div style="font-weight: 600; margin-bottom: 10px; color: #374151;">${getUiText('searchErrorCode')}:</div>
            <input type="text" class="error-search-input" id="errorCodeSearch" placeholder="${getUiText('enterCode')}" onkeypress="if(event.key==='Enter'){ searchErrorCode(this.value); this.blur(); }">
            <button class="btn-primary" onclick="searchErrorCode(document.getElementById('errorCodeSearch').value)" style="margin-top: 10px;">
                ${getUiText('searchButton')}
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
        const severityText =
            found.severity === 'high' ? getUiText('severityHigh') :
            found.severity === 'medium' ? getUiText('severityMedium') :
            getUiText('severityLow');
        
        resultDiv.innerHTML = `
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-top: 15px;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <span class="error-code" style="font-size: 1.3em;">${found.code}</span>
                    <span class="error-severity ${severityClass}">${severityText}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <div style="color: #6b7280; font-size: 0.85em; margin-bottom: 4px;">${getUiText('device')}:</div>
                    <div style="font-weight: 600;">${found.device}</div>
                </div>
                <div style="margin-bottom: 10px;">
                    <div style="color: #6b7280; font-size: 0.85em; margin-bottom: 4px;">${getUiText('description')}:</div>
                    <div>${et.description}</div>
                </div>
                <div>
                    <div style="color: #6b7280; font-size: 0.85em; margin-bottom: 4px;">${getUiText('solution')}:</div>
                    <div>${et.solution}</div>
                </div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `<div style="text-align: center; padding: 30px; color: #6b7280;">${getUiText('codeNotFound')}</div>`;
    }
}

function showDevicesSection() {
    hideAllMainViews();
    document.getElementById('diagnosesView').classList.remove('hidden');
    document.getElementById('currentCategoryName').textContent = getUiText('device');

    document.getElementById('diagnosesList').innerHTML = `
        <div style="text-align: center; padding: 24px; color: #6b7280;">
            ${appData.currentLang === 'sk' ? 'Sekcia zariadení bude doplnená do ďalšej verzie' :
              appData.currentLang === 'de' ? 'Geraetesektion wird in der naechsten Version ergaenzt' :
              appData.currentLang === 'en' ? 'Devices section will be added in the next version' :
              appData.currentLang === 'it' ? 'La sezione dispositivi verra aggiunta nella prossima versione' :
              appData.currentLang === 'fr' ? 'La section appareils sera ajoutee dans la prochaine version' :
              'La seccion de dispositivos se agregara en la proxima version'}
        </div>
    `;
}

function showMeasurementsSection() {
    hideAllMainViews();
    document.getElementById('diagnosesView').classList.remove('hidden');
    document.getElementById('currentCategoryName').textContent = getUiText('measurementsTitle');

    const cards = [
        { icon: '🔋', title: { sk: 'Napätie batérie', de: 'Batteriespannung', en: 'Battery voltage', it: 'Tensione batteria', fr: 'Tension batterie', es: 'Voltaje de bateria' } },
        { icon: '⚡', title: { sk: 'D plus meranie', de: 'D plus Messung', en: 'D plus measurement', it: 'Misura D plus', fr: 'Mesure D plus', es: 'Medicion D plus' } },
        { icon: '☀️', title: { sk: 'Solárne napätie', de: 'Solarspannung', en: 'Solar voltage', it: 'Tensione solare', fr: 'Tension solaire', es: 'Voltaje solar' } },
        { icon: '🔌', title: { sk: '230V kontrola', de: '230V Pruefung', en: '230V check', it: 'Controllo 230V', fr: 'Controle 230V', es: 'Control 230V' } },
        { icon: '📟', title: { sk: 'Výstup EBL', de: 'EBL Ausgang', en: 'EBL output', it: 'Uscita EBL', fr: 'Sortie EBL', es: 'Salida EBL' } },
        { icon: '🧪', title: { sk: 'Pokles pod záťažou', de: 'Spannungsabfall unter Last', en: 'Voltage drop under load', it: 'Caduta sotto carico', fr: 'Chute sous charge', es: 'Caida bajo carga' } }
    ];

    const lang = appData.currentLang;

    document.getElementById('diagnosesList').innerHTML = `
        <div style="margin-bottom: 18px; color: #64748b; font-weight: 600;">
            ${getUiText('measurementsIntro')}
        </div>
        ${cards.map(card => `
            <div class="diagnosis-item" onclick="alert('${card.title[lang] || card.title.de}')">
                <div class="diagnosis-title">${card.icon} ${card.title[lang] || card.title.de}</div>
                <span style="color: #9ca3af;">›</span>
            </div>
        `).join('')}
    `;
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
    document.getElementById('diagnosesView').classList.remove('hidden');
    
    const list = document.getElementById('diagnosesList');
    document.getElementById('currentCategoryName').textContent = `${getUiText('searchResults')}: "${trimmed}"`;
    
    if (results.length === 0) {
        list.innerHTML = `<div style="text-align: center; padding: 40px; color: #6b7280;">${getUiText('noResults')}</div>`;
    } else {
        list.innerHTML = results.map(r => {
            const dt = r.diag.translations[lang] || r.diag.translations['de'];
            const ct = r.cat.translations[lang] || r.cat.translations['de'];
            return `
                <div class="diagnosis-item" onclick="startWizardFromSearch('${r.diag.id}', '${r.cat.id}')">
                    <div class="diagnosis-title">${dt.title}</div>
                    <div style="color: #9ca3af; font-size: 0.85em;">${ct.name}</div>
                </div>
            `;
        }).join('');
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
