// Konfigurácia aplikácie
const CONFIG = {
    ADMIN_PASSWORD: '1310',
    VERSION: '5.1',

    FLAG_URLS: {
        de: 'https://flagcdn.com/w40/de.png',
        sk: 'https://flagcdn.com/w40/sk.png',
        it: 'https://flagcdn.com/w40/it.png',
        fr: 'https://flagcdn.com/w40/fr.png',
        es: 'https://flagcdn.com/w40/es.png',
        en: 'https://flagcdn.com/w40/gb.png'
    },

    CONTACT: {
        name: 'Stanislav Drozd',
        role: 'CaravanTechniker am Main',
        whatsapp: '4915163812554',
        phone: '+4915163812554',
        email: 'caravantechnikerammain@gmail.com'
    },

    DEVICE_BRANDS: [
        { id: 'truma', name: 'Truma', icon: '🔥' },
        { id: 'thetford', name: 'Thetford', icon: '🚽' },
        { id: 'dometic', name: 'Dometic', icon: '❄️' },
        { id: 'webasto', name: 'Webasto', icon: '🔥' },
        { id: 'alde', name: 'Alde', icon: '🌡️' },
        { id: 'victron', name: 'Victron', icon: '⚡' },
        { id: 'schaudt', name: 'Schaudt', icon: '⚡' },
        { id: 'nordelettronica', name: 'Nordelettronica', icon: '⚡' },
        { id: 'cbe', name: 'CBE', icon: '⚡' },
        { id: 'other', name: 'Iné', icon: '🔧' }
    ],

    ELECTRIC_SUBCATEGORIES: [
        { id: 'router', name: 'Hlavné routery', icon: '🌐' },
        { id: 'battery', name: 'Batéria a BMS', icon: '🔋' },
        { id: 'charging230', name: 'Nabíjanie 230V', icon: '🔌' },
        { id: 'chargingDrive', name: 'Nabíjanie počas jazdy', icon: '🚗' },
        { id: 'solar', name: 'Solárny systém', icon: '☀️' },
        { id: 'dist12v', name: '12V distribúcia', icon: '⚡' },
        { id: 'dist230', name: '230V distribúcia', icon: '🔌' },
        { id: 'inverter', name: 'Menič', icon: '🔁' },
        { id: 'fuses', name: 'Poistky a relé', icon: '🔒' },
        { id: 'voltage', name: 'Pokles napätia', icon: '📉' },
        { id: 'devices', name: 'Napájanie zariadení', icon: '🔌' },
        { id: 'ebl', name: 'EBL systémy', icon: '⚡' }
    ]
};

