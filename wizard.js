// Wizard funkcie

function startWizard(diagnosisId) {
    if (!diagnosisId) {
        console.error('startWizard: chýba diagnosisId');
        return;
    }
    
    currentDiagnosis = diagnosisId;
    const cat = appData.categories.find(c => c.id === currentCategory);
    
    if (!cat) {
        console.error('startWizard: nenájdená kategória', currentCategory);
        return;
    }
    
    if (!cat.diagnoses) {
        console.error('startWizard: kategória nemá diagnózy', currentCategory);
        showNotification('V tejto kategórii nie sú žiadne stromy', 'error');
        return;
    }
    
    const diag = cat.diagnoses.find(d => d.id === diagnosisId);
    
    if (!diag) {
        console.error('startWizard: nenájdený strom', diagnosisId);
        showNotification('Strom nebol nájdený', 'error');
        return;
    }
    
    const lang = appData.currentLang;
    
    // Získame správne preklady
    const dt = diag.translations?.[lang] || diag.translations?.['de'] || diag.translations?.['sk'] || {
        title: diag.title || diag.name || 'Diagnóza',
        steps: diag.steps || {},
        results: diag.results || {}
    };

    // Skryjeme ostatné viewy
    document.getElementById('diagnosesView')?.classList.add('hidden');
    document.getElementById('errorCodesView')?.classList.add('hidden');
    document.getElementById('wizardView')?.classList.remove('hidden');
    document.body.classList.add('wizard-active');

    // Aktualizujeme breadcrumb
    const wizardCategoryLink = document.getElementById('wizardCategoryLink');
    const wizardDiagnosisName = document.getElementById('wizardDiagnosisName');
    
    if (wizardCategoryLink) {
        const catName = cat.translations?.[lang]?.name || cat.translations?.['de']?.name || cat.id;
        wizardCategoryLink.textContent = catName;
    }
    
    if (wizardDiagnosisName) {
        wizardDiagnosisName.textContent = dt.title || 'Diagnóza';
    }

    currentStep = 0;
    pathHistory = [];
    renderWizard();
}

function renderWizard() {
    const cat = appData.categories.find(c => c.id === currentCategory);
    const diag = cat?.diagnoses?.find(d => d.id === currentDiagnosis);
    
    if (!diag) {
        console.error('renderWizard: nenájdený strom', currentDiagnosis);
        showNotification('Chyba: Strom nebol nájdený', 'error');
        return;
    }
    
    const lang = appData.currentLang;
    
    // Získame správne preklady
    const data = diag.translations?.[lang] || diag.translations?.['de'] || diag.translations?.['sk'] || {
        title: diag.title || diag.name || 'Diagnóza',
        steps: diag.steps || {},
        results: diag.results || {}
    };
    
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.de;

    const content = document.getElementById('wizardContent');
    if (!content) {
        console.error('renderWizard: chýba wizardContent element');
        return;
    }

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

    // KONTROLA: Či sme na konci (result)
    const isResult = typeof currentStep === 'string' && currentStep.startsWith('result');
    
    if (isResult) {
        const result = data.results?.[currentStep];
        
        if (!result) {
            console.error('renderWizard: nenájený result', currentStep);
            content.innerHTML = `
                <div class="wizard-stage">
                    <div class="result error">
                        Chyba: Výsledok nebol nájdený
                    </div>
                    <div class="wizard-buttons">
                        <button class="btn-back" onclick="goBackFromResult()">← ${t.back}</button>
                        <button class="btn-restart" onclick="restartWizard()">🔄 ${t.restart}</button>
                    </div>
                </div>
            `;
            return;
        }
        
        // ZOBRAZENIE VÝSLEDKU S TLACIDLAMI
        content.innerHTML = `
            <div class="wizard-stage">
                <div class="wizard-result-buttons">
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

                <div class="wizard-result-box">
                    <div class="result ${result.type || 'success'}">
                        ${result.text || result}
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // KONTROLA: Či existuje step
    const step = data.steps?.[currentStep];
    
    if (!step) {
        console.error('renderWizard: nenájdený step', currentStep, 'available:', Object.keys(data.steps || {}));
        content.innerHTML = `
            <div class="wizard-stage">
                <div class="result error">
                    Chyba: Krok ${currentStep} nebol nájdený
                </div>
                <div class="wizard-buttons">
                    <button class="btn-back" onclick="goBack()">← ${t.back}</button>
                    <button class="btn-restart" onclick="restartWizard()">🔄 ${t.restart}</button>
                </div>
            </div>
        `;
        return;
    }

    // HLAVNÉ ZOBRAZENIE S TLACIDLAMI ÁNO/NIE
    const questionText = step.q || step.question || 'Otázka';
    const stepNumber = parseInt(currentStep) + 1;

    content.innerHTML = `
        <div class="wizard-stage">
            <div class="step-number">${stepNumber}</div>

            <div class="question">
                ${questionText}
            </div>

            <div class="wizard-buttons">
                <button class="btn-yes" onclick="answer(true)">
                    <span class="btn-icon">✓</span>
                    <span>${t.yes}</span>
                </button>
                <button class="btn-no" onclick="answer(false)">
                    <span class="btn-icon">✗</span>
                    <span>${t.no}</span>
                </button>
                ${currentStep > 0 ? `
                    <button class="btn-back" onclick="goBack()">
                        <span class="btn-icon">←</span>
                        <span>${t.back}</span>
                    </button>
                ` : `
                    <button class="btn-back" onclick="closeWizard()">
                        <span class="btn-icon">←</span>
                        <span>${t.back}</span>
                    </button>
                `}
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
        const diag = cat?.diagnoses?.find(d => d.id === currentDiagnosis);
        
        if (!diag) {
            closeWizard();
            return;
        }
        
        currentStep = 0;

        for (let p of pathHistory) {
            const lang = appData.currentLang;
            const data = diag.translations?.[lang] || diag.translations?.['de'] || {
                steps: diag.steps || {}
            };
            const step = data.steps?.[currentStep] || diag.steps?.[currentStep];
            
            if (!step) break;
            
            currentStep = p.answer === 'yes' ? (step.yes || step.yesStep) : (step.no || step.noStep);
        }

        renderWizard();
    } else {
        closeWizard();
    }
}

