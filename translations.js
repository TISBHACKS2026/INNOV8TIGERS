// UrbisX Multi-Language Translations
// Supported: English (en), Hindi (hi), French (fr)

const translations = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How it Works",
      requestCity: "Request a City",
      login: "Sign in",
      signup: "Sign up",
      logout: "Sign out",
      profile: "Profile",
      adminDashboard: "Admin Dashboard",
      launchMap: "Launch Map",
      launchApp: "Launch App"
    },
    hero: {
      eyebrow: "Pioneering Urban Intelligence",
      title: "Revealing the Unseen",
      titleSuffix: "in Our Cities",
      subtitle: "Harnessing AI to illuminate informal settlements and empower data-driven urban development.",
      badge1: "AI-powered settlement detection",
      badge2: "Fast, city-scale analysis",
      badge3: "Export-ready GIS outputs",
      ctaPrimary: "Launch Interactive Map",
      ctaSecondary: "Request a City"
    },
    marquee: {
      item1: "Mapping the Unmapped",
      item2: "Equitable Urban Development",
      item3: "AI + Satellite Imagery",
      item4: "Interactive Insights",
      item5: "Export to GIS"
    },
    why: {
      eyebrow: "Why It Matters",
      title: "Making the Invisible Visible",
      subtitle: "Informal settlements are often missing from official data. Our technology brings them to light, enabling better decisions and more equitable outcomes.",
      card1Title: "Visibility",
      card1Text: "Reveal settlements that traditional mapping misses, creating a more complete picture of urban landscapes and enabling data-driven decisions for inclusive urban planning.",
      card2Title: "Speed",
      card2Text: "Process vast urban areas in minutes, not months, with our efficient AI-powered analysis that enables quick identification and response to urban development needs.",
      card3Title: "Impact",
      card3Text: "Empower organizations to make data-informed decisions that transform communities and support evidence-based interventions worldwide."
    },
    features: {
      title: "Core Features"
    },
    faq: {
      title: "FAQ",
      subtitle: "Answers to common questions about data, accuracy, exports, and privacy.",
      q1: "How accurate is the detection?",
      a1: "Performance varies by city and imagery. Typical precision near threshold 0.35 is around 0.85 with recall around 0.72. You can adjust the threshold in the app.",
      q2: "What data sources do you use?",
      a2: "We use publicly available basemaps and preprocessed satellite predictions. The app overlays a stable white mask on top of OpenStreetMap tiles for clarity.",
      q3: "Can I export results?",
      a3: "Yes. Use \"Export to TIFF\" to download the overlay for GIS or analysis workflows.",
      q4: "Will my map interactions be sent to a server?",
      a4: "No. The app runs fully in your browser. Overlay rendering and exports happen locally."
    },
    how: {
      title: "How It Works",
      subtitle: "A simple, powerful, three-step process from raw imagery to actionable insight.",
      step1Title: "1. Satellite Imagery",
      step1Text: "We ingest and preprocess high-resolution imagery to ensure clarity and consistency across scenes.",
      step2Title: "2. AI Analysis",
      step2Text: "Our deep learning models detect informal settlement patterns with high accuracy.",
      step3Title: "3. Actionable Insights",
      step3Text: "Results are visualized on an interactive map with detailed analytics and export options."
    },
    showcase: {
      eyebrow: "See It In Action",
      title: "Interactive Mapping Platform",
      subtitle: "Explore settlement data with precision. Toggle layers, analyze patterns, export insights.",
      feature1Title: "Geospatial Analysis",
      feature1Text: "Visualize settlement boundaries with precision accuracy",
      feature2Title: "Layer Control",
      feature2Text: "Toggle between heatmaps, boundaries, and POI data",
      feature3Title: "Export Ready",
      feature3Text: "Download GIS-compatible data in multiple formats"
    },
    cta: {
      title: "Start Analyzing Urban Settlements",
      subtitle: "Access powerful tools for detecting and analyzing informal settlements with precision and ease.",
      launchApp: "Launch App",
      exploreFeatures: "Explore Features"
    },
    auth: {
      loginTitle: "Welcome Back",
      loginSubtitle: "Sign in to access your account",
      signupTitle: "Create your account",
      signupSubtitle: "Join UrbisX to access powerful urban analytics tools",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm Password",
      firstName: "First name",
      lastName: "Last name",
      loginButton: "Sign in",
      signupButton: "Create account",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      signupLink: "Sign up here",
      loginLink: "Sign in here",
      rememberMe: "Remember me",
      language: "Preferred Language",
      languageHelp: "Select your preferred language for the interface"
    },
    map: {
      title: "Interactive Map",
      selectCity: "City",
      loading: "Loading...",
      controlPanel: "Control panel",
      modelThreshold: "Model Threshold",
      threshold: "Threshold:",
      precision: "Precision:",
      recall: "Recall:",
      f1Score: "F1-Score:",
      cityLayers: "City Layers",
      publicToilets: "Optimal Public Toilets (points)",
      landfills: "Landfills (areas)",
      schools: "Welfare Canteens & Shops (points)",
      slumDetails: "Settlement Details",
      confidence: "Confidence",
      population: "Est. Population",
      area: "Area",
      close: "Close"
    },
    admin: {
      title: "Admin Dashboard",
      overview: "Overview",
      requests: "City Requests",
      totalRequests: "Total Requests",
      pendingRequests: "Pending",
      approvedRequests: "Approved",
      completedRequests: "Completed",
      search: "Search requests...",
      status: "Status",
      priority: "Priority",
      actions: "Actions",
      approve: "Approve",
      reject: "Reject",
      view: "View Details"
    },
    requestCity: {
      title: "Request a New City",
      subtitle: "Help us expand our coverage by requesting a city to be added.",
      cityName: "City Name",
      state: "State/Province",
      country: "Country",
      reason: "Reason for Request",
      submitButton: "Submit Request",
      successMessage: "Request submitted successfully!"
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      submit: "Submit",
      back: "Back"
    },
    footer: {
      copyright: "© 2025 UrbisX. Built for equitable urban development.",
      ctaText: "Want your city covered?"
    },
    language: {
      select: "Language",
      en: "English",
      hi: "हिन्दी",
      fr: "Français"
    }
  },

  hi: {
    nav: {
      features: "विशेषताएं",
      howItWorks: "यह कैसे काम करता है",
      requestCity: "शहर का अनुरोध करें",
      login: "साइन इन करें",
      signup: "साइन अप करें",
      logout: "साइन आउट करें",
      profile: "प्रोफ़ाइल",
      adminDashboard: "एडमिन डैशबोर्ड",
      launchMap: "मानचित्र देखें",
      launchApp: "ऐप लॉन्च करें"
    },
    hero: {
      eyebrow: "अग्रणी शहरी बुद्धिमत्ता",
      title: "अदृश्य को प्रकट करना",
      titleSuffix: "हमारे शहरों में",
      subtitle: "अनौपचारिक बस्तियों को उजागर करने और डेटा-संचालित शहरी विकास को सशक्त बनाने के लिए एआई का उपयोग।",
      badge1: "एआई-संचालित बस्ती पहचान",
      badge2: "तेज़, शहर-स्तरीय विश्लेषण",
      badge3: "GIS निर्यात के लिए तैयार आउटपुट",
      ctaPrimary: "इंटरैक्टिव मानचित्र देखें",
      ctaSecondary: "शहर का अनुरोध करें"
    },
    marquee: {
      item1: "अनमैप्ड का मानचित्रण",
      item2: "न्यायसंगत शहरी विकास",
      item3: "एआई + उपग्रह इमेजरी",
      item4: "इंटरैक्टिव इनसाइट्स",
      item5: "GIS में निर्यात"
    },
    why: {
      eyebrow: "यह क्यों मायने रखता है",
      title: "अदृश्य को दृश्यमान बनाना",
      subtitle: "अनौपचारिक बस्तियां अक्सर आधिकारिक डेटा से गायब रहती हैं। हमारी तकनीक उन्हें प्रकाश में लाती है, बेहतर निर्णय और अधिक न्यायसंगत परिणाम सक्षम करती है।",
      card1Title: "दृश्यता",
      card1Text: "उन बस्तियों को प्रकट करें जो पारंपरिक मानचित्रण से छूट जाती हैं, शहरी परिदृश्य की अधिक पूर्ण तस्वीर बनाएं।",
      card2Title: "गति",
      card2Text: "हमारे कुशल एआई-संचालित विश्लेषण के साथ विशाल शहरी क्षेत्रों को महीनों में नहीं, मिनटों में संसाधित करें।",
      card3Title: "प्रभाव",
      card3Text: "संगठनों को डेटा-सूचित निर्णय लेने के लिए सशक्त बनाएं जो समुदायों को बदलते हैं।"
    },
    how: {
      title: "यह कैसे काम करता है",
      subtitle: "कच्ची इमेजरी से कार्रवाई योग्य अंतर्दृष्टि तक एक सरल, शक्तिशाली, तीन-चरणीय प्रक्रिया।",
      step1Title: "1. उपग्रह इमेजरी",
      step1Text: "हम स्पष्टता और स्थिरता सुनिश्चित करने के लिए उच्च-रिज़ॉल्यूशन इमेजरी को प्रोसेस करते हैं।",
      step2Title: "2. एआई विश्लेषण",
      step2Text: "हमारे डीप लर्निंग मॉडल उच्च सटीकता के साथ अनौपचारिक बस्ती पैटर्न का पता लगाते हैं।",
      step3Title: "3. कार्रवाई योग्य अंतर्दृष्टि",
      step3Text: "परिणाम विस्तृत विश्लेषण और निर्यात विकल्पों के साथ एक इंटरैक्टिव मानचित्र पर दिखाए जाते हैं।"
    },
    showcase: {
      eyebrow: "इसे क्रियान्वित देखें",
      title: "इंटरैक्टिव मैपिंग प्लेटफ़ॉर्म",
      subtitle: "सटीकता के साथ बस्ती डेटा का अन्वेषण करें। परतों को टॉगल करें, पैटर्न का विश्लेषण करें, अंतर्दृष्टि निर्यात करें।",
      feature1Title: "जियोस्पेशियल विश्लेषण",
      feature1Text: "सटीक सटीकता के साथ बस्ती सीमाओं को देखें",
      feature2Title: "लेयर नियंत्रण",
      feature2Text: "हीटमैप, सीमाओं और POI डेटा के बीच टॉगल करें",
      feature3Title: "निर्यात के लिए तैयार",
      feature3Text: "कई प्रारूपों में GIS-संगत डेटा डाउनलोड करें"
    },
    cta: {
      title: "शहरी बस्तियों का विश्लेषण शुरू करें",
      subtitle: "सटीकता और आसानी के साथ अनौपचारिक बस्तियों का पता लगाने और विश्लेषण करने के लिए शक्तिशाली उपकरणों तक पहुंच प्राप्त करें।",
      launchApp: "ऐप लॉन्च करें",
      exploreFeatures: "विशेषताएं देखें"
    },
    features: {
      title: "मुख्य विशेषताएं"
    },
    faq: {
      title: "अक्सर पूछे जाने वाले प्रश्न",
      subtitle: "डेटा, सटीकता, निर्यात और गोपनीयता के बारे में सामान्य प्रश्नों के उत्तर।",
      q1: "पहचान कितनी सटीक है?",
      a1: "प्रदर्शन शहर और इमेजरी के अनुसार भिन्न होता है। थ्रेशोल्ड 0.35 के पास विशिष्ट सटीकता लगभग 0.85 है और रिकॉल लगभग 0.72 है। आप ऐप में थ्रेशोल्ड समायोजित कर सकते हैं।",
      q2: "आप कौन से डेटा स्रोत का उपयोग करते हैं?",
      a2: "हम सार्वजनिक रूप से उपलब्ध बेसमैप और पूर्व-संसाधित उपग्रह भविष्यवाणियों का उपयोग करते हैं। ऐप स्पष्टता के लिए OpenStreetMap टाइलों के ऊपर एक स्थिर सफेद मास्क ओवरले करता है।",
      q3: "क्या मैं परिणाम निर्यात कर सकता हूं?",
      a3: "हां। GIS या विश्लेषण वर्कफ़्लो के लिए ओवरले डाउनलोड करने के लिए \"TIFF में निर्यात करें\" का उपयोग करें।",
      q4: "क्या मेरे मानचित्र इंटरैक्शन सर्वर पर भेजे जाएंगे?",
      a4: "नहीं। ऐप पूरी तरह से आपके ब्राउज़र में चलता है। ओवरले रेंडरिंग और निर्यात स्थानीय रूप से होते हैं।"
    },
    auth: {
      loginTitle: "वापसी पर स्वागत है",
      loginSubtitle: "अपने खाते तक पहुंचने के लिए साइन इन करें",
      signupTitle: "अपना खाता बनाएं",
      signupSubtitle: "शक्तिशाली शहरी विश्लेषण उपकरणों तक पहुंचने के लिए UrbisX में शामिल हों",
      email: "ईमेल पता",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      firstName: "पहला नाम",
      lastName: "अंतिम नाम",
      loginButton: "साइन इन करें",
      signupButton: "खाता बनाएं",
      forgotPassword: "पासवर्ड भूल गए?",
      noAccount: "खाता नहीं है?",
      hasAccount: "पहले से खाता है?",
      signupLink: "यहां साइन अप करें",
      loginLink: "यहां साइन इन करें",
      rememberMe: "मुझे याद रखें",
      language: "पसंदीदा भाषा",
      languageHelp: "इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें"
    },
    map: {
      title: "इंटरैक्टिव मानचित्र",
      selectCity: "शहर",
      loading: "लोड हो रहा है...",
      controlPanel: "नियंत्रण पैनल",
      modelThreshold: "मॉडल थ्रेशोल्ड",
      threshold: "थ्रेशोल्ड:",
      precision: "सटीकता:",
      recall: "रिकॉल:",
      f1Score: "F1-स्कोर:",
      cityLayers: "शहर की परतें",
      publicToilets: "उत्तम सार्वजनिक शौचालय (बिंदु)",
      landfills: "लैंडफिल (क्षेत्र)",
      schools: "कल्याण कैंटीन और दुकानें (बिंदु)",
      slumDetails: "बस्ती विवरण",
      confidence: "विश्वास",
      population: "अनुमानित जनसंख्या",
      area: "क्षेत्र",
      close: "बंद करें"
    },
    admin: {
      title: "एडमिन डैशबोर्ड",
      overview: "अवलोकन",
      requests: "शहर अनुरोध",
      totalRequests: "कुल अनुरोध",
      pendingRequests: "लंबित",
      approvedRequests: "स्वीकृत",
      completedRequests: "पूर्ण",
      search: "अनुरोध खोजें...",
      status: "स्थिति",
      priority: "प्राथमिकता",
      actions: "कार्रवाई",
      approve: "स्वीकृत करें",
      reject: "अस्वीकार करें",
      view: "विवरण देखें"
    },
    requestCity: {
      title: "नया शहर अनुरोध करें",
      subtitle: "एक शहर जोड़ने का अनुरोध करके हमारे कवरेज का विस्तार करने में हमारी सहायता करें।",
      cityName: "शहर का नाम",
      state: "राज्य/प्रांत",
      country: "देश",
      reason: "अनुरोध का कारण",
      submitButton: "अनुरोध सबमिट करें",
      successMessage: "अनुरोध सफलतापूर्वक सबमिट किया गया!"
    },
    common: {
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      success: "सफलता",
      cancel: "रद्द करें",
      save: "सहेजें",
      close: "बंद करें",
      submit: "सबमिट करें",
      back: "वापस"
    },
    footer: {
      copyright: " 2025 UrbisX। समान शहरी विकास के लिए निर्मित।",
      ctaText: "क्या आप चाहते हैं कि आपका शहर कवर हो?"
    },
    language: {
      select: "भाषा",
      en: "English",
      hi: "हिन्दी",
      fr: "Français"
    }
  },

  fr: {
    nav: {
      features: "Fonctionnalités",
      howItWorks: "Comment ça marche",
      requestCity: "Demander une ville",
      login: "Se connecter",
      signup: "S'inscrire",
      logout: "Se déconnecter",
      profile: "Profil",
      adminDashboard: "Tableau de bord admin",
      launchMap: "Voir la carte",
      launchApp: "Lancer l'app"
    },
    hero: {
      eyebrow: "Intelligence urbaine pionnière",
      title: "Révéler l'invisible",
      titleSuffix: "dans nos villes",
      subtitle: "Utiliser l'IA pour éclairer les établissements informels et permettre un développement urbain basé sur les données.",
      badge1: "Détection d'établissements par IA",
      badge2: "Analyse rapide à l'échelle d'une ville",
      badge3: "Exports GIS prêts à l'emploi",
      ctaPrimary: "Lancer la carte interactive",
      ctaSecondary: "Demander une ville"
    },
    marquee: {
      item1: "Cartographier l'invisible",
      item2: "Développement urbain équitable",
      item3: "IA + imagerie satellite",
      item4: "Insights interactifs",
      item5: "Exporter vers GIS"
    },
    why: {
      eyebrow: "Pourquoi c'est important",
      title: "Rendre l'invisible visible",
      subtitle: "Les établissements informels sont souvent absents des données officielles. Notre technologie les met en lumière, permettant de meilleures décisions et des résultats plus équitables.",
      card1Title: "Visibilité",
      card1Text: "Révélez les établissements que la cartographie traditionnelle manque, créant une image plus complète des paysages urbains.",
      card2Title: "Rapidité",
      card2Text: "Traitez de vastes zones urbaines en minutes, pas en mois, avec notre analyse alimentée par l'IA.",
      card3Title: "Impact",
      card3Text: "Permettez aux organisations de prendre des décisions basées sur les données qui transforment les communautés."
    },
    how: {
      title: "Comment ça marche",
      subtitle: "Un processus simple et puissant en trois étapes, de l'imagerie brute aux insights actionnables.",
      step1Title: "1. Imagerie satellite",
      step1Text: "Nous ingérons et prétraitons des images haute résolution pour assurer clarté et cohérence.",
      step2Title: "2. Analyse IA",
      step2Text: "Nos modèles d'apprentissage profond détectent les modèles d'établissements informels avec une grande précision.",
      step3Title: "3. Insights actionnables",
      step3Text: "Les résultats sont visualisés sur une carte interactive avec des analyses détaillées et des options d'exportation."
    },
    showcase: {
      eyebrow: "Voir en action",
      title: "Plateforme de cartographie interactive",
      subtitle: "Explorez les données de peuplement avec précision. Basculez entre les couches, analysez les motifs, exportez les insights.",
      feature1Title: "Analyse géospatiale",
      feature1Text: "Visualisez les limites des établissements avec une précision exacte",
      feature2Title: "Contrôle des couches",
      feature2Text: "Basculez entre les heatmaps, les limites et les données POI",
      feature3Title: "Prêt à exporter",
      feature3Text: "Téléchargez des données compatibles GIS dans plusieurs formats"
    },
    cta: {
      title: "Commencez à analyser les établissements urbains",
      subtitle: "Accédez à des outils puissants pour détecter et analyser les établissements informels avec précision et facilité.",
      launchApp: "Lancer l'application",
      exploreFeatures: "Explorer les fonctionnalités"
    },
    features: {
      title: "Fonctionnalités principales"
    },
    faq: {
      title: "FAQ",
      subtitle: "Réponses aux questions courantes sur les données, la précision, les exportations et la confidentialité.",
      q1: "Quelle est la précision de la détection?",
      a1: "Les performances varient selon la ville et l'imagerie. La précision typique près du seuil 0.35 est d'environ 0.85 avec un rappel d'environ 0.72. Vous pouvez ajuster le seuil dans l'application.",
      q2: "Quelles sources de données utilisez-vous?",
      a2: "Nous utilisons des cartes de base publiquement disponibles et des prédictions satellite prétraitées. L'application superpose un masque blanc stable sur les tuiles OpenStreetMap pour plus de clarté.",
      q3: "Puis-je exporter les résultats?",
      a3: "Oui. Utilisez \"Exporter vers TIFF\" pour télécharger la superposition pour les flux de travail GIS ou d'analyse.",
      q4: "Mes interactions avec la carte seront-elles envoyées à un serveur?",
      a4: "Non. L'application fonctionne entièrement dans votre navigateur. Le rendu de superposition et les exportations se font localement."
    },
    auth: {
      loginTitle: "Bon retour",
      loginSubtitle: "Connectez-vous pour accéder à votre compte",
      signupTitle: "Créez votre compte",
      signupSubtitle: "Rejoignez UrbisX pour accéder à de puissants outils d'analyse urbaine",
      email: "Adresse e-mail",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      firstName: "Prénom",
      lastName: "Nom de famille",
      loginButton: "Se connecter",
      signupButton: "Créer un compte",
      forgotPassword: "Mot de passe oublié?",
      noAccount: "Vous n'avez pas de compte?",
      hasAccount: "Vous avez déjà un compte?",
      signupLink: "Inscrivez-vous ici",
      loginLink: "Connectez-vous ici",
      rememberMe: "Se souvenir de moi",
      language: "Langue préférée",
      languageHelp: "Sélectionnez votre langue préférée pour l'interface"
    },
    map: {
      title: "Carte Interactive",
      selectCity: "Ville",
      loading: "Chargement...",
      controlPanel: "Panneau de contrôle",
      modelThreshold: "Seuil du modèle",
      threshold: "Seuil:",
      precision: "Précision:",
      recall: "Rappel:",
      f1Score: "Score F1:",
      cityLayers: "Couches de la ville",
      publicToilets: "Toilettes publiques optimales (points)",
      landfills: "Décharges (zones)",
      schools: "Cantines et magasins sociaux (points)",
      slumDetails: "Détails de l'établissement",
      confidence: "Confiance",
      population: "Population estimée",
      area: "Zone",
      close: "Fermer"
    },
    admin: {
      title: "Tableau de bord admin",
      overview: "Aperçu",
      requests: "Demandes de villes",
      totalRequests: "Total des demandes",
      pendingRequests: "En attente",
      approvedRequests: "Approuvé",
      completedRequests: "Terminé",
      search: "Rechercher des demandes...",
      status: "Statut",
      priority: "Priorité",
      actions: "Actions",
      approve: "Approuver",
      reject: "Rejeter",
      view: "Voir les détails"
    },
    requestCity: {
      title: "Demander une nouvelle ville",
      subtitle: "Aidez-nous à étendre notre couverture en demandant l'ajout d'une ville.",
      cityName: "Nom de la ville",
      state: "État/Province",
      country: "Pays",
      reason: "Raison de la demande",
      submitButton: "Soumettre la demande",
      successMessage: "Demande soumise avec succès!"
    },
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      cancel: "Annuler",
      save: "Enregistrer",
      close: "Fermer",
      submit: "Soumettre",
      back: "Retour"
    },
    footer: {
      copyright: "© 2025 UrbisX. Construit pour un développement urbain équitable.",
      ctaText: "Vous voulez que votre ville soit couverte?"
    },
    language: {
      select: "Langue",
      en: "English",
      hi: "हिन्दी",
      fr: "Français"
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.translations = translations;
}
