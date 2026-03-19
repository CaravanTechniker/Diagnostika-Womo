// ===== FOTO EDITOR =====
function openPhotoEditor(type, id = null) {
    if (!isAdminLoggedIn && !isEditMode) return;
    
    currentPhotoTargetType = type;
    currentPhotoTargetId = id;
    currentPhotoData = null;

    let currentPhoto = null;
    if (type === 'logo') {
        currentPhoto = appData.logoPhoto;
    } else if (type === 'contact') {
        currentPhoto = appData.contactPhoto;
    } else if (type === 'category') {
        const cat = appData.categories.find(c => c.id === id);
        currentPhoto = cat ? cat.iconPhoto : null;
    }

    const preview = document.getElementById('photoPreview');
    const placeholder = document.getElementById('photoPlaceholder');

    if (preview && placeholder) {
        if (currentPhoto) {
            preview.src = currentPhoto;
            preview.classList.add('active');
            placeholder.classList.add('hidden');
            currentPhotoData = currentPhoto;
        } else {
            preview.classList.remove('active');
            placeholder.classList.remove('hidden');
            preview.src = '';
        }
    }

    const saveBtn = document.getElementById('savePhotoBtn');
    if (saveBtn) {
        saveBtn.disabled = !currentPhotoData;
    }
    
    const modal = document.getElementById('photoEditorModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// ===== JAZYKY =====
function setLanguage(code) {
    if (!appData.languages[code]) return;  // OCHRANA
    
    appData.currentLang = code;

    const flagImg = document.getElementById('currentFlag');
    const langSpan = document.getElementById('currentLang');
    
    if (flagImg) flagImg.src = CONFIG.FLAG_URLS[code];
    if (langSpan) langSpan.textContent = appData.languages[code].code;

    updateLanguage();

    if (typeof renderCategories === 'function') renderCategories();
    
    if (currentCategory && typeof showDiagnoses === 'function') {
        showDiagnoses(currentCategory);
    } else if (typeof showCategories === 'function') {
        showCategories();
    }

    localStorage.setItem('currentLanguage', code);  // ULOŽENIE JAZYKA
    saveDataToStorage();
    closeLangModal();
    showNotification(`Jazyk: ${appData.languages[code].name}`);
}
