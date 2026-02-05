// UrbisX Language Manager
// Handles language switching and translation

class LanguageManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentLanguage = this.getStoredLanguage() || 'en';
    this.translations = window.translations || {};
  }

  // Get language from localStorage
  getStoredLanguage() {
    return localStorage.getItem('urbisx_language');
  }

  // Get current language
  getLanguage() {
    return this.currentLanguage;
  }

  // Set language
  async setLanguage(lang) {
    if (!['en', 'hi', 'fr'].includes(lang)) {
      console.error('Unsupported language:', lang);
      return;
    }

    this.currentLanguage = lang;
    localStorage.setItem('urbisx_language', lang);

    // Save to database if user is logged in
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        await this.saveUserLanguage(user.id, lang);
      }
    } catch (e) {
      console.log('Could not save language to database');
    }

    // Update page
    this.updatePageLanguage();
  }

  // Get translation by key path (e.g., 'nav.features')
  t(keyPath) {
    const keys = keyPath.split('.');
    let value = this.translations[this.currentLanguage];

    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return keyPath; // Return key if not found
      }
    }

    return value || keyPath;
  }

  // Load user's language from database
  async loadUserLanguage() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        // If no user, use stored language or default
        this.currentLanguage = this.getStoredLanguage() || 'en';
        return;
      }

      // If the user selected a language during signup but email confirmation was required,
      // we may not have had a session to write user_preferences. Sync it now.
      const pendingLang = localStorage.getItem('urbisx_pending_language');
      if (pendingLang && ['en', 'hi', 'fr'].includes(pendingLang)) {
        this.currentLanguage = pendingLang;
        localStorage.setItem('urbisx_language', pendingLang);
        await this.saveUserLanguage(user.id, pendingLang);
        localStorage.removeItem('urbisx_pending_language');
        return;
      }

      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('language')
        .eq('user_id', user.id)
        .single();

      if (data && data.language) {
        // User has a saved preference - use it
        this.currentLanguage = data.language;
        localStorage.setItem('urbisx_language', data.language);
      } else {
        // User exists but no preference saved - use stored or default
        const storedLang = this.getStoredLanguage() || 'en';
        this.currentLanguage = storedLang;
        // Save the current language to database for future
        await this.saveUserLanguage(user.id, storedLang);
      }
    } catch (e) {
      // Use stored language or default
      this.currentLanguage = this.getStoredLanguage() || 'en';
    }
  }

  // Save language to database
  async saveUserLanguage(userId, language) {
    try {
      await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          language: language,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Error saving language:', e);
    }
  }

  // Update all elements with data-i18n attribute
  updatePageLanguage() {
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation !== key) {
        el.textContent = translation;
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation !== key) {
        el.placeholder = translation;
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;
  }

  // Get supported languages
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'fr', name: 'French', nativeName: 'Français' }
    ];
  }

  // Get language display name
  getLanguageName(code) {
    const lang = this.getSupportedLanguages().find(l => l.code === code);
    return lang ? lang.nativeName : code;
  }

  // Create language selector dropdown
  createLanguageSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentLang = this.getLanguage();
    const languages = this.getSupportedLanguages();

    container.innerHTML = `
      <div class="language-selector">
        <button class="language-btn" type="button" aria-label="Select language">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span class="language-current">${this.getLanguageName(currentLang)}</span>
        </button>
        <div class="language-dropdown">
          ${languages.map(lang => `
            <button type="button" class="language-option ${lang.code === currentLang ? 'active' : ''}" data-lang="${lang.code}">
              ${lang.nativeName}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Event listeners
    const btn = container.querySelector('.language-btn');
    const dropdown = container.querySelector('.language-dropdown');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

    container.querySelectorAll('.language-option').forEach(option => {
      option.addEventListener('click', async (e) => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        await this.setLanguage(lang);
        
        // Update UI
        container.querySelector('.language-current').textContent = this.getLanguageName(lang);
        container.querySelectorAll('.language-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        dropdown.classList.remove('show');
      });
    });
  }
}

// Initialize function
function initLanguageManager(supabaseClient) {
  return new LanguageManager(supabaseClient);
}

// Make available globally
if (typeof window !== 'undefined') {
  window.LanguageManager = LanguageManager;
  window.initLanguageManager = initLanguageManager;
}
