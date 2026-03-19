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
    
    document.getElementById('wizardCategoryName').textContent = cat.translations[lang].name || cat.translations['de'].name;
    document.getElementById('wizardDiagnosisName').textContent = dt.title;
    
    currentStep = 0;
    pathHistory = [];
    renderWizard();
}

function renderWizard() {
    const cat = appData.categories.find(c => c.id === currentCategory);
    const diag = cat.diagnoses.find(d => d.id === currentDiagnosis);
    const lang = appData.currentLang;
    const data = diag.translations[lang] || diag.translations['de'];
    const t = UI_TRANSLATIONS[lang];
    
    const content = document.getElementById('wizardContent');
    
    if (typeof currentStep === 'string' && currentStep.startsWith('result')) {
        const result = data.results[currentStep];
        content.innerHTML = `
            <div class="result ${result.type}">
                ${result.text}
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button class="btn-back" onclick="goBackFromResult()">
                    ← ${t.back}
                </button>
                <button class="btn-restart" onclick="restartWizard()">
                    🔄 Restart
                </button>
                <button class="btn-export-path" onclick="exportPath()">
                    📋 ${t.exportPath}
                </button>
            </div>
        `;
        return;
    }
    
    const step = data.steps[currentStep];
    
    let pathHtml = '';
    if (pathHistory.length > 0) {
        document.getElementById('pathHistory').classList.remove('hidden');
        pathHtml = pathHistory.map((p, i) => `
            <div style="margin-bottom: 4px; font-size: 0.9em;">
                ${i + 1}. ${p.question} 
                <span style="color: ${p.answer === 'yes' ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                    ${p.answer === 'yes' ? t.yes : t.no}
                </span>
            </div>
        `).join('');
        document.getElementById('pathContent').innerHTML = pathHtml;
    } else {
        document.getElementById('pathHistory').classList.add('hidden');
    }
    
    content.innerHTML = `
        <div class="step-number">${currentStep + 1}</div>
        <div class="question">${step.q}</div>
        <div class="buttons">
            <button class="btn-yes" onclick="answer(true)">
                ✓ ${t.yes}
            </button>
            <button class="btn-no" onclick="answer(false)">
                ✗ ${t.no}
            </button>
            ${currentStep > 0 ? `<button class="btn-back" onclick="goBack()">← ${t.back}</button>` : `<button class="btn-back" onclick="showDiagnoses('${currentCategory}')">← ${t.back}</button>`}
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
        showDiagnoses(currentCategory);
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
    }
}

function exportPath() {
    const lang = appData.currentLang;
    const t = UI_TRANSLATIONS[lang];
    
    let text = t.currentPath + '\n\n';
    text += 'Diagnosa: ' + document.getElementById('wizardDiagnosisName').textContent + '\n';
    text += 'Kategoria: ' + document.getElementById('wizardCategoryName').textContent + '\n\n';
    
    pathHistory.forEach((p, i) => {
        const answer = p.answer === 'yes' ? t.yes : t.no;
        text += (i + 1) + '. ' + p.question + '\n   Odpoved: ' + answer + '\n\n';
    });
    
    const resultDiv = document.querySelector('.result');
    if (resultDiv) {
        text += 'VYSLEDOK:\n' + resultDiv.textContent.trim();
    }
    
    document.getElementById('pathTextDisplay').textContent = text;
    document.getElementById('exportPathModal').classList.add('active');
}

function closeExportPathModal() {
    document.getElementById('exportPathModal').classList.remove('active');
}

function copyPathText() {
    const text = document.getElementById('pathTextDisplay').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Skopirovane!');
    });
}