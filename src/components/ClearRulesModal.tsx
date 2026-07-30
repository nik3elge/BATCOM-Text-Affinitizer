import React from 'react';
import { Trash2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../constants/translations';

interface ClearRulesModalProps {
  lang?: Language;
  onClose: () => void;
  onRestoreDefaults: () => void;
  onClearAll: () => void;
}

export const ClearRulesModal: React.FC<ClearRulesModalProps> = ({
  lang = 'ru',
  onClose,
  onRestoreDefaults,
  onClearAll,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden p-6 relative flex flex-col gap-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
        >
          &times;
        </button>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
            <Trash2 className="w-6 h-6 text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">{t.modalTitle}</h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              {t.modalDesc}
            </p>
            <p className="text-slate-400 text-[11px] mt-2 italic">
              {t.modalSubDesc}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
          <button
            onClick={onRestoreDefaults}
            className="px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-100 rounded-xl transition-all cursor-pointer border border-transparent text-center"
          >
            {t.modalRestoreDefaults}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center"
          >
            {t.modalCancel}
          </button>
          <button
            onClick={onClearAll}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-200 hover:shadow-rose-300 transition-all cursor-pointer text-center"
          >
            {t.modalClearAll}
          </button>
        </div>
      </div>
    </div>
  );
};
