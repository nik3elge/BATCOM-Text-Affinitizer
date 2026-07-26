import React, { useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, X, Download } from 'lucide-react';

interface GuideSectionProps {
  onClose: () => void;
}

export const GuideSection: React.FC<GuideSectionProps> = ({ onClose }) => {
  const guideScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollGuide = (direction: 'left' | 'right') => {
    if (guideScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      guideScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50/30 to-sky-50 border border-blue-100 rounded-2xl p-5 relative shadow-xs animate-fade-in">
      {/* Header with Title, Scroll Arrows, and Close */}
      <div className="flex items-center justify-between mb-3.5 pr-2">
        <h2 className="text-slate-900 font-display font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Как это работает?</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/70 backdrop-blur-xs border border-slate-200/80 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => handleScrollGuide('left')}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all cursor-pointer"
              title="Прокрутить назад"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={() => handleScrollGuide('right')}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all cursor-pointer"
              title="Прокрутить вперед"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
            title="Закрыть справку"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Cards Container */}
      <div 
        ref={guideScrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 pt-0.5 px-0.5 scrollbar-thin scrollbar-thumb-blue-200/80"
      >
        {/* Step 1 */}
        <div className="w-[400px] sm:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">1</span>
            <p className="font-bold text-slate-800 text-sm">Вставьте текст</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <p>Вставьте ваш рабочий текст в поле ввода или перетащите текстовый файл.</p>
            <p>Вы можете настраивать, какие строки будут <b>игнорироваться</b> (пропускаться) при конвертации в RTF:</p>
            <p>• <b>Пустые строки</b> (по умолчанию включено);</p>
            <p>• Любые символы, префиксы или слова (по умолчанию <code>#</code>). Нажмите <b>«Правила по символам»</b> в Блоке А для настройки.</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="w-[400px] sm:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">2</span>
            <p className="font-bold text-slate-800 text-sm">Настройте стили абзацев</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-2">
            <p>Сопоставьте маркеры с именами <b>стилей абзацев (Paragraph Style)</b>. Названия стилей — <b>только латиницей</b>.</p>
            <p>• <b><code>^ Начало</code></b> — ищет <i>точное совпадение</i> текста (буква в букву). Удобно для постоянных маркеров вроде <b>М+</b> или <b>Кратос:</b>.</p>
            <p>• <b><code>.* Regex</code></b> — гибкий поиск по <i>шаблону (маске)</i>, когда маркер меняется:</p>
            <div className="pl-3 border-l-2 border-slate-200 space-y-1.5 my-2">
              <div className="flex items-baseline gap-2 text-[11px]">
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 font-mono text-[10.5px] shrink-0">^\d+\.\s*</code>
                <span className="text-slate-600">любая нумерация (<code>1.</code>, <code>2.</code>, <code>10.</code>)</span>
              </div>
              <div className="flex items-baseline gap-2 text-[11px]">
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 font-mono text-[10.5px] shrink-0">^(Иван|Анна):</code>
                <span className="text-slate-600">сразу несколько персонажей</span>
              </div>
              <div className="flex items-baseline gap-2 text-[11px]">
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 font-mono text-[10.5px] shrink-0">^[А-Я\s]+:</code>
                <span className="text-slate-600">любые имена КАПСОМ перед двоеточием</span>
              </div>
            </div>
            <p>Все найденные маркеры <b>сотрутся из финального текста</b>.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="w-[400px] sm:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">3</span>
            <p className="font-bold text-slate-800 text-sm">Настройте стили символов</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <p>Помимо стилей абзаца, вы можете настроить <b>стили символов (Character Styles)</b>. Названия стилей — <b>только латиницей</b>.</p>
            <p>Для этого окружите нужное слово маркерами-ограничителями (например, <b><code>**</code></b> для <b>жирного</b> шрифта или <b><code>*</code></b> для <i>курсива</i>) и свяжите их с соответствующим стилем.</p>
            <p>Все найденные ограничители <b>сотрутся из финального текста</b>.</p>
            <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-indigo-50/70 border border-indigo-200/80 shadow-2xs flex items-start gap-2.5 text-slate-800">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5 shadow-2xs">
                <Download className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 font-medium">
                После настройки всех стилей рекомендуется <b className="font-bold text-indigo-950 underline decoration-indigo-300 underline-offset-2">экспортировать .json‑файл</b> и сохранить его в надёжном месте.
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="w-[400px] sm:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">4</span>
            <p className="font-bold text-slate-800 text-sm">Воспользуйтесь Типографом</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <p>Вы можете включить <b>Типограф</b> для автоматического повышения качества вёрстки текста.</p>
            <p>Он расставляет неразрывные пробелы (после предлогов, перед частями речи и числами), длинные тире и возобновляет букву «ё».</p>
            <p>Каждое правило можно <b>включить</b> или <b>отключить</b> отдельно.</p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="w-[400px] sm:w-[450px] shrink-0 snap-start bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">5</span>
            <p className="font-bold text-slate-800 text-sm">Импорт в Affinity</p>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <p>Нажмите <b>«Конвертировать и скачать»</b>. Вы получите файл в формате <b>RTF</b> с внедрённой таблицей стилей.</p>
            <p>В Affinity создайте текстовый фрейм, нажмите <b>File → Place</b> и выберите этот RTF‑файл.</p>
            <p>Если указанных стилей в документе до этого не было, то они появятся в панели <b>Text Styles.</b></p>
            <p>Для применения стилей выберите весь текст и нажмите кнопку <b>Reapply Text Styles</b> в панели Text Styles.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
