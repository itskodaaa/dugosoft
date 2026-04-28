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
  nav_about:           { en: "About",      it: "Chi siamo",    fr: "À propos",        es: "Nosotros",       de: "Über uns", pt: "Sobre", ar: "حول", zh: "关于", ru: "О нас", ja: "について", hi: "हमारे बारे में" },
  nav_contact:         { en: "Contact",    it: "Contatti",     fr: "Contact",         es: "Contacto",       de: "Kontakt", pt: "Contato", ar: "اتصال", zh: "联系我们", ru: "Контакты", ja: "お問い合わせ", hi: "संपर्क करें" },
  nav_my_account:      { en: "My Account", it: "Il mio account",fr: "Mon compte",     es: "Mi cuenta",      de: "Mein Konto", pt: "Minha Conta", ar: "حسابي", zh: "我的账户", ru: "Мой аккаунт", ja: "マイアカウント", hi: "मेरा खाता" },
  nav_sign_in:         { en: "Sign In",    it: "Accedi",       fr: "Connexion",       es: "Ingresar",       de: "Anmelden", pt: "Entrar", ar: "تسجيل الدخول", zh: "登录", ru: "Войти", ja: "サインイン", hi: "साइन इन करें" },
  nav_get_started:     { en: "Get Started Free", it: "Inizia gratis", fr: "Essayer gratuitement", es: "Empezar gratis", de: "Kostenlos starten", pt: "Começar Grátis", ar: "ابدأ مجاناً", zh: "免费开始", ru: "Начать бесплатно", ja: "無料で始める", hi: "मुफ्त में शुरू करें" },
  nav_features_resume: { en: "Resume Builder", it: "Crea CV", fr: "Créateur de CV", es: "Creador de CV", de: "Lebenslauf-Builder" },
  nav_features_matcher: { en: "Career Matcher", it: "Corrispondenza carriera", fr: "Match carrière", es: "Match carrera", de: "Karriere-Matcher" },
  nav_features_translator: { en: "AI Translator", it: "Traduttore AI", fr: "Traducteur IA", es: "Traductor IA", de: "KI-Übersetzer" },
  nav_features_ats:    { en: "ATS Checker", it: "Controllo ATS", fr: "Vérificateur ATS", es: "Verificador ATS", de: "ATS-Prüfer" },
  nav_features_vault:  { en: "CV Vault", it: "Vault CV", fr: "Coffre-fort CV", es: "Bóveda de CV", de: "CV-Vault" },
  nav_features_chat:   { en: "Chat with Document", it: "Chat con documento", fr: "Chat avec document", es: "Chat con documento", de: "Dokumenten-Chat" },
  nav_features_workspaces: { en: "Team Workspaces", it: "Aree di lavoro team", fr: "Espaces d'équipe", es: "Espacios de equipo", de: "Team-Workspaces" },
  nav_features_all:    { en: "All Tools →", it: "Tutti gli strumenti →", fr: "Tous les outils →", es: "Todas las herramientas →", de: "Alle Tools →" },

  nav_features_resume_desc: { en: "ATS-optimized resumes", it: "CV ottimizzati per ATS", fr: "CV optimisés ATS", es: "CV optimizados para ATS", de: "ATS-optimierte Lebensläufe" },
  nav_features_matcher_desc: { en: "Match jobs worldwide", it: "Trova lavoro nel mondo", fr: "Match emplois monde", es: "Match empleos mundo", de: "Jobs weltweit finden" },
  nav_features_translator_desc: { en: "50+ languages", it: "50+ lingue", fr: "50+ langues", es: "50+ idiomas", de: "50+ Sprachen" },
  nav_features_ats_desc: { en: "Score your resume", it: "Punteggio del tuo CV", fr: "Scorez votre CV", es: "Califica tu CV", de: "Lebenslauf bewerten" },
  nav_features_vault_desc: { en: "Multilingual CV storage", it: "Archivio CV multilingue", fr: "Stockage CV multilingue", es: "Archivo de CV multilingüe", de: "Multilinguale CV-Speicherung" },
  nav_features_chat_desc: { en: "Ask your docs anything", it: "Chiedi ai tuoi documenti", fr: "Posez vos questions", es: "Pregunta a tus docs", de: "Fragen an Dokumente" },
  nav_features_workspaces_desc: { en: "Collaborate on docs", it: "Collabora sui documenti", fr: "Collaborez sur docs", es: "Colabora en docs", de: "Dok-Kollaboration" },
  nav_features_all_desc: { en: "View full dashboard", it: "Vedi dashboard completa", fr: "Voir tableau de bord", es: "Ver panel completo", de: "Gesamtes Dashboard" },


  // Sidebar Groups
  side_group_docs:     { en: "Document Utilities", it: "Strumenti Documenti", fr: "Utilitaires Doc", es: "Utilidades Doc", de: "Dokument-Utilities", pt: "Utilitários de Doc", ar: "أدوات المستندات", zh: "文档工具", ru: "Инструменты для док.", ja: "ドキュメントユーティリティ", hi: "दस्तावेज़ उपयोगिताएँ" },
  side_group_career:   { en: "Career Accelerator", it: "Acceleratore Carriera", fr: "Accélérateur Carrière", es: "Acelerador Carrera", de: "Karriere-Beschleuniger", pt: "Acelerador de Carreira", ar: "مسرع المسار المهني", zh: "职业加速器", ru: "Карьерный ускоритель", ja: "キャリアアクセラレーター", hi: "करियर एक्सेलेरेटर" },
  side_group_sales:    { en: "Sales & Prospecting", it: "Vendite e Prospecting", fr: "Ventes et Prospection", es: "Ventas y Prospección", de: "Vertrieb & Akquise", pt: "Vendas e Prospecção", ar: "المبيعات والتنقيب", zh: "销售与勘探", ru: "Продажи и поиск", ja: "販売とプロスペクティング", hi: "बिक्री और पूर्वेक्षण" },
  side_group_collab:   { en: "Collaboration & Chat", it: "Collaborazione e Chat", fr: "Collab et Chat", es: "Colaboración y Chat", de: "Kollaboration & Chat", pt: "Colaboração e Chat", ar: "التعاون والدردشة", zh: "协作与聊天", ru: "Сотрудничество и чат", ja: "コラボレーションとチャット", hi: "सहयोग और चैट" },
  side_dashboard:      { en: "Dashboard", it: "Dashboard", fr: "Tableau de bord", es: "Panel", de: "Dashboard", pt: "Painel", ar: "لوحة القيادة", zh: "仪表板", ru: "Панель", ja: "ダッシュボード", hi: "डैशबोर्ड" },
  side_resume:         { en: "Resume Builder", it: "Crea CV", fr: "Créer un CV", es: "Crear CV", de: "Lebenslauf" },
  side_ats:            { en: "ATS Checker", it: "Controllo ATS", fr: "Vérif. ATS", es: "Verificar ATS", de: "ATS-Prüfer" },
  side_translator:     { en: "Translator", it: "Traduttore", fr: "Traducteur", es: "Traductor", de: "Übersetzer" },
  side_pdf:            { en: "PDF Tools", it: "Strumenti PDF", fr: "Outils PDF", es: "Herramientas PDF", de: "PDF-Tools" },
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
  side_language_tools: { en: "AI Language Tools", it: "Strumenti lingua AI", fr: "Outils langue IA", es: "Herramientas lengua IA", de: "KI-Sprachtools" },
  side_ocr:            { en: "OCR & Extract", it: "OCR ed estrazione", fr: "OCR et extraction", es: "OCR y extracción", de: "OCR & Extraktion" },
  side_documents:      { en: "My Documents", it: "I miei documenti", fr: "Mes documents", es: "Mis documentos", de: "Meine Dokumente" },
  side_import:         { en: "Import Resume", it: "Importa CV", fr: "Importer CV", es: "Importar CV", de: "Lebenslauf importieren" },
  side_design:         { en: "Design Editor", it: "Editor design", fr: "Éditeur design", es: "Editor diseño", de: "Design-Editor" },
  side_vault:          { en: "CV Vault", it: "Vault CV", fr: "Coffre-fort CV", es: "Bóveda de CV", de: "CV-Vault" },
  side_linkedin:       { en: "LinkedIn Import", it: "Importa LinkedIn", fr: "Import LinkedIn", es: "Importar LinkedIn", de: "LinkedIn-Import" },
  side_resume_translator: { en: "Resume Translator", it: "Traduttore CV", fr: "Traducteur CV", es: "Traductor CV", de: "Lebenslauf-Übersetzer" },
  side_linkedin_optimizer: { en: "LinkedIn Optimizer", it: "Ottimizzatore LinkedIn", fr: "Optimiseur LinkedIn", es: "Optimización LinkedIn", de: "LinkedIn-Optimierer" },
  side_cover_ai:       { en: "Cover Letter AI", it: "Lettera AI", fr: "Lettre IA", es: "Carta IA", de: "Anschreiben-KI" },
  side_matcher:        { en: "Career Matcher", it: "Corrispondenza carriera", fr: "Match carrière", es: "Match carrera", de: "Karriere-Matcher" },
  side_skill_gap:      { en: "Skill Gap", it: "Gap competenze", fr: "Gap compétences", es: "Gap competencias", de: "Skill-Gap" },
  side_interview:      { en: "Interview Prep", it: "Prep colloquio", fr: "Prép entretien", es: "Prep entrevista", de: "Interview-Vorbereitung" },
  side_portfolio:      { en: "Portfolio", it: "Portfolio", fr: "Portfolio", es: "Portafolio", de: "Portfolio" },
  side_vibe:           { en: "Vibe Prospecting", it: "Vibe Prospecting", fr: "Vibe Prospecting", es: "Vibe Prospecting", de: "Vibe-Prospecting" },
  side_assistant:      { en: "AI Assistant", it: "Assistente AI", fr: "Assistant IA", es: "Asistente IA", de: "KI-Assistent" },
  side_job_tracker:    { en: "Job Tracker", it: "Monitoraggio lavoro", fr: "Suivi emploi", es: "Rastreo empleo", de: "Job-Tracker" },
  side_workspaces:     { en: "Workspaces", it: "Aree di lavoro", fr: "Espaces", es: "Espacios", de: "Workspaces" },
  side_esign:          { en: "E-Signature", it: "E-Signature", fr: "Signature électronique", es: "Firma electrónica", de: "E-Signatur" },
  side_analytics:      { en: "Analytics", it: "Analisi", fr: "Analytique", es: "Analítica", de: "Analytik", pt: "Analítica", ar: "التحليلات", zh: "分析", ru: "Аналитика", ja: "分析", hi: "विश्लेषण" },
  side_referral:       { en: "Referral", it: "Referral", fr: "Parrainage", es: "Referidos", de: "Referral", pt: "Referência", ar: "الإحالة", zh: "推荐", ru: "Реферал", ja: "紹介", hi: "रेफरल" },
  side_upgrade:        { en: "Upgrade to Premium", it: "Passa a Premium", fr: "Passer à Premium", es: "Pasar a Premium", de: "Auf Premium upgraden", pt: "Atualizar para Premium", ar: "الترقية إلى بريميوم", zh: "升级到高级版", ru: "Обновить до Premium", ja: "プレミアムにアップグレード", hi: "प्रीमियम में अपग्रेड करें" },
  side_unlock:         { en: "Unlock all tools & features", it: "Sblocca tutti gli strumenti", fr: "Débloquer tous les outils", es: "Desbloquear herramientas", de: "Alle Tools freischalten", pt: "Desbloquear tudo", ar: "فتح جميع الأدوات", zh: "解锁所有工具", ru: "Разблокировать все функции", ja: "全機能のロック解除", hi: "सभी टूल अनलॉक करें" },

  // Dashboard Home
  dash_welcome:        { en: "Welcome back", it: "Bentornato", fr: "Bon retour", es: "Bienvenido", de: "Willkommen zurück", pt: "Bem-vindo de volta", ar: "مرحباً بعودتك", zh: "欢迎回来", ru: "С возвращением", ja: "おかえりなさい", hi: "वापसी पर स्वागत है" },
  dash_subtitle:       { en: "What would you like to work on today?", it: "Su cosa vuoi lavorare oggi?", fr: "Sur quoi souhaitez-vous travailler aujourd'hui?", es: "¿En qué quieres trabajar hoy?", de: "Woran möchtest du heute arbeiten?", pt: "O que você gostaria de fazer hoje?", ar: "ماذا تود أن تفعل اليوم؟", zh: "今天你想做什么？", ru: "Над чем вы хотите поработать сегодня?", ja: "今日は何をしますか？", hi: "आज आप क्या करना चाहेंगे?" },
  dash_activity:       { en: "Recent Activity", it: "Attività recente", fr: "Activité récente", es: "Actividad reciente", de: "Letzte Aktivität", pt: "Atividade Recente", ar: "النشاط الأخير", zh: "最近活动", ru: "Последние действия", ja: "最近の活動", hi: "हालिया गतिविधि" },
  dash_no_activity:    { en: "No recent activity yet. Start by creating a resume or translating a document.", it: "Nessuna attività recente. Inizia creando un CV o traducendo un documento.", fr: "Aucune activité récente. Commencez par créer un CV ou traduire un document.", es: "Sin actividad reciente. Comienza creando un CV o traduciendo un documento.", de: "Noch keine Aktivität. Starte mit einem Lebenslauf oder einem Dokument." },
  dash_create_resume:  { en: "Create Resume", it: "Crea CV", fr: "Créer un CV", es: "Crear CV", de: "Lebenslauf erstellen" },
  dash_analyze:        { en: "Analyze Resume", it: "Analizza CV", fr: "Analyser un CV", es: "Analizar CV", de: "Lebenslauf analysieren" },
  dash_translate:      { en: "Translate Document", it: "Traduci documento", fr: "Traduire un document", es: "Traducir documento", de: "Dokument übersetzen" },
  dash_resume_desc:    { en: "Build an ATS-ready resume with AI assistance.", it: "Crea un CV pronto per ATS con l'IA.", fr: "Créez un CV optimisé ATS avec l'IA.", es: "Crea un CV listo para ATS con IA.", de: "Erstelle einen ATS-optimierten Lebenslauf mit KI." },
  dash_analyze_desc:   { en: "Check your resume against a job description.", it: "Verifica il tuo CV con la descrizione del lavoro.", fr: "Comparez votre CV avec une offre d'emploi.", es: "Verifica tu CV contra una descripción de trabajo.", de: "Überprüfe deinen Lebenslauf gegen eine Stellenbeschreibung." },
  dash_translate_desc: { en: "Translate text between multiple languages.", it: "Traduci testo in più lingue.", fr: "Traduisez du texte dans plusieurs langues.", es: "Traduce texto entre múltiples idiomas.", de: "Übersetze Text zwischen mehreren Sprachen." },

  // Plans & Usage
  plan_free:           { en: "Free",       it: "Gratis",       fr: "Gratuit",      es: "Gratis",       de: "Kostenlos", pt: "Grátis", ar: "مجاني", zh: "免费", ru: "Бесплатно", ja: "無料", hi: "मुफ्त" },
  plan_pro:            { en: "Pro",        it: "Pro",          fr: "Pro",          es: "Pro",          de: "Pro", pt: "Pro", ar: "برو", zh: "专业版", ru: "Pro", ja: "プロ", hi: "प्रो" },
  plan_business:       { en: "Business",   it: "Business",     fr: "Business",     es: "Business",     de: "Business", pt: "Negócios", ar: "بيزنس", zh: "商业版", ru: "Бизнес", ja: "ビジネス", hi: "बिजनेस" },
  plan_label:          { en: "Plan",       it: "Piano",        fr: "Plan",         es: "Plan",         de: "Plan", pt: "Plano", ar: "الخطة", zh: "计划", ru: "План", ja: "プラン", hi: "योजना" },
  usage_today:         { en: "Today's Usage", it: "Utilizzo oggi", fr: "Usage du jour", es: "Uso de hoy", de: "Heutige Nutzung", pt: "Uso de Hoje", ar: "استخدام اليوم", zh: "今日使用量", ru: "Использование сегодня", ja: "今日の使用量", hi: "आज का उपयोग" },
  usage_unlimited:     { en: "Unlimited",  it: "Illimitato",   fr: "Illimité",     es: "Ilimitado",    de: "Unbegrenzt", pt: "Ilimitado", ar: "غير محدود", zh: "无限", ru: "Безлимитно", ja: "無制限", hi: "असीमित" },
  nav_upgrade_plan:    { en: "Upgrade Plan", it: "Aggiorna piano", fr: "Améliorer plan", es: "Mejorar plan", de: "Plan upgraden", pt: "Atualizar Plano", ar: "ترقية الخطة", zh: "升级计划", ru: "Обновить план", ja: "プランをアップグレード", hi: "योजना अपग्रेड करें" },
  nav_sign_out:        { en: "Sign Out",   it: "Esci",         fr: "Déconnexion",  es: "Cerrar sesión",de: "Abmelden", pt: "Sair", ar: "تسجيل الخروج", zh: "退出登录", ru: "Выйти", ja: "サインアウト", hi: "साइन आउट" },


  // Resume Builder
  rb_title:            { en: "Resume Builder", it: "Crea CV", fr: "Créateur de CV", es: "Creador de CV", de: "Lebenslauf-Builder", pt: "Construtor de Currículo", ar: "منشئ السيرة الذاتية", zh: "简历生成器", ru: "Конструктор резюме", ja: "履歴書ビルダー", hi: "रिज्यूमे बिल्डर" },
  rb_subtitle:         { en: "Generate a polished, ATS-optimized resume powered by AI.", it: "Genera un CV curato e ottimizzato per ATS con l'IA.", fr: "Générez un CV soigné et optimisé ATS grâce à l'IA.", es: "Genera un CV cuidado y optimizado para ATS con IA.", de: "Erstelle einen polierten, ATS-optimierten Lebenslauf mit KI." },
  rb_generate:         { en: "Generate Resume", it: "Genera CV", fr: "Générer le CV", es: "Generar CV", de: "Lebenslauf generieren", pt: "Gerar Currículo", ar: "إنشاء سيرة ذاتية", zh: "生成简历", ru: "Создать резюме", ja: "履歴書を生成", hi: "रिज्यूमे जेनरेट करें" },
  rb_generating:       { en: "Generating...", it: "Generazione...", fr: "Génération...", es: "Generando...", de: "Wird erstellt...", pt: "Gerando...", ar: "جاري الإنشاء...", zh: "生成中...", ru: "Создание...", ja: "生成中...", hi: "जेनरेट हो रहा है..." },

  // ATS Checker
  ats_title:           { en: "ATS Resume Checker", it: "Controllo ATS", fr: "Vérificateur ATS", es: "Verificador ATS", de: "ATS-Lebenslaufprüfer", pt: "Verificador ATS", ar: "مدقق ATS", zh: "ATS 检查器", ru: "Проверка ATS", ja: "ATSチェッカー", hi: "ATS चेकर" },
  ats_subtitle:        { en: "Analyze your resume against a job description for ATS compatibility.", it: "Analizza il tuo CV con la descrizione del lavoro.", fr: "Analysez votre CV par rapport à une offre d'emploi.", es: "Analiza tu CV frente a una descripción de trabajo.", de: "Analysiere deinen Lebenslauf auf ATS-Kompatibilität." },
  ats_your_resume:     { en: "Your Resume", it: "Il tuo CV", fr: "Votre CV", es: "Tu CV", de: "Dein Lebenslauf" },
  ats_job_desc:        { en: "Job Description", it: "Descrizione del lavoro", fr: "Offre d'emploi", es: "Descripción del trabajo", de: "Stellenbeschreibung" },
  ats_analyze:         { en: "Analyze Resume", it: "Analizza CV", fr: "Analyser le CV", es: "Analizar CV", de: "Lebenslauf analysieren", pt: "Analisar Currículo", ar: "تحليل السيرة الذاتية", zh: "分析简历", ru: "Анализировать резюме", ja: "履歴書を分析", hi: "रिज्यूमे का विश्लेषण करें" },
  ats_analyzing:       { en: "Analyzing...", it: "Analisi in corso...", fr: "Analyse en cours...", es: "Analizando...", de: "Analysiere..." },
  ats_score:           { en: "ATS Compatibility Score", it: "Punteggio compatibilità ATS", fr: "Score de compatibilité ATS", es: "Puntuación compatibilidad ATS", de: "ATS-Kompatibilitätswert" },
  ats_missing:         { en: "Missing Keywords", it: "Parole chiave mancanti", fr: "Mots-clés manquants", es: "Palabras clave faltantes", de: "Fehlende Schlüsselwörter" },
  ats_suggestions:     { en: "Suggestions", it: "Suggerimenti", fr: "Suggestions", es: "Sugerencias", de: "Vorschläge" },

  // Translator
  tr_title:            { en: "Document Translator", it: "Traduttore di documenti", fr: "Traducteur de documents", es: "Traductor de documentos", de: "Dokumentenübersetzer" },
  tr_subtitle:         { en: "Translate text or documents into any language with AI precision.", it: "Traduci testo o documenti in qualsiasi lingua con precisione AI.", fr: "Traduisez du texte ou des documents avec précision grâce à l'IA.", es: "Traduce texto o documentos con precisión de IA.", de: "Übersetze Texte oder Dokumente mit KI-Präzision." },
  tr_translate:        { en: "Translate", it: "Traduci", fr: "Traduire", es: "Traducir", de: "Übersetzen", pt: "Traduzir", ar: "ترجمة", zh: "翻译", ru: "Перевести", ja: "翻訳", hi: "अनुवाद" },
  tr_translating:      { en: "Translating...", it: "Traduzione in corso...", fr: "Traduction en cours...", es: "Traduciendo...", de: "Übersetze...", pt: "Traduzindo...", ar: "جاري الترجمة...", zh: "翻译中...", ru: "Перевод...", ja: "翻訳中...", hi: "अनुवाद हो रहा है..." },

  // File Sharing
  fs_title:            { en: "File Sharing", it: "Condivisione file", fr: "Partage de fichiers", es: "Compartir archivos", de: "Dateiaustausch" },
  fs_subtitle:         { en: "Share files instantly — like WeTransfer, built into Dugosoft.", it: "Condividi file istantaneamente — come WeTransfer, integrato in Dugosoft.", fr: "Partagez des fichiers instantanément — comme WeTransfer, intégré dans Dugosoft.", es: "Comparte archivos al instante — como WeTransfer, integrado en Dugosoft.", de: "Teile Dateien sofort — wie WeTransfer, in Dugosoft integriert.", pt: "Partilhe ficheiros instantaneamente — integrado no Dugosoft.", ar: "شارك الملفات فوراً عبر Dugosoft.", zh: "即时共享文件，Dugosoft内置。", ru: "Обменивайтесь файлами через Dugosoft.", ja: "Dugosoftでファイルを即座共有。", hi: "Dugosoft के जरिए तुरंत फ़ाइलें साझा करें।" },
  fs_drag:             { en: "Drag & drop files to share", it: "Trascina i file per condividere", fr: "Glissez-déposez vos fichiers", es: "Arrastra y suelta archivos para compartir", de: "Dateien hierher ziehen" },
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
  copy:                { en: "Copy", it: "Copia", fr: "Copier", es: "Copiar", de: "Kopieren", pt: "Copiar", ar: "نسخ", zh: "复制", ru: "Копировать", ja: "コピー", hi: "कॉपी" },
  download:            { en: "Download", it: "Scarica", fr: "Télécharger", es: "Descargar", de: "Herunterladen", pt: "Baixar", ar: "تحميل", zh: "下载", ru: "Скачать", ja: "ダウンロード", hi: "डाउनलोड" },
  processing:          { en: "Processing...", it: "Elaborazione...", fr: "Traitement...", es: "Procesando...", de: "Verarbeitung...", pt: "Processando...", ar: "جاري المعالجة...", zh: "处理中...", ru: "Обработка...", ja: "処理中...", hi: "प्रसंस्करण हो रहा है..." },

  // Auto-detect notification
  lang_detected:       { en: "Language set to English", it: "Lingua impostata: Italiano", fr: "Langue définie : Français", es: "Idioma establecido: Español", de: "Sprache gesetzt: Deutsch" },

  // Vibe Prospecting App
  vp_overview: { en: 'Overview', it: 'Panoramica', fr: 'Aperçu', es: 'Resumen', de: 'Überblick', pt: 'Visão Geral', ar: 'نظرة عامة', zh: '概览', ru: 'Обзор', ja: '概要', hi: 'अवलोकन' },
  vp_leadFinder: { en: 'Lead Finder', it: 'Trova Lead', fr: 'Trouver Leads', es: 'Buscar Leads', de: 'Lead-Finder', pt: 'Localizador de Leads', ar: 'مكتشف العملاء', zh: '线索查找器', ru: 'Поиск лидов', ja: 'リードファインダー', hi: 'लीड फाइंडर' },
  vp_kanban: { en: 'Kanban Board', it: 'Bacheca', fr: 'Tableau', es: 'Tablero', de: 'Kanban-Board', pt: 'Quadro Kanban', ar: 'لوحة كانبان', zh: '看板', ru: 'Канбан-доска', ja: 'カンバンボード', hi: 'कैनबन बोर्ड' },
  vp_aiMessages: { en: 'AI Messages', it: 'Messaggi IA', fr: 'Messages IA', es: 'Mensajes IA', de: 'KI-Nachrichten', pt: 'Mensagens IA', ar: 'رسائل الذكاء الاصطعي', zh: 'AI 消息', ru: 'AI сообщения', ja: 'AIメッセージ', hi: 'AI संदेश' },
  vp_campaigns: { en: 'Campaigns', it: 'Campagne', fr: 'Campagnes', es: 'Campañas', de: 'Kampagnen', pt: 'Campanhas', ar: 'الحملات', zh: '活动', ru: 'Кампании', ja: 'キャンペーン', hi: 'अभियान' },
  vp_inbox: { en: 'Inbox', it: 'Posta', fr: 'Boîte', es: 'Bandeja', de: 'Posteingang', pt: 'Caixa de Entrada', ar: 'البريد الوارد', zh: '收件箱', ru: 'Входящие', ja: '受信トレイ', hi: 'इनबॉक्स' },
  vp_resume: { en: 'Resume Intelligence', it: 'CV Intelligence', fr: 'CV Intelligence', es: 'Inteligencia CV', de: 'Lebenslauf-Intelligenz', pt: 'Inteligência de Currículo', ar: 'ذكاء السيرة الذاتية', zh: '简历智能', ru: 'Интеллект резюме', ja: '履歴書インテリジェンス', hi: 'रिज्यूमे इंटेलिजेंस' },
  vp_interview: { en: 'Interview Prep', it: 'Colloquio', fr: 'Entretien', es: 'Entrevista', de: 'Interview-Vorbereitung', pt: 'Preparação para Entrevista', ar: 'تحضير المقابلة', zh: '面试准备', ru: 'Подготовка к интервью', ja: '面接準備', hi: 'साक्षात्कार की तैयारी' },
  vp_analytics: { en: 'Analytics', it: 'Analitica', fr: 'Analytique', es: 'Analíticas', de: 'Analytik', pt: 'Analítica', ar: 'التحليلات', zh: '分析', ru: 'Аналитика', ja: '分析', hi: 'विश्लेषण' },
  vp_upgrade: { en: 'Upgrade', it: 'Aggiorna', fr: 'Améliorer', es: 'Mejorar', de: 'Upgrade', pt: 'Atualizar', ar: 'ترقية', zh: '升级', ru: 'Обновить', ja: 'アップグレード', hi: 'अपग्रेड' },
  vp_upgradeToPro: { en: 'Upgrade to Pro', it: 'Passa a Pro', fr: 'Passer à Pro', es: 'Mejorar a Pro', de: 'Auf Pro upgraden' },
  vp_upgradeToBusiness: { en: 'Upgrade to Business', it: 'Passa a Business', fr: 'Passer à Business', es: 'Mejorar a Business', de: 'Auf Business upgraden' },
  vp_welcome: { en: 'Welcome back', it: 'Bentornato', fr: 'Bon retour', es: 'Bienvenido', de: 'Willkommen zurück' },
  vp_searchPlaceholder: { en: 'Search leads, campaigns...', it: 'Cerca lead, campagne...', fr: 'Rechercher leads, campagnes...', es: 'Buscar leads, campañas...', de: 'Leads, Kampagnen suchen...' },
  vp_leadsContacted: { en: 'Leads Contacted', it: 'Lead Contattati', fr: 'Leads Contactés', es: 'Leads Contactados', de: 'Leads kontaktiert', pt: 'Leads Contatados', ar: 'العملاء الذين تم الاتصال بهم', zh: '已联系线索', ru: 'Контактные лиды', ja: '連絡済みリード', hi: 'संपर्क किए गए लीड' },
  vp_replyRate: { en: 'Reply Rate', it: 'Tasso Risposta', fr: 'Taux Réponse', es: 'Tasa Respuesta', de: 'Antwortrate', pt: 'Taxa de Resposta', ar: 'معدل الرد', zh: '回复率', ru: 'Процент ответов', ja: '返信率', hi: 'जवाब दर' },
  vp_interviewSuccess: { en: 'Interview Success', it: 'Successo Colloquio', fr: 'Succès Entretien', es: 'Éxito Entrevista', de: 'Interview-Erfolg', pt: 'Sucesso na Entrevista', ar: 'نجاح المقابلة', zh: '面试成功率', ru: 'Успех на интервью', ja: '面接成功', hi: 'साक्षात्कार सफलता' },
  vp_conversion: { en: 'Conversion', it: 'Conversione', fr: 'Conversion', es: 'Conversión', de: 'Konvertierung', pt: 'Conversão', ar: 'التحويل', zh: '转化率', ru: 'Конверсия', ja: 'コンバージョン', hi: 'रूपांतरण' },
  vp_generateMessage: { en: 'Generate Message', it: 'Genera Messaggio', fr: 'Générer Message', es: 'Generar Mensaje', de: 'Nachricht generieren' },
  vp_addToKanban: { en: 'Add to Kanban', it: 'Aggiungi a Bacheca', fr: 'Ajouter au Tableau', es: 'Añadir a Tablero', de: 'Zu Kanban hinzufügen' },
  vp_industry: { en: 'Industry', it: 'Settore', fr: 'Secteur', es: 'Industria', de: 'Branche' },
  vp_role: { en: 'Role', it: 'Ruolo', fr: 'Poste', es: 'Rol', de: 'Rolle', pt: 'Cargo', ar: 'الدور', zh: '角色', ru: 'Роль', ja: '役割', hi: 'भूमिका' },
  vp_location: { en: 'Location', it: 'Luogo', fr: 'Lieu', es: 'Ubicación', de: 'Standort', pt: 'Localização', ar: 'الموقع', zh: '地点', ru: 'Местоположение', ja: '場所', hi: 'स्थान' },
  vp_keywords: { en: 'Keywords', it: 'Parole chiave', fr: 'Mots-clés', es: 'Palabras clave', de: 'Schlüsselwörter', pt: 'Palavras-chave', ar: 'كلمات رئيسية', zh: '关键词', ru: 'Ключевые слова', ja: 'キーワード', hi: 'कीवर्ड' },
  vp_findLeads: { en: 'Find Leads', it: 'Trova', fr: 'Trouver', es: 'Buscar', de: 'Leads finden', pt: 'Encontrar Leads', ar: 'البحث عن عملاء', zh: '查找线索', ru: 'Найти лидов', ja: 'リードを見つける', hi: 'लीड खोजें' },
  vp_recentActivity: { en: 'Recent Activity', it: 'Attività Recente', fr: 'Actività Recente', es: 'Actividad Reciente', de: 'Letzte Attività' },
  vp_locked: { en: 'Premium Feature', it: 'Funzione Premium', fr: 'Fonction Premium', es: 'Función Premium', de: 'Premium-Funktion' },
  vp_lockedDesc: { en: 'This feature requires an upgrade', it: 'Questa funzione richiede aggiornamento', fr: 'Cette fonction nécessite une mise à niveau', es: 'Esta función requiere mejora', de: 'Diese Funktion erfordert ein Upgrade' },
  vp_prospecting_desc: { en: "Here's how your prospecting is going today.", it: "Ecco come sta andando la tua ricerca oggi.", fr: "Voici l'état de votre prospection aujourd'hui.", es: "Así va tu prospección hoy.", de: "So läuft deine Akquise heute." },
  vp_start_prospecting: { en: "Start prospecting", it: "Inizia ricerca", fr: "Démarrer la prospection", es: "Empezar prospección", de: "Akquise starten" },
  vp_activity_over_time: { en: "Activity over time", it: "Attività nel tempo", fr: "Activité au fil du temps", es: "Actividad en el tiempo", de: "Aktivität im Zeitverlauf" },
  vp_last_30_days: { en: "Last 30 days", it: "Ultimi 30 giorni", fr: "30 derniers jours", es: "Últimos 30 días", de: "Letzte 30 Tage" },
  vp_discover_prospects: { en: "Discover prospects with AI", it: "Scopri lead con l'IA", fr: "Découvrez des prospects avec l'IA", es: "Descubre prospectos con IA", de: "Interessenten mit KI entdecken" },
  vp_generate_personalized: { en: "Generate personalized outreach", it: "Genera messaggi personalizzati", fr: "Générez des messages personnalisés", es: "Genera mensajes personalizados", de: "Personalisierte Ansprache generieren" },
  vp_practice_ai: { en: "Practice with AI coach", it: "Pratica con il coach IA", fr: "Pratiquez avec le coach IA", es: "Practica con el coach IA", de: "Übe mit dem KI-Coach" },
  vp_open: { en: "Open", it: "Apri", fr: "Ouvrir", es: "Abrir", de: "Öffnen", pt: "Abrir", ar: "فتح", zh: "打开", ru: "Открыть", ja: "開く", hi: "खोलें" },
  vp_ai_discovery: { en: "AI-powered prospect discovery", it: "Scoperta lead basata su IA", fr: "Découverte de prospects par IA", es: "Descubrimiento de prospectos por IA", de: "KI-gestützte Interessentensuche" },
  vp_searches_left: { en: "searches left today", it: "ricerche rimaste oggi", fr: "recherches restantes aujourd'hui", es: "búsquedas restantes hoy", de: "Suchen heute übrig" },
  vp_finding_leads: { en: "Finding leads...", it: "Ricerca lead...", fr: "Recherche de leads...", es: "Buscando leads...", de: "Suche Leads..." },
  vp_no_leads: { en: "No leads yet", it: "Nessun lead", fr: "Pas encore de leads", es: "Aún no hay leads", de: "Noch keine Leads" },
  vp_set_filters: { en: "Set your filters and search to discover prospects.", it: "Imposta i filtri e cerca per scoprire lead.", fr: "Définissez vos filtres et recherchez des prospects.", es: "Configura tus filtros y busca prospectos.", de: "Filter setzen und Interessenten entdecken." },
  vp_kanban_pipeline: { en: "Kanban Pipeline", it: "Pipeline Kanban", fr: "Pipeline Kanban", es: "Pipeline Kanban", de: "Kanban-Pipeline" },
  vp_drag_leads: { en: "Drag leads through stages", it: "Trascina i lead attraverso le fasi", fr: "Faites glisser les leads à travers les étapes", es: "Arrastra los leads por las etapas", de: "Leads durch Phasen ziehen" },
  vp_stage_new: { en: "New Lead", it: "Nuovo Lead", fr: "Nouveau Lead", es: "Nuevo Lead", de: "Neuer Lead" },
  vp_stage_contacted: { en: "Contacted", it: "Contattato", fr: "Contacté", es: "Contactado", de: "Kontaktiert" },
  vp_stage_interested: { en: "Interested", it: "Interessato", fr: "Intéressé", es: "Interesado", de: "Interessiert" },
  vp_stage_interviewing: { en: "Interviewing", it: "Colloquio", fr: "Entretien", es: "Entrevista", de: "Interview" },
  vp_stage_closed: { en: "Closed", it: "Chiuso", fr: "Fermé", es: "Cerrado", de: "Abgeschlossen" },
  vp_drag_here: { en: "Drag leads here", it: "Trascina qui i lead", fr: "Glissez les leads ici", es: "Arrastra leads aquí", de: "Leads hierher ziehen" },
  vp_ai_msg_gen: { en: "AI Message Generator", it: "Generatore Messaggi IA", fr: "Générateur de Messages IA", es: "Generador de Mensajes IA", de: "KI-Nachrichtengenerator" },
  vp_personalized_outreach: { en: "Personalized outreach in seconds", it: "Outreach personalizzato in pochi secondi", fr: "Prospection personnalisée en quelques secondes", es: "Outreach personalizado en segundos", de: "Personalisierte Ansprache in Sekunden" },
  vp_msg_type: { en: "Message Type", it: "Tipo Messaggio", fr: "Type de message", es: "Tipo de mensaje", de: "Nachrichtentyp" },
  vp_job_app: { en: "Job Application", it: "Candidatura", fr: "Candidature", es: "Candidatura", de: "Bewerbung" },
  vp_freelance_pitch: { en: "Freelance Pitch", it: "Proposta Freelance", fr: "Pitch Freelance", es: "Propuesta Freelance", de: "Freelance-Pitch" },
  vp_networking: { en: "Networking", it: "Networking", fr: "Réseautage", es: "Networking", de: "Networking" },
  vp_recipient: { en: "Recipient", it: "Destinatario", fr: "Destinataire", es: "Destinatario", de: "Empfänger" },
  vp_personalization_active: { en: "Personalization active", it: "Personalizzazione attiva", fr: "Personnalisation active", es: "Personalización activa", de: "Personalisierung aktiv" },
  vp_using_resume: { en: "Using your resume data to tailor the message.", it: "Utilizzo i dati del tuo CV per personalizzare il messaggio.", fr: "Utilisation de votre CV pour personnaliser le message.", es: "Usando tus datos de CV para personalizar el mensaje.", de: "Lebenslaufdaten für die Anpassung verwenden." },
  vp_your_message: { en: "Your message", it: "Il tuo messaggio", fr: "Votre message", es: "Tu mensaje", de: "Deine Nachricht" },
  vp_regenerate: { en: "Regenerate", it: "Rigenera", fr: "Régénérer", es: "Regenerar", de: "Neu generieren", pt: "Regenerar", ar: "إعادة إنشاء", zh: "重新生成", ru: "Перегенерировать", ja: "再生成", hi: "पुनः उत्पन्न करें" },
  vp_generate: { en: "Generate", it: "Genera", fr: "Générer", es: "Generar", de: "Generieren", pt: "Gerar", ar: "إنشاء", zh: "生成", ru: "Создать", ja: "生成", hi: "जेनरेट" },
  vp_click_generate: { en: "Click Generate to create a personalized message...", it: "Clicca Genera per creare un messaggio personalizzato...", fr: "Cliquez sur Générer pour créer un message personnalisé...", es: "Haz clic en Generar para crear un mensaje personalizado...", de: "Klicken Sie auf Generieren, um eine Nachricht zu erstellen..." },
  vp_copied: { en: "Copied!", it: "Copiato!", fr: "Copié !", es: "¡Copiado!", de: "Kopiert!" },
  vp_edit: { en: "Edit", it: "Modifica", fr: "Modifier", es: "Editar", de: "Bearbeiten" },
  vp_save_campaign: { en: "Save to Campaign", it: "Salva in Campagna", fr: "Enregistrer dans la campagne", es: "Guardar en campaña", de: "In Kampagne speichern" },
  vp_saved_campaign: { en: "Saved to Campaigns!", it: "Salvato nelle Campagne!", fr: "Enregistré dans les campagnes !", es: "¡Guardado en campañas!", de: "In Kampagnen gespeichert!" },
  vp_resume_intel_desc: { en: "Let AI analyze your CV and match you with leads", it: "Lascia che l'IA analizzi il tuo CV e ti abbini ai lead", fr: "Laissez l'IA analyser votre CV et vous faire correspondre aux leads", es: "Deja que la IA analice tu CV y te conecte con leads", de: "KI analysiert Ihren Lebenslauf und findet passende Leads" },
  vp_upload_resume: { en: "Upload your resume", it: "Carica il tuo CV", fr: "Téléchargez votre CV", es: "Sube tu CV", de: "Lebenslauf hochladen" },
  vp_upload_desc: { en: "PDF, DOCX, or TXT. Our AI extracts skills, experience, and identifies improvement areas.", it: "PDF, DOCX o TXT. La nostra IA estrae competenze, esperienze e aree di miglioramento.", fr: "PDF, DOCX ou TXT. Notre IA extrait compétences, expérience et zones d'amélioration.", es: "PDF, DOCX o TXT. Nuestra IA extrae habilidades, experiencia e identifica áreas de mejora.", de: "PDF, DOCX oder TXT. Unsere KI extrahiert Fähigkeiten, Erfahrung und Verbesserungsbereiche." },
  vp_analyze_resume: { en: "Analyze My Resume", it: "Analizza CV", fr: "Analyser mon CV", es: "Analizar mi CV", de: "Mein Lebenslauf analysieren" },
  vp_analyzing_file: { en: "Analyzing", it: "Analisi in corso", fr: "Analyse en cours", es: "Analizando", de: "Analysiere" },
  vp_extracting_skills: { en: "Extracting skills and matching you with opportunities...", it: "Estraggo competenze e cerco opportunità...", fr: "Extraction des compétences et recherche d'opportunités...", es: "Extrayendo habilidades y buscando oportunidades...", de: "Fähigkeiten extrahieren und Chancen finden..." },
  vp_profile_summary: { en: "Profile Summary", it: "Riepilogo Profilo", fr: "Résumé du profil", es: "Resumen del perfil", de: "Profilzusammenfassung" },
  vp_match_score: { en: "Match score", it: "Punteggio match", fr: "Score de match", es: "Puntuación de match", de: "Match-Score" },
  vp_core_skills: { en: "Core Skills", it: "Competenze Core", fr: "Compétences clés", es: "Habilidades clave", de: "Kernkompetenzen" },
  vp_experience_years: { en: "Experience", it: "Esperienza", fr: "Expérience", es: "Experiencia", de: "Erfahrung" },
  vp_strengths: { en: "Strengths", it: "Punti di forza", fr: "Forces", es: "Fortalezas", de: "Stärken" },
  vp_gaps: { en: "Gaps", it: "Lacune", fr: "Lacunes", es: "Brechas", de: "Lücken" },
  vp_ai_match_assist: { en: "AI Match Assist", it: "Assistente Match IA", fr: "Assistant de match IA", es: "Asistente de match IA", de: "KI-Match-Assistent" },
  vp_paste_job_desc: { en: "Paste a job description to generate a tailored cover letter and see your ATS score.", it: "Incolla una descrizione del lavoro per generare una lettera mirata e vedere il punteggio ATS.", fr: "Collez une offre pour générer une lettre personnalisée et voir le score ATS.", es: "Pega una descripción de trabajo para generar una carta a medida y ver el score ATS.", de: "Stellenbeschreibung einfügen für Anschreiben und ATS-Score." },
  vp_gen_tailored: { en: "Generate Tailored Assets", it: "Genera Asset Mirati", fr: "Générer des assets personnalisés", es: "Generar activos a medida", de: "Maßgeschneiderte Assets generieren" },
  vp_campaign_desc: { en: "Multi-step outreach sequences", it: "Sequenze di outreach multi-step", fr: "Séquences de prospection multi-étapes", es: "Secuencias de outreach multi-etapas", de: "Mehrstufige Ansprachesequenzen" },
  vp_new_campaign: { en: "New Campaign", it: "Nuova Campagna", fr: "Nouvelle campagne", es: "Nueva campaña", de: "Neue Kampagne" },
  vp_active: { en: "active", it: "attiva", fr: "active", es: "activa", de: "aktiv" },
  vp_paused: { en: "paused", it: "in pausa", fr: "en pause", es: "en pausa", de: "pausiert" },
  vp_steps: { en: "steps", it: "fasi", fr: "étapes", es: "pasos", de: "Schritte" },
  vp_sent: { en: "sent", it: "inviati", fr: "envoyés", es: "enviados", de: "gesendet" },
  vp_replies: { en: "Replies", it: "Risposte", fr: "Réponses", es: "Respuestas", de: "Antworten" },
  vp_view_pipeline: { en: "View Pipeline", it: "Vedi Pipeline", fr: "Voir la pipeline", es: "Ver pipeline", de: "Pipeline anzeigen" },
  vp_new_seq: { en: "New Campaign Sequence", it: "Nuova Sequenza Campagna", fr: "Nouvelle séquence de campagne", es: "Nueva secuencia de campaña", de: "Neue Kampagnensequenz" },
  vp_campaign_name: { en: "Campaign name", it: "Nome campagna", fr: "Nom de la campagne", es: "Nombre de la campaña", de: "Kampagnenname" },
  vp_outreach_steps: { en: "Outreach Steps", it: "Passaggi Outreach", fr: "Étapes de prospection", es: "Pasos de outreach", de: "Anspracheschritte" },
  vp_add_step: { en: "Add Follow-up Step", it: "Aggiungi Follow-up", fr: "Ajouter une étape", es: "Añadir paso", de: "Follow-up hinzufügen" },
  vp_launch_seq: { en: "Launch Sequence", it: "Lancia Sequenza", fr: "Lancer la séquence", es: "Lanzar secuencia", de: "Sequenz starten" },
  vp_smart_stop: { en: "Smart Stop: This sequence will automatically pause for a lead as soon as they reply, ensuring a natural transition to human chat.", it: "Smart Stop: Questa sequenza si fermerà non appena il lead risponde.", fr: "Smart Stop : Cette séquence s'arrêtera dès que le lead répond.", es: "Smart Stop: Esta secuencia se detendrá en cuanto el lead responda.", de: "Smart Stop: Diese Sequenz stoppt automatisch, sobald der Interessent antwortet." },
  vp_unified_inbox: { en: "Unified Inbox", it: "Posta Unificata", fr: "Boîte unifiée", es: "Bandeja unificada", de: "Posteingang" },
  vp_sync_desc: { en: "Gmail + Outlook synced", it: "Gmail + Outlook sincronizzati", fr: "Gmail + Outlook synchronisés", es: "Gmail + Outlook sincronizados", de: "Gmail + Outlook synchronisiert" },
  vp_gmail_sync: { en: "Gmail synced", it: "Gmail sincronizzato", fr: "Gmail synchronisé", es: "Gmail sincronizado", de: "Gmail synchronisiert" },
  vp_outlook_sync: { en: "Outlook synced", it: "Outlook sincronizzato", fr: "Outlook synchronisé", es: "Outlook sincronizado", de: "Outlook synchronisiert" },
  vp_view_lead: { en: "View Lead Details", it: "Vedi Lead", fr: "Voir lead", es: "Ver lead", de: "Lead-Details anzeigen" },
  vp_suggested_reply: { en: "AI Suggested Reply", it: "Risposta Suggerita IA", fr: "Réponse suggérée par IA", es: "Respuesta sugerida por IA", de: "KI-Antwortvorschlag" },
  vp_send_reply: { en: "Send This Reply", it: "Invia Risposta", fr: "Envoyer cette réponse", es: "Enviar esta respuesta", de: "Antwort senden" },
  vp_practice_tailored: { en: "Practice interviews tailored to your role", it: "Pratica colloqui mirati al tuo ruolo", fr: "Pratiquez des entretiens adaptés à votre rôle", es: "Practica entrevistas a medida", de: "Rollenspezifische Interviews üben" },
  vp_ready_practice: { en: "Ready to practice?", it: "Pronto per la pratica?", fr: "Prêt pour la pratique ?", es: "¿Listo para practicar?", de: "Bereit zu üben?" },
  vp_enter_simulator: { en: "Enter Simulator", it: "Entra nel Simulatore", fr: "Entrer dans le simulateur", es: "Entrar al simulador", de: "Simulator starten" },
  vp_interview_progress: { en: "Interview in progress", it: "Colloquio in corso", fr: "Entretien en cours", es: "Entrevista en progreso", de: "Interview läuft" },
  vp_live_recording: { en: "Live Recording", it: "Registrazione Live", fr: "Enregistrement en direct", es: "Grabación en vivo", de: "Live-Aufnahme" },
  vp_complete_session: { en: "Complete Session", it: "Completa Sessione", fr: "Terminer la session", es: "Completar sesión", de: "Sitzung beenden" },
  vp_next_question: { en: "Next Question", it: "Prossima Domanda", fr: "Question suivante", es: "Siguiente pregunta", de: "Nächste Frage" },
  vp_scorecard: { en: "Interview Scorecard", it: "Scheda Valutazione", fr: "Fiche d'évaluation", es: "Ficha de evaluación", de: "Interview-Scorecard" },
  vp_detailed_analysis: { en: "Detailed AI analysis and improvement path", it: "Analisi dettagliata IA e percorso di miglioramento", fr: "Analyse détaillée IA", es: "Análisis detallado IA", de: "Detaillierte KI-Analyse" },
  vp_performance_analytics: { en: "Performance Analytics", it: "Analisi Performance", fr: "Analytique", es: "Analítica", de: "Performance-Analytik" },
  vp_deep_insights: { en: "Deep insights into your outreach funnel", it: "Approfondimenti sul funnel di outreach", fr: "Aperçus profonds du tunnel", es: "Insights profundos del funnel", de: "Tiefe Einblicke in den Akquise-Funnel" },
  vp_export: { en: "Export", it: "Esporta", fr: "Exporter", es: "Exportar", de: "Exportieren" },
  vp_volume: { en: "Outreach Volume", it: "Volume Outreach", fr: "Volume de prospection", es: "Volumen de outreach", de: "Ansprachevolumen" },
  vp_efficiency: { en: "Funnel Efficiency", it: "Efficienza Funnel", fr: "Efficacité du tunnel", es: "Eficiencia del funnel", de: "Funnel-Effizienz" },
  vp_years: { en: "years", it: "anni", fr: "ans", es: "años", de: "Jahre" },
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