function answer(isYes) {
    const cat = appData.categories.find(c => c.id === currentCategory);
    const diag = cat?.diagnoses?.find(d => d.id === currentDiagnosis);
    
    if (!diag) {
        console.error('answer: nenájdený strom');
        return;
    }
    
    const lang = appData.currentLang;
    const data = diag.translations?.[lang] || diag.translations?.['de'] || {
        steps: diag.steps || {}
    };
    
    const step = data.steps?.[currentStep] || diag.steps?.[currentStep];
    
    if (!step) {
        console.error('answer: nenájdený step', currentStep);
        return;
    }

    pathHistory.push({
        question: step.q || step.question,
        answer: isYes ? 'yes' : 'no'
    });

    // Podpora oboch formátov
    const nextStep = isYes ? (step.yes || step.yesStep) : (step.no || step.noStep);
    
    if (nextStep === undefined || nextStep === null) {
        console.error('answer: chýbajúca nasledujúca hodnota', { isYes, step });
        showNotification('Chyba v štruktúre stromu', 'error');
        return;
    }
    
    currentStep = nextStep;
    renderWizard();

    // Scroll na začiatok
    const wizardView = document.getElementById('wizardView');
    if (wizardView) wizardView.scrollTop = 0;
    
    const contentArea = document.querySelector('.content-area');
    if (contentArea) contentArea.scrollTop = 0;
}

function goBack() {
    if (pathHistory.length > 0) {
        pathHistory.pop();
        const cat = appData.categories.find(c => c.id === currentCategory);
        const diag = cat?.diagnoses?.find(d => d.id === currentDiagnosis);
        
        if (!diag) {
            closeWizard();
            return;
        }
        
        currentStep = 0;

        for (let p of pathHistory) {
            const lang = appData.currentLang;
            const data = diag.translations?.[lang] || diag.translations?.['de'] || {
                steps: diag.steps || {}
            };
            const step = data.steps?.[currentStep] || diag.steps?.[currentStep];
            
            if (!step) break;
            
            currentStep = p.answer === 'yes' ? (step.yes || step.yesStep) : (step.no || step.noStep);
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

    const wizardDiagnosisName = document.getElementById('wizardDiagnosisName');
    const wizardCategoryLink = document.getElementById('wizardCategoryLink');
    
    if (!wizardDiagnosisName || !wizardCategoryLink) return;

    let text = (t.currentPath || 'CESTA') + '\n\n';
    text += 'Diagnóza: ' + wizardDiagnosisName.textContent + '\n';
    text += 'Kategória: ' + wizardCategoryLink.textContent + '\n\n';

    pathHistory.forEach((p, i) => {
        const answer = p.answer === 'yes' ? (t.yes || 'Áno') : (t.no || 'Nie');
        text += (i + 1) + '. ' + p.question + '\n   Odpoveď: ' + answer + '\n\n';
    });

    const resultDiv = document.querySelector('.result');
    if (resultDiv) {
        text += 'VÝSLEDOK:\n' + resultDiv.textContent.trim();
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
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Skopírované do schránky');
    });
}
