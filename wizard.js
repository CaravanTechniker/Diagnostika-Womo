// Wizard funkcie

function startWizard(diagnosisId) {
    currentDiagnosis = diagnosisId;
    const cat = appData.categories.find(c => c.id === currentCategory);
    const diag = cat.diagnoses.find(d => d.id === diagnosisId);
    const lang = appData.currentLang;
    const dt = diag.translations[lang] || diag.translations['de'];

    document.getElementById('diagnosesView').classList.add('hidden');
    document.getElementById('errorCodesView').classList.add('hidden');
    document.getElementById('wizardView').classList.remove('hidden');
    document.body.classList.add('wizard-active');

    // OPRAVA: Používame správne ID z HTML
    const wizardCategoryLink = document.getElementById('wizardCategoryLink');
    if (wizardCategoryLink) {
        wizardCategoryLink.textContent = cat.translations[lang]?.name || cat.translations['de'].name;
    }
    
    const wizardDiagnosisName = document.getElementById('wizardDiagnosisName');
    if (wizardDiagnosisName) {
        wizardDiagnosisName.textContent = dt.title;
    }

    currentStep = 0;
    pathHistory = [];
    renderWizard();
}

function renderWizard() {
    const cat = appData.categories.find(c => c.id === currentCategory);
    const diag = cat.diagnoses.find(d => d.id === currentDiagnosis);
    const lang = appData.currentLang;
    const data = diag.translations[lang] || diag.translations['de'];
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.de;

    const content = document.getElementById('wizardContent');

    // Aktualizácia path history
    const pathHistoryBox = document.getElementById('pathHistory');
    const pathContent = document.getElementById('pathContent');
    
    if (pathHistoryBox && pathContent) {
        if (pathHistory.length > 0) {
            pathHistoryBox.classList.remove('hidden');
            pathContent.innerHTML = pathHistory.map((p, i) => `
                <div style="margin-bottom: 3px; font-size: 0.85em;">
                    ${i + 1}. ${p.question} 
                    <span style="color: ${p.answer === 'yes' ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                        ${p.answer === 'yes' ? t.yes : t.no}
                    </span>
                </div>
            `).join('');
        } else {
            pathHistoryBox.classList.add('hidden');
        }
    }

    if (typeof currentStep === 'string' && currentStep.startsWith('result')) {
        const result = data.results[currentStep];
        content.innerHTML = `
            <div class="wizard-stage">
                <div class="wizard-actions wizard-actions-top">
                    <button class="btn-back" onclick="goBackFromResult()">
                        ← ${t.back}
                    </button>
                    <button class="btn-restart" onclick="restartWizard()">
                        🔄 ${t.restart}
                    </button>
                    <button class="btn-export-path" onclick="exportPath()">
                        📋 ${t.exportPath}
                    </button>
                </div>

                <div class="wizard-answer-block">
                    <div class="result ${result.type}">
                        ${result.text}
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const step = data.steps[currentStep];

    content.innerHTML = `
        <div class="wizard-stage">
            <div class="step-number">${currentStep + 1}</div>

            <div class="question">
                ${step.q}
            </div>

            <div class="buttons">
                <button class="btn-yes" onclick="answer(true)">
                    ✓ ${t.yes}
                </button>
                <button class="btn-no" onclick="answer(false)">
                    ✗ ${t.no}
                </button>
                ${currentStep > 0
                    ? `<button class="btn-back" onclick="goBack()">← ${t.back}</button>`
                    : `<button class="btn-back" onclick="closeWizard()">← ${t.back}</button>`}
            </div>
        </div>
    `;
}

function restartWizard() {
    currentStep = 0;
    pathHistory = [];
    renderWizard();
}

function goBackFromResult() {
    if (pathHistory.length > 0) {
        pathHistory.pop();
        const cat = appData.categories.find(c => c.id === currentCategory);
        const diag = cat.diagnoses.find(d => d.id === currentDiagnosis);
        currentStep = 0;

        for (let p of pathHistory) {
            const step = (diag.translations[appData.currentLang] || diag.translations['de']).steps[currentStep];
            currentStep = p.answer === 'yes' ? step.yes : step.no;
        }

        renderWizard();
    } else {
        closeWizard();
    }
}

function answer(isYes) {
    const cat = appData.categories.find(c => c.id === currentCategory);
    const diag = cat.diagnoses.find(d => d.id === currentDiagnosis);
    const lang = appData.currentLang;
    const step = (diag.translations[lang] || diag.translations['de']).steps[currentStep];

    pathHistory.push({
        question: step.q,
        answer: isYes ? 'yes' : 'no'
    });

    currentStep = isYes ? step.yes : step.no;
    renderWizard();

    const wizardView = document.getElementById('wizardView');
    if (wizardView) wizardView.scrollTop = 0;

    const contentArea = document.querySelector('.content-area');
    if (contentArea) contentArea.scrollTop = 0;
}

function goBack() {
    if (pathHistory.length > 0) {
        pathHistory.pop();
        const cat = appData.categories.find(c => c.id === currentCategory);
        const diag = cat.diagnoses.find(d => d.id === currentDiagnosis);
        currentStep = 0;

        for (let p of pathHistory) {
            const step = (diag.translations[appData.currentLang] || diag.translations['de']).steps[currentStep];
            currentStep = p.answer === 'yes' ? step.yes : step.no;
        }

        renderWizard();

        const wizardView = document.getElementById('wizardView');
        if (wizardView) wizardView.scrollTop = 0;

        const contentArea = document.querySelector('.content-area');
        if (contentArea) contentArea.scrollTop = 0;
    }
}

function exportPath() {
    const lang = appData.currentLang;
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.de;

    let text = t.currentPath + '\n\n';
    text += 'Diagnosa: ' + document.getElementById('wizardDiagnosisName').textContent + '\n';
    text += 'Kategoria: ' + document.getElementById('wizardCategoryLink').textContent + '\n\n';

    pathHistory.forEach((p, i) => {
        const answer = p.answer === 'yes' ? t.yes : t.no;
        text += (i + 1) + '. ' + p.question + '\n   Odpoved: ' + answer + '\n\n';
    });

    const resultDiv = document.querySelector('.result');
    if (resultDiv) {
        text += 'VYSLEDOK:\n' + resultDiv.textContent.trim();
    }

    const pathTextDisplay = document.getElementById('pathTextDisplay');
    if (pathTextDisplay) {
        pathTextDisplay.textContent = text;
    }
    
    const exportPathModal = document.getElementById('exportPathModal');
    if (exportPathModal) {
        exportPathModal.classList.add('active');
    }
}

function closeExportPathModal() {
    const exportPathModal = document.getElementById('exportPathModal');
    if (exportPathModal) {
        exportPathModal.classList.remove('active');
    }
}

function copyPathText() {
    const pathTextDisplay = document.getElementById('pathTextDisplay');
    if (!pathTextDisplay) return;
    
    const text = pathTextDisplay.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Skopírované do schránky');
    }).catch(() => {
        alert('Skopírované!');
    });
}