// Mapovanie stromov na podkategórie
const TREE_TO_SUBCATEGORY = {
    'elektrina_hlavny_router': 'router',
    '12v_system_bez_napatia': 'router',
    'bateria_sa_nenabija': 'router',
    'bateria_sa_vybija': 'router',
    'solar_nenabija': 'router',
    'nabijanie_pocas_jazdy_nefunguje': 'router',
    '230v_system_nefunguje': 'router',
    'menic_nefunguje': 'router',
    'ebl_system_router': 'router',
    'pokles_napatia_router': 'router',
    'bateria_nizke_napatie': 'battery',
    'bateria_neprijima_nabijanie': 'battery',
    'bateria_sa_rychlo_vybija': 'battery',
    'bateria_pokles_napatia_pod_zatazou': 'battery',
    'bateria_hlboke_vybitie': 'battery',
    'bms_blokuje_nabijanie': 'battery',
    'bms_blokuje_vybijanie': 'battery',
    'bateria_zly_typ_nastavenia': 'battery',
    'paralelne_baterie_nevyrovnane': 'battery',
    'bateria_vysoky_vnutorny_odpor': 'battery',
    'bateria_odpojovac_chyba': 'battery',
    '230v_nabijanie_nefunguje': 'charging230',
    'nabijacka_bez_vstupu': 'charging230',
    'nabijacka_bez_vystupu': 'charging230',
    'nabijacka_nizke_napatie': 'charging230',
    'nabijacka_zly_profil': 'charging230',
    'nabijacka_prehrievanie': 'charging230',
    'nabijacka_float_priskoro': 'charging230',
    'nabijacka_nedava_prud': 'charging230',
    'napatie_z_nabijacky_nedojde_k_baterii': 'charging230',
    'nabijanie_pocas_jazdy_nefunguje': 'chargingDrive',
    'booster_bez_vstupu': 'chargingDrive',
    'booster_bez_vystupu': 'chargingDrive',
    'booster_nizky_prud': 'chargingDrive',
    'booster_prehrievanie': 'chargingDrive',
    'booster_vypina': 'chargingDrive',
    'signal_dplus_chyba': 'chargingDrive',
    'signal_zapalovanie_chyba': 'chargingDrive',
    'separacne_rele_neprepina': 'chargingDrive',
    'alternator_nedava_napatie': 'chargingDrive',
    'inteligentny_alternator_problem': 'chargingDrive',
    'kabel_alternator_booster_chyba': 'chargingDrive',
    'solar_slaby_vykon': 'solar',
    'regulator_nevidi_bateriu': 'solar',
    'regulator_nevidi_panel': 'solar',
    'regulator_zly_profil': 'solar',
    'regulator_prehrievanie': 'solar',
    'regulator_chyba': 'solar',
    'panel_bez_napatia': 'solar',
    'panel_slaby_prud': 'solar',
    'panel_zatieneny': 'solar',
    'mc4_konektor_chyba': 'solar',
    'kabel_panel_preruseny': 'solar',
    'dioda_panel_chyba': 'solar',
    '12v_hlavny_vypinac_vypnuty': 'dist12v',
    '12v_hlavna_poistka_chyba': 'dist12v',
    '12v_vetva_nefunguje': 'dist12v',
    '12v_pokles_napatia': 'dist12v',
    '12v_zla_kostra': 'dist12v',
    '12v_plusovy_kabel_chyba': 'dist12v',
    '12v_rozvodny_blok_chyba': 'dist12v',
    '12v_konektor_oxidacia': 'dist12v',
    '12v_kabel_prehrievanie': 'dist12v',
    '230v_landstrom_bez_vstupu': 'dist230',
    '230v_fi_vypadava': 'dist230',
    '230v_istic_vypadava': 'dist230',
    '230v_zasuvky_nefunguju': 'dist230',
    '230v_prepinanie_siete_chyba': 'dist230',
    '230v_priorita_menica': 'dist230',
    '230v_kabel_landstrom_chyba': 'dist230',
    '230v_otocena_polarita': 'dist230',
    '230v_preruseny_nulovy_vodic': 'dist230',
    'menic_sa_nezapne': 'inverter',
    'menic_bez_vystupu': 'inverter',
    'menic_podpetie': 'inverter',
    'menic_pretazenie': 'inverter',
    'menic_prehrievanie': 'inverter',
    'menic_prepinanie_siete_chyba': 'inverter',
    'menic_n_pe_problem': 'inverter',
    'menic_dc_kabel_dlhy': 'inverter',
    'poistka_sa_stale_pali': 'fuses',
    'poistka_zla_hodnota': 'fuses',
    'rele_neprepina': 'fuses',
    'rele_cvaka_neprepne': 'fuses',
    'istic_vypadava_pod_zatazou': 'fuses',
    'automaticka_poistka_chyba': 'fuses',
    'zla_kostra': 'voltage',
    'prechodovy_odpor_spoja': 'voltage',
    'napatie_bez_zataze_ok_pod_zatazou_zle': 'voltage',
    'prehrievajuci_spoj': 'voltage',
    'chladnicka_12v_bez_napajania': 'devices',
    'cerpadlo_vody_bez_napajania': 'devices',
    'svetla_bez_napajania': 'devices',
    'kurene_12v_bez_napajania': 'devices',
    'schodiky_bez_napajania': 'devices',
    'toaleta_bez_napajania': 'devices',
    'usb_zasuvka_bez_napajania': 'devices',
    'ventilator_bez_napajania': 'devices',
    'ebl_bez_12v_vystupu': 'ebl',
    'ebl_chyba_distribucie': 'ebl',
    'ebl_vnutorne_rele_chyba': 'ebl',
    'ebl_hlavna_poistka_chyba': 'ebl',
    'ebl_vetva_nefunguje': 'ebl',
    'ebl_panel_komunikacia_chyba': 'ebl',
    'ebl_prehrievanie': 'ebl',
    'ebl_vnutorna_cesta_spalena': 'ebl'
};

