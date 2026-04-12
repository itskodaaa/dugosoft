import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export const LANGUAGES = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "it", label: "Italiano",   flag: "🇮🇹" },
  { code: "fr", label: "Français",   flag: "🇫🇷" },
  { code: "es", label: "Español",    flag: "🇪🇸" },
  { code: "de", label: "Deutsch",    flag: "🇩🇪" },
  { code: "pt", label: "Português",  flag: "🇧🇷" },
  { code: "ar", label: "العربية",    flag: "🇸🇦" },
  { code: "zh", label: "中文",        flag: "🇨🇳" },
  { code: "ru", label: "Русский",    flag: "🇷🇺" },
  { code: "ja", label: "日本語",      flag: "🇯🇵" },
  { code: "hi", label: "हिन्दी",      flag: "🇮🇳" },
];

const SUPPORTED_CODES = LANGUAGES.map((l) => l.code);
const STORAGE_KEY = "softdugo_lang";
const USER_PICKED_KEY = "softdugo_lang_user_set";

function detectBrowserLang() {
  const nav = navigator.languages || [navigator.language || "en"];
  for (const locale of nav) {
    const code = locale.split("-")[0].toLowerCase();
    if (SUPPORTED_CODES.includes(code)) return code;
  }
  return "en";
}

const translations = {
  // Nav
  nav_features:        { en: "Features",   it: "Funzionalità", fr: "Fonctionnalités", es: "Características", de: "Funktionen",  pt: "Funcionalidades", ar: "الميزات",     zh: "功能",  ru: "Функции",    ja: "機能",     hi: "विशेषताएं" },
  nav_pricing:         { en: "Pricing",    it: "Prezzi",       fr: "Tarifs",          es: "Precios",        de: "Preise",       pt: "Preços",         ar: "الأسعار",    zh: "定价", ru: "Цены",       ja: "料金",     hi: "मूल्य निर्धारण" },
  nav_dashboard:       { en: "Dashboard",  it: "Dashboard",   fr: "Tableau de bord", es: "Panel",          de: "Dashboard",   pt: "Painel",         ar: "لوحة التحكم",zh: "仪表板",ru: "Панель",     ja: "ダッシュボード", hi: "डैशबोर्ड" },
  nav_operational:     { en: "operational",it: "operativo",   fr: "opérationnel",    es: "operativo",      de: "betrieb",     pt: "operacional",   ar: "تشغيل",     zh: "运行中",ru: "работает",  ja: "稼働中",   hi: "परिचालन" },

  // Sidebar
  side_dashboard:      { en: "Dashboard", it: "Dashboard", fr: "Tableau de bord", es: "Panel", de: "Dashboard" },
  side_resume:         { en: "Resume Builder", it: "Crea CV", fr: "Créer un CV", es: "Crear CV", de: "Lebenslauf" },
  side_ats:            { en: "ATS Checker", it: "Controllo ATS", fr: "Vérif. ATS", es: "Verificar ATS", de: "ATS-Prüfer" },
  side_translator:     { en: "Translator", it: "Traduttore", fr: "Traducteur", es: "Traductor", de: "Übersetzer" },
  side_pdf:            { en: "PDF to Excel", it: "PDF in Excel", fr: "PDF vers Excel", es: "PDF a Excel", de: "PDF zu Excel" },
  side_converter:      { en: "File Converter", it: "Converti file", fr: "Convertisseur", es: "Convertir", de: "Konverter" },
  side_sharing:        { en: "File Sharing", it: "Condividi file", fr: "Partage fichiers", es: "Compartir", de: "Datei teilen" },
  side_career:         { en: "Career Performance", it: "Performance carriera", fr: "Performance carrière", es: "Rendimiento", de: "Karriere" },
  side_cover:          { en: "Cover Letter", it: "Lettera di presentazione", fr: "Lettre de motivation", es: "Carta de presentación", de: "Anschreiben" },
  side_history:        { en: "History", it: "Cronologia", fr: "Historique", es: "Historial", de: "Verlauf" },
  side_settings:       { en: "Settings", it: "Impostazioni", fr: "Paramètres", es: "Configuración", de: "Einstellungen" },
  side_financial:      { en: "Financial Analyzer", it: "Analisi finanziaria", fr: "Analyse financière", es: "Análisis financiero", de: "Finanzanalyse" },
  side_chat:           { en: "Chat with Document", it: "Chat con documento", fr: "Chat avec doc", es: "Chat con doc", de: "Dok-Chat" },
  side_pricing:        { en: "Pricing & Plans", it: "Prezzi e piani", fr: "Tarifs et plans", es: "Precios y planes", de: "Preise & Pläne" },
  side_mentor:         { en: "Career Mentor", it: "Mentore carriera", fr: "Mentor carrière", es: "Mentor carrera", de: "Karriere-Mentor" },
  side_merger:         { en: "Merge Docs", it: "Unisci documenti", fr: "Fusionner docs", es: "Unir documentos", de: "Dokumente zusammenführen" },

  // Dashboard Home
  dash_welcome:        { en: "Welcome back", it: "Bentornato", fr: "Bon retour", es: "Bienvenido", de: "Willkommen zurück" },
  dash_subtitle:       { en: "What would you like to work on today?", it: "Su cosa vuoi lavorare oggi?", fr: "Sur quoi souhaitez-vous travailler aujourd'hui?", es: "¿En qué quieres trabajar hoy?", de: "Woran möchtest du heute arbeiten?" },
  dash_activity:       { en: "Recent Activity", it: "Attività recente", fr: "Activité récente", es: "Actividad reciente", de: "Letzte Aktivität" },
  dash_no_activity:    { en: "No recent activity yet. Start by creating a resume or translating a document.", it: "Nessuna attività recente. Inizia creando un CV o traducendo un documento.", fr: "Aucune activité récente. Commencez par créer un CV ou traduire un document.", es: "Sin actividad reciente. Comienza creando un CV o traduciendo un documento.", de: "Noch keine Aktivität. Starte mit einem Lebenslauf oder einem Dokument." },
  dash_create_resume:  { en: "Create Resume", it: "Crea CV", fr: "Créer un CV", es: "Crear CV", de: "Lebenslauf erstellen" },
  dash_analyze:        { en: "Analyze Resume", it: "Analizza CV", fr: "Analyser un CV", es: "Analizar CV", de: "Lebenslauf analysieren" },
  dash_translate:      { en: "Translate Document", it: "Traduci documento", fr: "Traduire un document", es: "Traducir documento", de: "Dokument übersetzen" },
  dash_resume_desc:    { en: "Build an ATS-ready resume with AI assistance.", it: "Crea un CV pronto per ATS con l'IA.", fr: "Créez un CV optimisé ATS avec l'IA.", es: "Crea un CV listo para ATS con IA.", de: "Erstelle einen ATS-optimierten Lebenslauf mit KI." },
  dash_analyze_desc:   { en: "Check your resume against a job description.", it: "Verifica il tuo CV con la descrizione del lavoro.", fr: "Comparez votre CV avec une offre d'emploi.", es: "Verifica tu CV contra una descripción de trabajo.", de: "Überprüfe deinen Lebenslauf gegen eine Stellenbeschreibung." },
  dash_translate_desc: { en: "Translate text between multiple languages.", it: "Traduci testo in più lingue.", fr: "Traduisez du texte dans plusieurs langues.", es: "Traduce texto entre múltiples idiomas.", de: "Übersetze Text zwischen mehreren Sprachen." },

  // Resume Builder
  rb_title:            { en: "Resume Builder", it: "Crea CV", fr: "Créateur de CV", es: "Creador de CV", de: "Lebenslauf-Builder" },
  rb_subtitle:         { en: "Generate a polished, ATS-optimized resume powered by AI.", it: "Genera un CV curato e ottimizzato per ATS con l'IA.", fr: "Générez un CV soigné et optimisé ATS grâce à l'IA.", es: "Genera un CV cuidado y optimizado para ATS con IA.", de: "Erstelle einen polierten, ATS-optimierten Lebenslauf mit KI." },
  rb_generate:         { en: "Generate Resume", it: "Genera CV", fr: "Générer le CV", es: "Generar CV", de: "Lebenslauf generieren" },
  rb_generating:       { en: "Generating...", it: "Generazione...", fr: "Génération...", es: "Generando...", de: "Wird erstellt..." },

  // ATS Checker
  ats_title:           { en: "ATS Resume Checker", it: "Controllo ATS", fr: "Vérificateur ATS", es: "Verificador ATS", de: "ATS-Lebenslaufprüfer" },
  ats_subtitle:        { en: "Analyze your resume against a job description for ATS compatibility.", it: "Analizza il tuo CV con la descrizione del lavoro.", fr: "Analysez votre CV par rapport à une offre d'emploi.", es: "Analiza tu CV frente a una descripción de trabajo.", de: "Analysiere deinen Lebenslauf auf ATS-Kompatibilität." },
  ats_your_resume:     { en: "Your Resume", it: "Il tuo CV", fr: "Votre CV", es: "Tu CV", de: "Dein Lebenslauf" },
  ats_job_desc:        { en: "Job Description", it: "Descrizione del lavoro", fr: "Offre d'emploi", es: "Descripción del trabajo", de: "Stellenbeschreibung" },
  ats_analyze:         { en: "Analyze Resume", it: "Analizza CV", fr: "Analyser le CV", es: "Analizar CV", de: "Lebenslauf analysieren" },
  ats_analyzing:       { en: "Analyzing...", it: "Analisi in corso...", fr: "Analyse en cours...", es: "Analizando...", de: "Analysiere..." },
  ats_score:           { en: "ATS Compatibility Score", it: "Punteggio compatibilità ATS", fr: "Score de compatibilité ATS", es: "Puntuación compatibilidad ATS", de: "ATS-Kompatibilitätswert" },
  ats_missing:         { en: "Missing Keywords", it: "Parole chiave mancanti", fr: "Mots-clés manquants", es: "Palabras clave faltantes", de: "Fehlende Schlüsselwörter" },
  ats_suggestions:     { en: "Suggestions", it: "Suggerimenti", fr: "Suggestions", es: "Sugerencias", de: "Vorschläge" },

  // Translator
  tr_title:            { en: "Document Translator", it: "Traduttore di documenti", fr: "Traducteur de documents", es: "Traductor de documentos", de: "Dokumentenübersetzer" },
  tr_subtitle:         { en: "Translate text or documents into any language with AI precision.", it: "Traduci testo o documenti in qualsiasi lingua con precisione AI.", fr: "Traduisez du texte ou des documents avec précision grâce à l'IA.", es: "Traduce texto o documentos con precisión de IA.", de: "Übersetze Texte oder Dokumente mit KI-Präzision." },
  tr_translate:        { en: "Translate", it: "Traduci", fr: "Traduire", es: "Traducir", de: "Übersetzen" },
  tr_translating:      { en: "Translating...", it: "Traduzione in corso...", fr: "Traduction en cours...", es: "Traduciendo...", de: "Übersetze..." },

  // File Sharing
  fs_title:            { en: "File Sharing", it: "Condivisione file", fr: "Partage de fichiers", es: "Compartir archivos", de: "Dateiaustausch" },
  fs_subtitle:         { en: "Share files instantly — like WeTransfer, built into Dugosoft.", it: "Condividi file istantaneamente — come WeTransfer, integrato in Dugosoft.", fr: "Partagez des fichiers instantanément — comme WeTransfer, intégré dans Dugosoft.", es: "Comparte archivos al instante — como WeTransfer, integrado en Dugosoft.", de: "Teile Dateien sofort — wie WeTransfer, in Dugosoft integriert.", pt: "Partilhe ficheiros instantaneamente — integrado no Dugosoft.", ar: "شارك الملفات فوراً عبر Dugosoft.", zh: "即时共享文件，Dugosoft内置。", ru: "Обменивайтесь файлами через Dugosoft.", ja: "Dugosoftでファイルを即座共有。", hi: "Dugosoft के जरिए तुरंत फ़ाइलें साझा करें।" },             { en: "Drag & drop files to share", it: "Trascina i file per condividere", fr: "Glissez-déposez vos fichiers", es: "Arrastra y suelta archivos para compartir", de: "Dateien hierher ziehen" },
  fs_create:           { en: "Create Transfer Link", it: "Crea link di trasferimento", fr: "Créer le lien de transfert", es: "Crear enlace de transferencia", de: "Übertragungslink erstellen" },
  fs_creating:         { en: "Creating link...", it: "Creazione link...", fr: "Création du lien...", es: "Creando enlace...", de: "Link wird erstellt..." },
  fs_ready:            { en: "Your transfer is ready!", it: "Il tuo trasferimento è pronto!", fr: "Votre transfert est prêt!", es: "¡Tu transferencia está lista!", de: "Deine Übertragung ist bereit!" },
  fs_copy:             { en: "Copy Link", it: "Copia link", fr: "Copier le lien", es: "Copiar enlace", de: "Link kopieren" },
  fs_history:          { en: "Transfer History", it: "Cronologia trasferimenti", fr: "Historique des transferts", es: "Historial de transferencias", de: "Übertragungsverlauf" },

  // File Converter
  fc_title:            { en: "File Converter", it: "Converti file", fr: "Convertisseur de fichiers", es: "Convertidor de archivos", de: "Dateikonverter" },
  fc_subtitle:         { en: "Convert your documents between formats instantly.", it: "Converti i tuoi documenti tra i formati all'istante.", fr: "Convertissez vos documents entre différents formats.", es: "Convierte tus documentos entre formatos al instante.", de: "Konvertiere Dokumente sofort zwischen Formaten." },
  fc_convert:          { en: "Convert File", it: "Converti file", fr: "Convertir le fichier", es: "Convertir archivo", de: "Datei konvertieren" },

  // Cover Letter
  cl_title:            { en: "Cover Letter Builder", it: "Generatore lettera di presentazione", fr: "Créateur de lettre de motivation", es: "Generador de carta de presentación", de: "Anschreiben-Generator" },
  cl_subtitle:         { en: "Generate a tailored, professional cover letter with AI.", it: "Genera una lettera di presentazione professionale con l'IA.", fr: "Générez une lettre de motivation professionnelle avec l'IA.", es: "Genera una carta de presentación profesional con IA.", de: "Erstelle ein professionelles Anschreiben mit KI." },
  cl_job_title:        { en: "Job Title", it: "Titolo posizione", fr: "Intitulé du poste", es: "Título del puesto", de: "Jobtitel" },
  cl_company:          { en: "Company Name", it: "Nome azienda", fr: "Nom de l'entreprise", es: "Nombre de la empresa", de: "Unternehmensname" },
  cl_your_name:        { en: "Your Name", it: "Il tuo nome", fr: "Votre nom", es: "Tu nombre", de: "Dein Name" },
  cl_qualifications:   { en: "Key Qualifications", it: "Qualifiche principali", fr: "Qualifications clés", es: "Calificaciones clave", de: "Schlüsselqualifikationen" },
  cl_experience:       { en: "Years of Experience", it: "Anni di esperienza", fr: "Années d'expérience", es: "Años de experiencia", de: "Jahre Erfahrung" },
  cl_tone:             { en: "Tone", it: "Tono", fr: "Ton", es: "Tono", de: "Ton" },
  cl_generate:         { en: "Generate Cover Letter", it: "Genera lettera", fr: "Générer la lettre", es: "Generar carta", de: "Anschreiben erstellen" },
  cl_generating:       { en: "Generating...", it: "Generazione...", fr: "Génération...", es: "Generando...", de: "Erstelle..." },
  cl_preview:          { en: "Preview", it: "Anteprima", fr: "Aperçu", es: "Vista previa", de: "Vorschau" },
  cl_copy:             { en: "Copy Text", it: "Copia testo", fr: "Copier le texte", es: "Copiar texto", de: "Text kopieren" },
  cl_download_pdf:     { en: "Download PDF", it: "Scarica PDF", fr: "Télécharger PDF", es: "Descargar PDF", de: "PDF herunterladen" },
  cl_download_docx:    { en: "Download DOCX", it: "Scarica DOCX", fr: "Télécharger DOCX", es: "Descargar DOCX", de: "DOCX herunterladen" },

  // LinkedIn Share
  li_share_resume:     { en: "Share to LinkedIn", it: "Condividi su LinkedIn", fr: "Partager sur LinkedIn", es: "Compartir en LinkedIn", de: "Auf LinkedIn teilen" },
  li_share_cover:      { en: "Share to LinkedIn", it: "Condividi su LinkedIn", fr: "Partager sur LinkedIn", es: "Compartir en LinkedIn", de: "Auf LinkedIn teilen" },
  li_optimize:         { en: "LinkedIn Optimization", it: "Ottimizzazione LinkedIn", fr: "Optimisation LinkedIn", es: "Optimización LinkedIn", de: "LinkedIn-Optimierung" },

  // Common
  search_tools:        { en: "Search tools...", it: "Cerca strumenti...", fr: "Rechercher des outils...", es: "Buscar herramientas...", de: "Tools suchen..." },
  copy:                { en: "Copy", it: "Copia", fr: "Copier", es: "Copiar", de: "Kopieren" },
  download:            { en: "Download", it: "Scarica", fr: "Télécharger", es: "Descargar", de: "Herunterladen" },
  processing:          { en: "Processing...", it: "Elaborazione...", fr: "Traitement...", es: "Procesando...", de: "Verarbeitung..." },

  // Auto-detect notification
  lang_detected:       { en: "Language set to English", it: "Lingua impostata: Italiano", fr: "Langue définie : Français", es: "Idioma establecido: Español", de: "Sprache gesetzt: Deutsch" },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const didInit = useRef(false);

  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return detectBrowserLang();
  });

  // On very first visit (no saved preference), show detection toast
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const userHasPicked = localStorage.getItem(USER_PICKED_KEY);
    if (!userHasPicked) {
      const detected = detectBrowserLang();
      if (detected !== "en") {
        // Slight delay so toast renders after app mounts
        setTimeout(() => {
          const langObj = LANGUAGES.find((l) => l.code === detected);
          toast.info(`${langObj?.flag ?? ""} ${translations.lang_detected[detected]}`, { duration: 4000 });
        }, 1200);
      }
      localStorage.setItem(STORAGE_KEY, detected);
      setLang(detected);
    }
  }, []);

  const switchLang = (code) => {
    setLang(code);
    localStorage.setItem(STORAGE_KEY, code);
    localStorage.setItem(USER_PICKED_KEY, "1"); // Mark as manually set — never override again
  };

  const t = (key) => translations[key]?.[lang] ?? translations[key]?.["en"] ?? key;

  return (
    <LangContext.Provider value={{ lang, switchLang, t, LANGUAGES }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}