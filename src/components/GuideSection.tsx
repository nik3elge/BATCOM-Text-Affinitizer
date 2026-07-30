import React, { useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, X, Download } from 'lucide-react';
import { Language, TRANSLATIONS } from '../constants/translations';

const ReapplyTextStylesIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Capital T */}
    <path d="M 3 5 h 9" />
    <path d="M 7.5 5 v 13" />
    {/* Clockwise curved arrow on the lower right */}
    <path d="M 13.5 10.5 a 4.5 4.5 0 0 1 5.5 4.5 c 0 2.2 -1.5 4.5 -4 5" />
    <polyline points="17 18 14.5 20.2 16.8 22.5" />
  </svg>
);

interface GuideSectionProps {
  lang?: Language;
  onClose: () => void;
}

export const GuideSection: React.FC<GuideSectionProps> = ({ lang = 'ru', onClose }) => {
  const guideScrollRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  const handleScrollGuide = (direction: 'left' | 'right') => {
    if (guideScrollRef.current) {
      const cardWidth = guideScrollRef.current.firstElementChild?.clientWidth || 300;
      const scrollAmount = direction === 'left' ? -(cardWidth + 12) : cardWidth + 12;
      guideScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50/30 to-sky-50 border border-blue-100 rounded-2xl p-3.5 sm:p-5 relative shadow-xs animate-fade-in">
      {/* Header with Title, Scroll Arrows, and Close */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-slate-900 font-display font-bold text-xs sm:text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{t.howItWorks}</span>
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => handleScrollGuide('left')}
              className="p-1 sm:p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all cursor-pointer"
              title={t.scrollPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={() => handleScrollGuide('right')}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all cursor-pointer"
              title={t.scrollNext}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
            title={t.closeGuide}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Cards Container */}
      <div 
        ref={guideScrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 pt-0.5 px-0.5 scrollbar-thin scrollbar-thumb-blue-200/80"
      >
        {/* Step 1 */}
        <div className="w-full sm:w-[420px] md:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">1</span>
            <p className="font-bold text-slate-800 text-sm">{t.step1Title}</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <p>{t.step1p1}</p>
            <p dangerouslySetInnerHTML={{ __html: t.step1p2 }} />
            <p dangerouslySetInnerHTML={{ __html: t.step1p3 }} />
            <p dangerouslySetInnerHTML={{ __html: t.step1p4 }} />
          </div>
        </div>

        {/* Step 2 */}
        <div className="w-full sm:w-[420px] md:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">2</span>
            <p className="font-bold text-slate-800 text-sm">{t.step2Title}</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-2">
            <p dangerouslySetInnerHTML={{ __html: t.step2p1 }} />
            <p dangerouslySetInnerHTML={{ __html: t.step2p2 }} />
            <p dangerouslySetInnerHTML={{ __html: t.step2p3 }} />
            <div className="pl-2.5 sm:pl-3 border-l-2 border-slate-200 space-y-1.5 my-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-[11px]">
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 font-mono text-[10.5px] w-fit shrink-0">^\d+\.\s*</code>
                <span className="text-slate-600">{t.step2Reg1}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-[11px]">
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 font-mono text-[10.5px] w-fit shrink-0">{lang === 'en' ? '^(John|Anna):' : '^(Иван|Анна):'}</code>
                <span className="text-slate-600">{t.step2Reg2}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-[11px]">
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 font-mono text-[10.5px] w-fit shrink-0">{lang === 'en' ? '^[A-Z\\s]+:' : '^[А-Я\\s]+:'}</code>
                <span className="text-slate-600">{t.step2Reg3}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="w-full sm:w-[420px] md:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">3</span>
            <p className="font-bold text-slate-800 text-sm">{t.step3Title}</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <p dangerouslySetInnerHTML={{ __html: t.step3p1 }} />
            <p dangerouslySetInnerHTML={{ __html: t.step3p2 }} />
            <p dangerouslySetInnerHTML={{ __html: t.step3p3 }} />
            <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-indigo-50/70 border border-indigo-200/80 shadow-2xs flex items-start gap-2.5 text-slate-800">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5 shadow-2xs">
                <Download className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 font-medium">
                {t.step3Tipp1} <b className="font-bold text-indigo-950 underline decoration-indigo-300 underline-offset-2">{t.step3Tipp2}</b> {t.step3Tipp3}.
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="w-full sm:w-[420px] md:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">4</span>
            <p className="font-bold text-slate-800 text-sm">{t.step4Title}</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <p dangerouslySetInnerHTML={{ __html: t.step4p1 }} />
            <p dangerouslySetInnerHTML={{ __html: t.step4p2 }} />
          </div>
        </div>

        {/* Step 5 */}
        <div className="w-full sm:w-[420px] md:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">5</span>
            <p className="font-bold text-slate-800 text-sm">{t.step5Title}</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <p dangerouslySetInnerHTML={{ __html: t.step5p1 }} />
            <p dangerouslySetInnerHTML={{ __html: t.step5p2 }} />
            <p dangerouslySetInnerHTML={{ __html: t.step5p3 }} />
            <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-indigo-50/70 border border-indigo-200/80 shadow-2xs flex items-start gap-2.5 text-slate-800">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5 shadow-2xs">
                <ReapplyTextStylesIcon className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 font-medium">
                {t.step5Tip1} <b>{t.step5Tip2}</b> {t.step5Tip3} <b className="font-bold text-indigo-950 underline decoration-indigo-300 underline-offset-2">{t.step5Tip4}</b> {t.step5Tip5} <b>{t.step5Tip6}</b>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
