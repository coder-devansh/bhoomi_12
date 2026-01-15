/**
 * BhoomiSetu Multilingual AI Service
 * Supports multiple Indian languages for accessibility
 */

// Language configurations
export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English', code: 'en-IN' },
  hi: { name: 'Hindi', nativeName: 'हिंदी', code: 'hi-IN' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn-IN' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', code: 'te-IN' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', code: 'ta-IN' },
  mr: { name: 'Marathi', nativeName: 'मराठी', code: 'mr-IN' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu-IN' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', code: 'bn-IN' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa-IN' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml-IN' }
};

// Common UI translations
export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    mutualPartition: 'Mutual Partition',
    familyPartition: 'Family Partition',
    boundaryDemarcation: 'Boundary Demarcation',
    status: 'Status',
    settings: 'Settings',
    logout: 'Logout',
    
    // Forms
    fullName: 'Full Name',
    landNumber: 'Land Number',
    khataNumber: 'Khata Number',
    landArea: 'Land Area',
    aadhaarNumber: 'Aadhaar Number',
    mobileNumber: 'Mobile Number',
    address: 'Address',
    description: 'Description',
    submitRequest: 'Submit Request',
    aiAnalysis: 'AI Analysis',
    
    // Status
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    
    // AI Chatbot
    askAI: 'Ask AI Assistant',
    typeMessage: 'Type your message...',
    aiThinking: 'AI is thinking...',
    
    // Common
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View'
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    mutualPartition: 'आपसी विभाजन',
    familyPartition: 'पारिवारिक विभाजन',
    boundaryDemarcation: 'सीमा निर्धारण',
    status: 'स्थिति',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    
    // Forms
    fullName: 'पूरा नाम',
    landNumber: 'भूमि संख्या',
    khataNumber: 'खाता संख्या',
    landArea: 'भूमि क्षेत्र',
    aadhaarNumber: 'आधार नंबर',
    mobileNumber: 'मोबाइल नंबर',
    address: 'पता',
    description: 'विवरण',
    submitRequest: 'अनुरोध जमा करें',
    aiAnalysis: 'AI विश्लेषण',
    
    // Status
    pending: 'लंबित',
    inProgress: 'प्रगति में',
    resolved: 'हल किया गया',
    
    // AI Chatbot
    askAI: 'AI सहायक से पूछें',
    typeMessage: 'अपना संदेश लिखें...',
    aiThinking: 'AI सोच रहा है...',
    
    // Common
    welcome: 'स्वागत है',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफल',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    view: 'देखें'
  },
  kn: {
    // Navigation
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    mutualPartition: 'ಪರಸ್ಪರ ವಿಭಜನೆ',
    familyPartition: 'ಕುಟುಂಬ ವಿಭಜನೆ',
    boundaryDemarcation: 'ಗಡಿ ನಿರ್ಣಯ',
    status: 'ಸ್ಥಿತಿ',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    logout: 'ಲಾಗ್ಔಟ್',
    
    // Forms
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    landNumber: 'ಭೂಮಿ ಸಂಖ್ಯೆ',
    khataNumber: 'ಖಾತಾ ಸಂಖ್ಯೆ',
    landArea: 'ಭೂಮಿ ಪ್ರದೇಶ',
    aadhaarNumber: 'ಆಧಾರ್ ಸಂಖ್ಯೆ',
    mobileNumber: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    address: 'ವಿಳಾಸ',
    description: 'ವಿವರಣೆ',
    submitRequest: 'ವಿನಂತಿ ಸಲ್ಲಿಸಿ',
    aiAnalysis: 'AI ವಿಶ್ಲೇಷಣೆ',
    
    // Status
    pending: 'ಬಾಕಿ',
    inProgress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    resolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    
    // AI Chatbot
    askAI: 'AI ಸಹಾಯಕನನ್ನು ಕೇಳಿ',
    typeMessage: 'ನಿಮ್ಮ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...',
    aiThinking: 'AI ಯೋಚಿಸುತ್ತಿದೆ...',
    
    // Common
    welcome: 'ಸ್ವಾಗತ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    error: 'ದೋಷ',
    success: 'ಯಶಸ್ಸು',
    cancel: 'ರದ್ದುಮಾಡಿ',
    save: 'ಉಳಿಸಿ',
    delete: 'ಅಳಿಸಿ',
    edit: 'ಸಂಪಾದಿಸಿ',
    view: 'ನೋಡಿ'
  }
};

