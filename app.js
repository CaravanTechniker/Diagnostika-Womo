// RIADOK 8-9: Premenné pre dlhé podržanie
let adminPressTimer = null;
let adminLongPressTriggered = false;

// RIADOK 18-43: Funkcia na nastavenie skrytého triggeru
function setupHiddenAdminTrigger() {
    const trigger = document.getElementById('adminTrigger');
    if (!trigger) return;

    const startPress = () => {
        if (isEditMode || isAdminLoggedIn) return;
        adminLongPressTriggered = false;

        if (adminPressTimer) clearTimeout(adminPressTimer);
        adminPressTimer = setTimeout(() => {
            adminLongPressTriggered = true;
            openPasswordModal();
        }, 1000); // 1000ms = 1 sekunda
    };

    const endPress = () => {
        if (adminPressTimer) {
            clearTimeout(adminPressTimer);
            adminPressTimer = null;
        }
    };

    trigger.addEventListener('pointerdown', startPress);
    trigger.addEventListener('pointerup', endPress);
    trigger.addEventListener('pointerleave', endPress);
    trigger.addEventListener('pointercancel', endPress);
}

// RIADOK 46-53: Logout funkcia
function logoutAdmin() {
    isAdminLoggedIn = false;
    sessionStorage.removeItem('adminSession');
    document.getElementById('appContainer').classList.remove('admin-mode');
    updateAdminStatus();
    closeAdminModal();
}

// RIADOK 65-80: Kontrola hesla
function checkPassword() {
    const input = document.getElementById('adminPassword').value;
    if (input === CONFIG.ADMIN_PASSWORD) { // Heslo je "1310"
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminSession', 'true');
        document.getElementById('appContainer').classList.add('admin-mode');
        updateAdminStatus();
        closePasswordModal();
        openAdminModal();
    } else {
        alert('Nespravne heslo!');
        document.getElementById('adminPassword').value = '';
    }
}
