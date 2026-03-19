// Wizard logika

function getCurrentDiagnosisData() {
    const cat = appData.categories.find(c => c.id === currentCategory);
    if (!cat) return null;
    const diag = (cat.diagnoses || []).find(d => d.id === currentDiagnosis);
    if (!diag) return null;
    const lang = appData.currentLang || 'sk';
    const data = diag.translations?.[lang] || diag.translations?.de;
    return { cat, diag, data, lang };
}

function startWizard(diagnosisId) {
    currentDiagnosis = diagnosisId;
    currentStep = 0;
    pathHistory = [];

    const payload = getCurrentDiagnosisData();
    if (!payload) {
        showNotification('Diagnostický strom nebol nájdený', 'error');
        return;
    }

    hideAllMainViews();
    document.getElementById('wizardView').classList.remove('hidden');
    renderWizard();
}

function renderWizard() {
    const payload = getCurrentDiagnosisData();
    if (!payload) return;
    const { cat, data, lang } = payload;
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.sk;

    const wizardCategoryLink = document.getElementById('wizardCategoryLink');
    const wizardDiagnosisName = document.getElementById('wizardDiagnosisName');
    const wizardContent = document.getElementById('wizardContent');
    const pathHistoryEl = document.getElementById('pathHistory');
    const pathContent = document.getElementById('pathContent');

    const catText = cat.translations?.[lang] || cat.translations?.de;
    if (wizardCategoryLink) wizardCategoryLink.textContent = catText?.name || cat.id;
    if (wizardDiagnosisName) wizardDiagnosisName.textContent = data?.title || currentDiagnosis;

    if (pathHistory.length > 0) {
        pathHistoryEl?.classList.remove('hidden');
        if (pathContent) {
            pathContent.innerHTML = pathHistory.map((p, i) => `
                <div style="margin-bottom: 3px; font-size: 0.85em;">
                    ${i + 1}. ${p.question}
                    <span style="color: ${p.answer === 'yes' ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                        ${p.answer === 'yes' ? t.yes : t.no}
                    </span>
                </div>
            `).join('');
        }
    } else {
        pathHistoryEl?.classList.add('hidden');
        if (pathContent) pathContent.innerHTML = '';
    }

    if (!data || !data.steps) {
        wizardContent.innerHTML = `<div class="result error">Chýbajú kroky diagnostiky</div>`;
        return;
    }

    const step = data.steps[currentStep];
    if (typeof step === 'string') {
        wizardContent.innerHTML = `
            <div class="result">${step}</div>
            <div class="buttons">
                <button class="btn-back" onclick="goBackFromResult()">← ${t.back}</button>
                <button class="btn-export-path" onclick="exportPath()">📋 ${t.exportPath}</button>
                <button class="btn-restart" onclick="restartWizard()">↺ ${t.restart}</button>
            </div>
        `;
        return;
    }

    if (!step || !step.q) {
        wizardContent.innerHTML = `<div class="result error">Chýba otázka pre krok ${currentStep}</div>`;
        return;
    }

    wizardContent.innerHTML = `
        <div class="step-number">${currentStep + 1}</div>
        <div class="question">${step.q}</div>
        <div class="buttons">
            <button class="btn-yes" onclick="answer(true)">✓ ${t.yes}</button>
            <button class="btn-no" onclick="answer(false)">✗ ${t.no}</button>
            ${currentStep > 0 ? `<button class="btn-back" onclick="goBack()">← ${t.back}</button>` : `<button class="btn-back" onclick="closeWizard()">← ${t.back}</button>`}
        </div>
    `;
}

function restartWizard() {
    currentStep = 0;
    pathHistory = [];
    renderWizard();
}

function resolveNextTarget(target, lang) {
    if (typeof target === 'number') return target;
    if (typeof target !== 'string') return target;

    const payload = getCurrentDiagnosisData();
    const data = payload?.data;
    const translations = data?.results || data?.translations || null;

    if (translations && typeof translations[target] === 'string') {
        return translations[target];
    }
    if (data && typeof data[target] === 'string') {
        return data[target];
    }
    return target;
}

function answer(isYes) {
    const payload = getCurrentDiagnosisData();
    if (!payload) return;
    const { data, lang } = payload;
    const step = data.steps[currentStep];
    if (!step) return;

    pathHistory.push({
        question: step.q,
        answer: isYes ? 'yes' : 'no'
    });

    currentStep = resolveNextTarget(isYes ? step.yes : step.no, lang);
    renderWizard();
}

function goBack() {
    if (pathHistory.length === 0) return;
    pathHistory.pop();

    const payload = getCurrentDiagnosisData();
    if (!payload) return;
    const { data, lang } = payload;

    currentStep = 0;
    for (const p of pathHistory) {
        const step = data.steps[currentStep];
        currentStep = resolveNextTarget(p.answer === 'yes' ? step.yes : step.no, lang);
    }
    renderWizard();
}

function goBackFromResult() {
    if (pathHistory.length === 0) {
        closeWizard();
        return;
    }
    goBack();
}

function exportPath() {
    const payload = getCurrentDiagnosisData();
    if (!payload) return;
    const { data, cat } = payload;

    const lines = [
        data.title || currentDiagnosis,
        `Kategória: ${(cat.translations?.[appData.currentLang] || cat.translations?.de)?.name || cat.id}`,
        ''
    ];

    pathHistory.forEach((entry, index) => {
        lines.push(`${index + 1}. ${entry.question}`);
        lines.push(`   → ${entry.answer === 'yes' ? (UI_TRANSLATIONS[appData.currentLang]?.yes || 'Áno') : (UI_TRANSLATIONS[appData.currentLang]?.no || 'Nie')}`);
    });

    const resultTarget = typeof currentStep === 'string' ? currentStep : '';
    if (resultTarget) {
        lines.push('');
        lines.push(`Výsledok: ${resultTarget}`);
    }

    const text = lines.join('\n');
    const display = document.getElementById('pathTextDisplay');
    if (display) display.textContent = text;
    document.getElementById('exportPathModal')?.classList.add('active');
}

function closeExportPathModal() {
    document.getElementById('exportPathModal')?.classList.remove('active');
}

function copyPathText() {
    const text = document.getElementById('pathTextDisplay')?.textContent || '';
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Cesta skopírovaná');
    }).catch(() => {
        showNotification('Kopírovanie zlyhalo', 'error');
    });
}
