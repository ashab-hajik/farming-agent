import { t } from '../i18n.js'

export default function LanguageToggle({ value, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-emerald-900">
      <span className="sr-only">{t('language')}</span>
      <select aria-label={t('language')} value={value} onChange={(e) => onChange(e.target.value)} className="border rounded-md px-2 py-1 bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400">
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="kn">ಕನ್ನಡ</option>
      </select>
    </label>
  )
}