// Default dáta aplikácie
const DEFAULT_APP_DATA = {
    languages: {
        de: { name: 'Deutsch', code: 'DE' },
        sk: { name: 'Slovensky', code: 'SK' },
        en: { name: 'English', code: 'GB' },
        it: { name: 'Italiano', code: 'IT' },
        fr: { name: 'Francais', code: 'FR' },
        es: { name: 'Espanol', code: 'ES' }
    },
    currentLang: 'de',
    headerPhoto: null,
    contactPhoto: null,
    categories: [
        {
            id: 'elektro',
            icon: '⚡',
            iconPhoto: null,
            translations: {
                de: { name: 'Elektrik' },
                sk: { name: 'Elektrina' },
                en: { name: 'Electrics' },
                it: { name: 'Elettricita' },
                fr: { name: 'Electricite' },
                es: { name: 'Electricidad' }
            },
            diagnoses: []
        },
        {
            id: 'voda',
            icon: '💧',
            iconPhoto: null,
            translations: {
                de: { name: 'Wasser' },
                sk: { name: 'Voda' },
                en: { name: 'Water' },
                it: { name: 'Acqua' },
                fr: { name: 'Eau' },
                es: { name: 'Agua' }
            },
            diagnoses: []
        },
        {
            id: 'kurenie',
            icon: '🔥',
            iconPhoto: null,
            translations: {
                de: { name: 'Heizung' },
                sk: { name: 'Kurenie' },
                en: { name: 'Heating' },
                it: { name: 'Riscaldamento' },
                fr: { name: 'Chauffage' },
                es: { name: 'Calefaccion' }
            },
            diagnoses: []
        },
        {
            id: 'chladnicka',
            icon: '❄️',
            iconPhoto: null,
            translations: {
                de: { name: 'Kuhlschrank' },
                sk: { name: 'Chladnicka' },
                en: { name: 'Refrigerator' },
                it: { name: 'Frigorifero' },
                fr: { name: 'Refrigerateur' },
                es: { name: 'Refrigerador' }
            },
            diagnoses: []
        },
        {
            id: 'klimatizacia',
            icon: '❄️',
            iconPhoto: null,
            translations: {
                de: { name: 'Klimaanlage' },
                sk: { name: 'Klimatizacia' },
                en: { name: 'Air Conditioning' },
                it: { name: 'Aria condizionata' },
                fr: { name: 'Climatisation' },
                es: { name: 'Aire acondicionado' }
            },
            diagnoses: []
        },
        {
            id: 'sattv',
            icon: '📡',
            iconPhoto: null,
            translations: {
                de: { name: 'SAT TV' },
                sk: { name: 'SAT TV' },
                en: { name: 'SAT TV' },
                it: { name: 'SAT TV' },
                fr: { name: 'SAT TV' },
                es: { name: 'SAT TV' }
            },
            diagnoses: []
        },
        {
            id: 'panel',
            icon: '📟',
            iconPhoto: null,
            translations: {
                de: { name: 'Bedienfelder' },
                sk: { name: 'Ovladacie panely' },
                en: { name: 'Control Panels' },
                it: { name: 'Pannelli di controllo' },
                fr: { name: 'Panneaux de commande' },
                es: { name: 'Paneles de control' }
            },
            diagnoses: []
        },
        {
            id: 'ebl',
            icon: '⚡',
            iconPhoto: null,
            isEBL: true,
            translations: {
                de: { name: 'EBL Systeme' },
                sk: { name: 'EBL systemy' },
                en: { name: 'EBL Systems' },
                it: { name: 'Sistemi EBL' },
                fr: { name: 'Systemes EBL' },
                es: { name: 'Sistemas EBL' }
            },
            diagnoses: [],
            eblBrands: {
                schaudt: [],
                nordelettronica: [],
                cbe: []
            }
        }
    ],
    errorCodes: {}
};
