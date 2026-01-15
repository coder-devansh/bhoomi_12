import { useState, useEffect } from 'react';
import { supportedLanguages } from '../services/multilingualService';

interface LanguageSelectorProps {
  onLanguageChange?: (lang: string) => void;
}

export default function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem('bhoomisetu_language');
    if (saved && supportedLanguages[saved as keyof typeof supportedLanguages]) {
      setCurrentLang(saved);
    }
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem('bhoomisetu_language', langCode);
    setIsOpen(false);
    
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('languageChange', { detail: langCode }));
  };

  const currentLanguage = supportedLanguages[currentLang as keyof typeof supportedLanguages];

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
      >
        <span className="text-lg">🌐</span>
        <span className="font-medium text-gray-700">{currentLanguage.nativeName}</span>
        <span className="text-gray-400 text-sm">▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700 text-sm">Select Language</h3>
              <p className="text-xs text-gray-500">भाषा चुनें • ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ</p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {Object.entries(supportedLanguages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageSelect(code)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                    currentLang === code ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      currentLang === code ? 'bg-indigo-500' : 'bg-gray-300'
                    }`} />
                    <div className="text-left">
                      <div className="font-medium text-gray-800">{lang.nativeName}</div>
                      <div className="text-xs text-gray-500">{lang.name}</div>
                    </div>
                  </div>
                  {currentLang === code && (
                    <span className="text-indigo-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
