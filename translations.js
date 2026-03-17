// Preklady UI
const UI_TRANSLATIONS = {
    de: {
        appTitle: 'Wohnmobil Diagnose',
        diagnostic: 'Diagnostik',
        errorCodes: 'Fehlercodes',
        devices: 'Geräte',
        measurements: 'Messungen',
        manuals: 'Handbücher',
        categories: 'Kategorien',
        search: 'Suchen...',
        contact: 'Kontakt',
        closeBtn: 'Schließen',
        yes: 'Ja',
        no: 'Nein',
        back: 'Zurück',
        currentPath: 'WEG',
        exportPath: 'Weg exportieren',
        restart: 'Neustart'
    },
    sk: {
        appTitle: 'Diagnostika Autokaravanu',
        diagnostic: 'Diagnostika',
        errorCodes: 'Chyby',
        devices: 'Zariadenia',
        measurements: 'Merania',
        manuals: 'Manuály',
        categories: 'Kategórie',
        search: 'Hľadať...',
        contact: 'Kontakt',
        closeBtn: 'Zavrieť',
        yes: 'Áno',
        no: 'Nie',
        back: 'Späť',
        currentPath: 'CESTA',
        exportPath: 'Exportovať cestu',
        restart: 'Reštart'
    },
    en: {
        appTitle: 'Motorhome Diagnosis',
        diagnostic: 'Diagnostic',
        errorCodes: 'Error Codes',
        devices: 'Devices',
        measurements: 'Measurements',
        manuals: 'Manuals',
        categories: 'Categories',
        search: 'Search...',
        contact: 'Contact',
        closeBtn: 'Close',
        yes: 'Yes',
        no: 'No',
        back: 'Back',
        currentPath: 'PATH',
        exportPath: 'Export path',
        restart: 'Restart'
    },
    it: {
        appTitle: 'Diagnosi Camper',
        diagnostic: 'Diagnostica',
        errorCodes: 'Codici Errore',
        devices: 'Dispositivi',
        measurements: 'Misurazioni',
        manuals: 'Manuali',
        categories: 'Categorie',
        search: 'Cerca...',
        contact: 'Contatto',
        closeBtn: 'Chiudi',
        yes: 'Sì',
        no: 'No',
        back: 'Indietro',
        currentPath: 'PERCORSO',
        exportPath: 'Esporta percorso',
        restart: 'Riavvia'
    },
    fr: {
        appTitle: 'Diagnostic Camping-car',
        diagnostic: 'Diagnostic',
        errorCodes: 'Codes Erreur',
        devices: 'Appareils',
        measurements: 'Mesures',
        manuals: 'Manuels',
        categories: 'Catégories',
        search: 'Rechercher...',
        contact: 'Contact',
        closeBtn: 'Fermer',
        yes: 'Oui',
        no: 'Non',
        back: 'Retour',
        currentPath: 'CHEMIN',
        exportPath: 'Exporter chemin',
        restart: 'Redémarrer'
    },
    es: {
        appTitle: 'Diagnóstico Autocaravana',
        diagnostic: 'Diagnóstico',
        errorCodes: 'Códigos Error',
        devices: 'Dispositivos',
        measurements: 'Mediciones',
        manuals: 'Manuales',
        categories: 'Categorías',
        search: 'Buscar...',
        contact: 'Contacto',
        closeBtn: 'Cerrar',
        yes: 'Sí',
        no: 'No',
        back: 'Atrás',
        currentPath: 'RUTA',
        exportPath: 'Exportar ruta',
        restart: 'Reiniciar'
    }
};

const CONTACT_TRANSLATIONS = {
    de: {
        warningTitle: 'Bitte rufen Sie mich NICHT an',
        warningSubtext: 'Ich bin beruflich beschäftigt und nehme keine Anrufe entgegen',
        notice: 'Telefonische Anrufe werden nicht entgegengenommen. Nur schriftliche oder Sprachnachrichten via WhatsApp oder SMS. Danke für Ihr Verständnis.',
        closeBtn: 'Schließen'
    },
    sk: {
        warningTitle: 'Prosím NEVOLAJTE MI',
        warningSubtext: 'Som pracovne vyťažený a telefón nedvíham',
        notice: 'Telefonické hovory neprijímam. Iba písomné, alebo hlasové správy cez WhatsApp alebo SMS. Ďakujem za pochopenie.',
        closeBtn: 'Zavrieť'
    },
    en: {
        warningTitle: 'Please DO NOT call me',
        warningSubtext: 'I am busy with work and do not answer calls',
        notice: 'Phone calls are not accepted. Only written or voice messages via WhatsApp or SMS. Thank you for your understanding.',
        closeBtn: 'Close'
    },
    it: {
        warningTitle: 'Per favore NON chiamarmi',
        warningSubtext: 'Sono occupato con il lavoro e non rispondo alle chiamate',
        notice: 'Le chiamate telefoniche non sono accettate. Solo messaggi scritti o vocali via WhatsApp o SMS. Grazie per la comprensione.',
        closeBtn: 'Chiudi'
    },
    fr: {
        warningTitle: 'S\'il vous plaît, ne m\'appelez PAS',
        warningSubtext: 'Je suis occupé par le travail et ne réponds pas aux appels',
        notice: 'Les appels téléphoniques ne sont pas acceptés. Uniquement des messages écrits ou vocaux via WhatsApp ou SMS. Merci de votre compréhension.',
        closeBtn: 'Fermer'
    },
    es: {
        warningTitle: 'Por favor NO me llames',
        warningSubtext: 'Estoy ocupado con el trabajo y no contesto llamadas',
        notice: 'No se aceptan llamadas telefónicas. Solo mensajes escritos o de voz a través de WhatsApp o SMS. Gracias por su comprensión.',
        closeBtn: 'Cerrar'
    }
};

// Funkcia na získanie dostupných jazykov
function getAvailableLanguages() {
    return Object.keys(UI_TRANSLATIONS);
}

// Funkcia na kontrolu či jazyk existuje
function isLanguageAvailable(langCode) {
    return UI_TRANSLATIONS.hasOwnProperty(langCode);
}
