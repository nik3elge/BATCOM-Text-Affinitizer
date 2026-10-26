import React, { useState } from 'react';
import { Code, Eye, Copy, Check, FileCode } from 'lucide-react';
import { ProcessedLine, MarkerRule, InlineRule } from '../types';
import { Language, TRANSLATIONS } from '../constants/translations';
import { getRuleColor, parseInlineStylesToHTML } from '../utils/rtfGenerator';

interface PreviewSectionProps {
  processedLines: ProcessedLine[];
  rules: MarkerRule[];
  inlineRules: InlineRule[];
  readableRTFContent: string;
  generatedRTFContent: string;
  lang: Language;
  onToast: (msg: string) => void;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  processedLines,
  rules,
  inlineRules,
  readableRTFContent,
  generatedRTFContent,
  lang,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [copied, setCopied] = useState<boolean>(false);
  const t = TRANSLATIONS[lang];

  const handleCopy = async () => {
    try {
      if (activeTab === 'visual') {
        const textToCopy = processedLines.map(l => l.text).join('\n');
        await navigator.clipboard.writeText(textToCopy);
        onToast(t.toastCopiedText);
      } else {
        await navigator.clipboard.writeText(generatedRTFContent || readableRTFContent);
        onToast(t.toastCopiedRtf);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const rtfSizeKb = (new Blob([readableRTFContent]).size / 1024).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col transition-all">
      {/* Header bar */}
      <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
            {activeTab === 'visual' ? <Eye className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm text-slate-800">{t.blockETitle}</h3>
            <p className="text-xs text-slate-500 truncate">{t.blockESubtitle}</p>
          </div>
        </div>

        {/* Tab switcher & Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
          {/* Segmented Tab Control */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.tabVisualPreview}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>{t.tabRtfCode}</span>
            </button>
          </div>

          {/* Line/Size Badge */}
          <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-lg shadow-2xs hidden md:inline-block">
            {activeTab === 'visual' ? t.previewLinesCount(processedLines.length) : t.kbSize(rtfSizeKb)}
          </span>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={activeTab === 'visual' ? processedLines.length === 0 : !readableRTFContent}
            className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-700 hover:text-blue-600 border-slate-200 hover:border-blue-200'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={activeTab === 'visual' ? t.copyVisualText : t.copyRtfCode}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'OK' : (activeTab === 'visual' ? t.copyVisualText : t.copyRtfCode)}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'visual' ? (
        <div className="p-4 bg-slate-50/40 min-h-[260px] max-h-[460px] overflow-y-auto">
          {processedLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center select-none text-slate-400">
              <Eye className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-500">{t.emptyPreview}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {processedLines.map((line, idx) => {
                const styleColor = getRuleColor(line.styleName);
                return (
                  <div
                    key={line.id || idx}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200/70 hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    {/* Paragraph Style Badge */}
                    <span
                      className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md border shrink-0 select-none"
                      style={{
                        borderColor: `${styleColor}40`,
                        backgroundColor: `${styleColor}15`,
                        color: styleColor,
                      }}
                      title={`Стиль абзаца: ${line.styleName}`}
                    >
                      {line.styleName}
                    </span>

                    {/* Formatted Text with Parsed Inline Styles */}
                    <span
                      className="text-xs text-slate-800 leading-relaxed font-sans break-words flex-1 pt-0.5 select-text"
                      dangerouslySetInnerHTML={{
                        __html: parseInlineStylesToHTML(line.text, inlineRules, lang),
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto min-h-[260px] max-h-[460px] overflow-y-auto selection:bg-blue-500/30 selection:text-blue-100">
          <pre className="whitespace-pre-wrap break-all text-slate-200 font-mono">
            {readableRTFContent || t.emptyPreview}
          </pre>
        </div>
      )}
    </div>
  );
};