// AI Chatbot responses in multiple languages
export const aiResponses = {
  en: {
    greeting: "Hello! I'm your BhoomiSetu AI Assistant. How can I help you with land-related queries today?",
    partition_info: "Land partition involves dividing property among co-owners or heirs. Required documents include title deed, khata, and EC.",
    boundary_info: "Boundary demarcation is the official marking of land limits. A licensed surveyor will measure and place boundary markers.",
    documents_info: "Essential documents: Sale Deed, Khata Certificate, Encumbrance Certificate, Tax Receipts, Aadhaar Card.",
    status_info: "Your dispute status shows the current stage: Open (new), In Progress (being reviewed), or Resolved (completed)."
  },
  hi: {
    greeting: "नमस्ते! मैं आपका भूमिसेतु AI सहायक हूं। आज भूमि संबंधी प्रश्नों में मैं आपकी कैसे मदद कर सकता हूं?",
    partition_info: "भूमि विभाजन में सह-मालिकों या उत्तराधिकारियों के बीच संपत्ति का बंटवारा शामिल है। आवश्यक दस्तावेज: मूल दस्तावेज, खाता, और EC।",
    boundary_info: "सीमा निर्धारण भूमि की सीमाओं का आधिकारिक चिह्नीकरण है। एक लाइसेंस प्राप्त सर्वेयर माप लेगा और सीमा पत्थर लगाएगा।",
    documents_info: "आवश्यक दस्तावेज: बिक्री विलेख, खाता प्रमाण पत्र, भार प्रमाण पत्र, कर रसीदें, आधार कार्ड।",
    status_info: "आपके विवाद की स्थिति वर्तमान चरण दिखाती है: खुला (नया), प्रगति में (समीक्षा जारी), या हल (पूर्ण)।"
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಭೂಮಿಸೇತು AI ಸಹಾಯಕ. ಇಂದು ಭೂಮಿ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    partition_info: "ಭೂಮಿ ವಿಭಜನೆಯು ಸಹ-ಮಾಲೀಕರು ಅಥವಾ ಉತ್ತರಾಧಿಕಾರಿಗಳ ನಡುವೆ ಆಸ್ತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳುವುದನ್ನು ಒಳಗೊಂಡಿದೆ.",
    boundary_info: "ಗಡಿ ನಿರ್ಣಯವು ಭೂಮಿಯ ಮಿತಿಗಳ ಅಧಿಕೃತ ಗುರುತು. ಲೈಸೆನ್ಸ್ ಪಡೆದ ಸರ್ವೇಯರ್ ಅಳತೆ ಮಾಡಿ ಗಡಿ ಗುರುತುಗಳನ್ನು ಇಡುತ್ತಾರೆ.",
    documents_info: "ಅಗತ್ಯ ದಾಖಲೆಗಳು: ಮಾರಾಟ ಪತ್ರ, ಖಾತಾ ಪ್ರಮಾಣಪತ್ರ, EC, ತೆರಿಗೆ ರಸೀದಿಗಳು, ಆಧಾರ್.",
    status_info: "ನಿಮ್ಮ ವಿವಾದದ ಸ್ಥಿತಿ ಪ್ರಸ್ತುತ ಹಂತವನ್ನು ತೋರಿಸುತ್ತದೆ: ತೆರೆದ (ಹೊಸ), ಪ್ರಗತಿಯಲ್ಲಿ (ಪರಿಶೀಲನೆ), ಅಥವಾ ಪರಿಹರಿಸಲಾಗಿದೆ."
  }
};

// Get translation for a key
export const t = (key, lang = 'en') => {
  return translations[lang]?.[key] || translations['en'][key] || key;
};

// Get AI response in specified language
export const getAIResponse = (topic, lang = 'en') => {
  return aiResponses[lang]?.[topic] || aiResponses['en'][topic] || '';
};

export default {
  supportedLanguages,
  translations,
  aiResponses,
  t,
  getAIResponse
};
