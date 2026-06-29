import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import vi from './locales/vi.json'

// Hạ tầng i18n. Hiện chỉ có tiếng Việt; thêm tiếng Anh sau = thêm file en.json
// + resources.en + 1 nút đổi ngôn ngữ (i18n.changeLanguage('en')). Key giữ nguyên.
i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
  },
  lng: 'vi',
  fallbackLng: 'vi',
  interpolation: { escapeValue: false }, // React đã tự escape
})

export default i18n
