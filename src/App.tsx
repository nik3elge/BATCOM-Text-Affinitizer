import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trash2, 
  Plus, 
  Download, 
  RefreshCw, 
  FileText, 
  HelpCircle,
  CheckCircle2,
  FileCode,
  Upload,
  Sliders,
  X,
  Wand2,
  Search,
  RotateCcw,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Code,
  Pilcrow,
  Github
} from 'lucide-react';

import { MarkerRule, ProcessedLine, InlineRule, IgnoreRule } from './types';
import { BoostyIcon } from './components/BoostyIcon';
import { GuideSection } from './components/GuideSection';
import { ClearRulesModal } from './components/ClearRulesModal';

import { 
  DEFAULT_RULES, 
  DEFAULT_INLINE_RULES, 
  DEFAULT_IGNORE_RULES, 
  SAMPLE_TEXT 
} from './constants/defaults';

import { 
  getAvailableTypografRules, 
  applyTypograf, 
  TypografRuleItem 
} from './utils/typografUtils';

import { 
  getRuleColor, 
  cleanStyleName, 
  parseInlineStylesToHTML, 
  generateCSS, 
  generateRTFString 
} from './utils/rtfGenerator';

export default function App() {
  // State for raw script text
  const [rawText, setRawText] = useState<string>(() => {
    const saved = localStorage.getItem('affinity-converter-raw-text');
    return saved !== null ? saved : '';
  });

  // State for block rules (Paragraph Styles)
  const [rules, setRules] = useState<MarkerRule[]>(() => {
    const saved = localStorage.getItem('affinity-converter-rules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return DEFAULT_RULES;
  });

  // State for inline rules (Character Styles)
  const [inlineRules, setInlineRules] = useState<InlineRule[]>(() => {
    const saved = localStorage.getItem('affinity-converter-inline-rules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return DEFAULT_INLINE_RULES;
  });

  // State for default paragraph style name
  const [defaultStyleName, setDefaultStyleName] = useState<string>(() => {
    return localStorage.getItem('affinity-converter-default-style-name') || 'base';
  });

  // UI States
  const [showGuide, setShowGuide] = useState<boolean>(() => {
    const saved = localStorage.getItem('affinity-converter-show-guide');
    return saved !== null ? saved === 'true' : true;
  });
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearRulesConfirm, setShowClearRulesConfirm] = useState<boolean>(false);

  // Ignore Rules (Filtering)
  const [ignoreEmptyLines, setIgnoreEmptyLines] = useState<boolean>(() => {
    const saved = localStorage.getItem('affinity-converter-ignore-empty-lines');
    return saved !== null ? saved === 'true' : true;
  });

  const [ignoreRules, setIgnoreRules] = useState<IgnoreRule[]>(() => {
    const saved = localStorage.getItem('affinity-converter-ignore-rules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return DEFAULT_IGNORE_RULES;
  });

  const [showIgnorePanel, setShowIgnorePanel] = useState<boolean>(false);

  // Typograf rules & settings
  const availableTypografRules = useMemo(() => getAvailableTypografRules(), []);

  const [autoApplyTypograf, setAutoApplyTypograf] = useState<boolean>(() => {
    const saved = localStorage.getItem('affinity-converter-auto-typograf');
    return saved !== null ? saved === 'true' : true;
  });

  const [typografRuleStates, setTypografRuleStates] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('affinity-converter-typograf-rule-states-v24');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const defaults: Record<string, boolean> = {};
    getAvailableTypografRules().forEach(r => {
      defaults[r.id] = r.enabledByDefault;
    });
    return defaults;
  });

  const [typografSearch, setTypografSearch] = useState<string>('');
  const [typografGroupFilter, setTypografGroupFilter] = useState<string>('all');
  const [isTypografRulesExpanded, setIsTypografRulesExpanded] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('affinity-converter-raw-text', rawText);
  }, [rawText]);

  useEffect(() => {
    localStorage.setItem('affinity-converter-rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('affinity-converter-inline-rules', JSON.stringify(inlineRules));
  }, [inlineRules]);

  useEffect(() => {
    localStorage.setItem('affinity-converter-default-style-name', defaultStyleName);
  }, [defaultStyleName]);

  useEffect(() => {
    localStorage.setItem('affinity-converter-show-guide', String(showGuide));
  }, [showGuide]);

  useEffect(() => {
    localStorage.setItem('affinity-converter-ignore-empty-lines', String(ignoreEmptyLines));
  }, [ignoreEmptyLines]);

  useEffect(() => {
    localStorage.setItem('affinity-converter-ignore-rules', JSON.stringify(ignoreRules));
  }, [ignoreRules]);

  useEffect(() => {
    localStorage.setItem('affinity-converter-auto-typograf', JSON.stringify(autoApplyTypograf));
  }, [autoApplyTypograf]);

  useEffect(() => {
    localStorage.setItem('affinity-converter-typograf-rule-states-v24', JSON.stringify(typografRuleStates));
  }, [typografRuleStates]);

  const typografGroups = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>();
    availableTypografRules.forEach(r => {
      if (!map.has(r.group)) {
        map.set(r.group, { id: r.group, title: r.groupTitle, count: 0 });
      }
      map.get(r.group)!.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.id === 'other' || a.title.includes('Прочи')) return 1;
      if (b.id === 'other' || b.title.includes('Прочи')) return -1;
      return b.count - a.count;
    });
  }, [availableTypografRules]);

  const filteredTypografRules = useMemo(() => {
    const query = typografSearch.trim().toLowerCase();
    return availableTypografRules
      .filter(r => {
        const matchesGroup = typografGroupFilter === 'all' || r.group === typografGroupFilter;
        const matchesSearch = !query || 
          r.title.toLowerCase().includes(query) || 
          r.description.toLowerCase().includes(query) ||
          (r.tooltip && r.tooltip.toLowerCase().includes(query)) ||
          r.id.toLowerCase().includes(query) ||
          r.groupTitle.toLowerCase().includes(query);
        return matchesGroup && matchesSearch;
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }, [availableTypografRules, typografGroupFilter, typografSearch]);

  const activeTypografRulesCount = useMemo(() => {
    return availableTypografRules.filter(r => typografRuleStates[r.id]).length;
  }, [availableTypografRules, typografRuleStates]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRunTypografOnRawText = () => {
    if (!rawText.trim()) {
      triggerToast('Исходный текст пуст.');
      return;
    }
    const formatted = applyTypograf(rawText, typografRuleStates);
    if (formatted === rawText) {
      triggerToast('Текст уже идеально оттипографирован!');
    } else {
      setRawText(formatted);
      triggerToast('Текст в Блоке А успешно оттипографирован!');
    }
  };

  const handleToggleTypografRule = (ruleId: string) => {
    setTypografRuleStates(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  const handleEnableAllTypografRules = (rulesToEnable: TypografRuleItem[]) => {
    setTypografRuleStates(prev => {
      const next = { ...prev };
      rulesToEnable.forEach(r => { next[r.id] = true; });
      return next;
    });
    triggerToast('Правила включены.');
  };

  const handleDisableAllTypografRules = (rulesToDisable: TypografRuleItem[]) => {
    setTypografRuleStates(prev => {
      const next = { ...prev };
      rulesToDisable.forEach(r => { next[r.id] = false; });
      return next;
    });
    triggerToast('Правила выключены.');
  };

  const handleResetTypografRules = () => {
    const defaults: Record<string, boolean> = {};
    availableTypografRules.forEach(r => {
      defaults[r.id] = r.enabledByDefault;
    });
    setTypografRuleStates(defaults);
    triggerToast('Правила типографа сброшены по умолчанию.');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rulesFileInputRef = useRef<HTMLInputElement>(null);

  // Export & Import Handlers
  const handleExportRules = () => {
    try {
      const exportObject = {
        rules: rules.map(rule => ({
          id: rule.id,
          name: rule.name,
          pattern: rule.pattern,
          matchMode: rule.matchMode,
          styleName: rule.styleName
        })),
        inlineRules: inlineRules.map(ir => ({
          id: ir.id,
          marker: ir.marker,
          styleName: ir.styleName
        })),
        defaultStyleName,
        ignoreEmptyLines,
        ignoreRules: ignoreRules.map(ig => ({
          id: ig.id,
          pattern: ig.pattern,
          matchMode: ig.matchMode,
          enabled: ig.enabled
        }))
      };
      const dataStr = JSON.stringify(exportObject, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

      link.download = `affinity_styles_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('Настройки успешно экспортированы!');
    } catch (err) {
      triggerToast('Ошибка экспорта настроек.');
    }
  };

  const handleImportRules = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          const validatedRules = parsed.map((item: any, idx: number) => ({
            id: item.id || `rule-${Date.now()}-${idx}`,
            name: item.name || `Правило ${idx + 1}`,
            pattern: typeof item.pattern === 'string' ? item.pattern : '',
            matchMode: (item.matchMode === 'starts-with' || item.matchMode === 'regex') ? item.matchMode : 'starts-with',
            styleName: typeof item.styleName === 'string' ? item.styleName : `Style_${idx + 1}`,
          }));
          setRules(validatedRules);
          triggerToast('Настройки успешно импортированы!');
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.rules)) {
            setRules(parsed.rules.map((item: any, idx: number) => ({
              id: item.id || `rule-${Date.now()}-${idx}`,
              name: item.name || `Правило ${idx + 1}`,
              pattern: typeof item.pattern === 'string' ? item.pattern : '',
              matchMode: (item.matchMode === 'starts-with' || item.matchMode === 'regex') ? item.matchMode : 'starts-with',
              styleName: typeof item.styleName === 'string' ? item.styleName : `Style_${idx + 1}`,
            })));
          }
          if (Array.isArray(parsed.inlineRules)) {
            setInlineRules(parsed.inlineRules.map((item: any, idx: number) => ({
              id: item.id || `inline-${Date.now()}-${idx}`,
              marker: typeof item.marker === 'string' ? item.marker : '',
              styleName: typeof item.styleName === 'string' ? item.styleName : `CharStyle_${idx + 1}`,
            })));
          }
          if (typeof parsed.defaultStyleName === 'string') setDefaultStyleName(parsed.defaultStyleName);
          if (typeof parsed.ignoreEmptyLines === 'boolean') setIgnoreEmptyLines(parsed.ignoreEmptyLines);
          if (Array.isArray(parsed.ignoreRules)) {
            setIgnoreRules(parsed.ignoreRules.map((item: any, idx: number) => ({
              id: item.id || `ignore-${Date.now()}-${idx}`,
              pattern: typeof item.pattern === 'string' ? item.pattern : '',
              matchMode: (item.matchMode === 'starts-with' || item.matchMode === 'contains' || item.matchMode === 'regex') ? item.matchMode : 'starts-with',
              enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
            })));
          }
          triggerToast('Настройки успешно импортированы!');
        } else {
          triggerToast('Неверный формат файла.');
        }
      } catch (err) {
        triggerToast('Ошибка при чтении файла правил.');
      }
      if (rulesFileInputRef.current) rulesFileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Ignore Rules management
  const handleAddIgnoreRule = () => {
    setIgnoreRules(prev => [...prev, {
      id: `ignore-${Date.now()}`,
      pattern: '',
      matchMode: 'starts-with',
      enabled: true
    }]);
  };

  const handleAddQuickIgnoreRule = (pattern: string, matchMode: 'starts-with' | 'contains' | 'regex' = 'starts-with') => {
    const exists = ignoreRules.some(r => r.pattern === pattern && r.matchMode === matchMode);
    if (exists) {
      setIgnoreRules(prev => prev.map(r => (r.pattern === pattern && r.matchMode === matchMode) ? { ...r, enabled: true } : r));
      triggerToast(`Правило "${pattern}" уже добавлено и включено.`);
      return;
    }
    setIgnoreRules(prev => [...prev, {
      id: `ignore-${Date.now()}`,
      pattern,
      matchMode,
      enabled: true
    }]);
    triggerToast(`Добавлено правило игнорирования: "${pattern}"`);
  };

  const handleUpdateIgnoreRule = (id: string, field: keyof IgnoreRule, value: any) => {
    setIgnoreRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleDeleteIgnoreRule = (id: string) => {
    setIgnoreRules(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleIgnoreRule = (id: string) => {
    setIgnoreRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  // Rule CRUD handlers
  const handleAddRule = () => {
    setRules(prev => [...prev, {
      id: `rule-${Date.now()}`,
      name: `Правило ${prev.length + 1}`,
      pattern: '',
      matchMode: 'starts-with',
      styleName: `Custom_Style_${prev.length + 1}`
    }]);
    triggerToast('Новое правило добавлено!');
  };

  const handleUpdateRule = (id: string, updatedFields: Partial<MarkerRule>) => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== id) return rule;
      const newRule = { ...rule, ...updatedFields };
      if (updatedFields.styleName !== undefined) {
        newRule.styleName = cleanStyleName(updatedFields.styleName);
      }
      return newRule;
    }));
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    triggerToast('Правило удалено.');
  };

  // Inline rule CRUD handlers
  const handleAddInlineRule = () => {
    setInlineRules(prev => [...prev, {
      id: `inline-${Date.now()}`,
      marker: '***',
      styleName: `CharStyle_${prev.length + 1}`
    }]);
    triggerToast('Новый символьный стиль добавлен!');
  };

  const handleUpdateInlineRule = (id: string, updatedFields: Partial<InlineRule>) => {
    setInlineRules(prev => prev.map(rule => {
      if (rule.id !== id) return rule;
      const newRule = { ...rule, ...updatedFields };
      if (updatedFields.styleName !== undefined) {
        newRule.styleName = cleanStyleName(updatedFields.styleName);
      }
      return newRule;
    }));
  };

  const handleDeleteInlineRule = (id: string) => {
    setInlineRules(prev => prev.filter(r => r.id !== id));
    triggerToast('Символьный стиль удален.');
  };

  const handleClearAllRules = () => {
    setRules([]);
    setInlineRules([]);
    setShowClearRulesConfirm(false);
    triggerToast('Все правила и стили символов удалены.');
  };

  // File drag & drop / import
  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text !== undefined) {
        setRawText(text);
        triggerToast(`Импортировано: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readFile(e.dataTransfer.files[0]);
    }
  };

  const totalRawLinesCount = useMemo(() => {
    if (!rawText) return 0;
    return rawText.split('\n').length;
  }, [rawText]);

  const activeIgnoreRulesCount = useMemo(() => {
    return ignoreRules.filter(r => r.enabled && r.pattern.trim() !== '').length;
  }, [ignoreRules]);

  // Optimized line processing algorithm with precompiled regexes
  const processedLines = useMemo<ProcessedLine[]>(() => {
    let sourceText = rawText;
    if (autoApplyTypograf) {
      sourceText = applyTypograf(rawText, typografRuleStates);
    }
    const lines = sourceText.split('\n');
    
    // Precompile ignore rules
    const activeIgnoreRules = ignoreRules
      .filter(r => r.enabled && r.pattern.trim() !== '')
      .map(r => {
        const pattern = r.pattern.trim();
        let regex: RegExp | null = null;
        if (r.matchMode === 'regex') {
          try {
            regex = new RegExp(pattern);
          } catch (e) {}
        }
        return { ...r, pattern, regex };
      });

    // Precompile paragraph style rules
    const activeRules = rules
      .filter(r => r.pattern.trim() !== '')
      .map(r => {
        let regex: RegExp | null = null;
        if (r.matchMode === 'regex') {
          try {
            regex = new RegExp(r.pattern);
          } catch (e) {}
        }
        return { ...r, regex };
      });

    const defaultStyle = defaultStyleName.trim() || 'base';

    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      if (ignoreEmptyLines && trimmed === '') return false;

      for (const rule of activeIgnoreRules) {
        if (rule.matchMode === 'starts-with') {
          if (trimmed.startsWith(rule.pattern)) return false;
        } else if (rule.matchMode === 'contains') {
          if (line.includes(rule.pattern)) return false;
        } else if (rule.matchMode === 'regex' && rule.regex) {
          if (rule.regex.test(line)) return false;
        }
      }
      return true;
    });

    return filteredLines.map((line, index) => {
      let matchedRuleId: string | null = null;
      let styleName = defaultStyle;
      let processedText = line;

      for (const rule of activeRules) {
        let isMatch = false;

        if (rule.matchMode === 'starts-with') {
          const trimmedLine = line.trimStart();
          if (trimmedLine.startsWith(rule.pattern)) {
            isMatch = true;
            processedText = trimmedLine.slice(rule.pattern.length).trim();
          }
        } else if (rule.matchMode === 'regex' && rule.regex) {
          const match = rule.regex.exec(line);
          if (match) {
            isMatch = true;
            processedText = line.replace(rule.regex, '').trim();
          }
        }

        if (isMatch) {
          styleName = rule.styleName;
          matchedRuleId = rule.id;
          break;
        }
      }

      return {
        id: `line-${index}`,
        styleName,
        text: processedText,
        originalText: line,
        matchedRuleId
      };
    });
  }, [rawText, rules, defaultStyleName, autoApplyTypograf, typografRuleStates, ignoreEmptyLines, ignoreRules]);

  const ignoredLinesCount = useMemo(() => {
    return Math.max(0, totalRawLinesCount - processedLines.length);
  }, [totalRawLinesCount, processedLines.length]);

  const readableRTFContent = useMemo<string>(() => {
    return generateRTFString(processedLines, rules, inlineRules, defaultStyleName, false);
  }, [processedLines, rules, inlineRules, defaultStyleName]);

  const generatedRTFContent = useMemo<string>(() => {
    return generateRTFString(processedLines, rules, inlineRules, defaultStyleName, true);
  }, [processedLines, rules, inlineRules, defaultStyleName]);

  const handleDownloadFile = () => {
    const blob = new Blob([generatedRTFContent], { type: 'text/rtf;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'script_affinity_ready.rtf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Файл .rtf успешно скачан!');
  };

  const handleClearText = () => {
    setRawText('');
    triggerToast('Текст очищен.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-slide-in text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <Pilcrow className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 id="app-title" className="font-display text-lg font-bold text-slate-800 tracking-tight">
                Аффинизатор текста от BATCOM
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                Инструмент для автоматической разметки текста под ваши стили в Affinity.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="https://boosty.to/nananabatcom/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/80 transition-all shadow-2xs group"
              title="Поддержать проект на Boosty"
            >
              <BoostyIcon className="w-3.5 h-3.5 text-orange-500 group-hover:scale-110 transition-transform" />
              <span>Поддержать</span>
            </a>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                showGuide 
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? 'Скрыть инструкцию' : 'Показать инструкцию'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:px-8 lg:pt-8 lg:pb-3 flex flex-col gap-6">
        {/* Step-by-Step Guide */}
        {showGuide && <GuideSection onClose={() => setShowGuide(false)} />}

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Raw Text Input with drag and drop */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col transition-all duration-300 ${
              showGuide 
                ? 'h-[550px] lg:h-[calc(100vh-450px)] lg:min-h-[400px]' 
                : 'h-[750px] lg:h-[calc(100vh-250px)] lg:min-h-[550px]'
            }`}>
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-sm text-slate-800">Блок А: Исходный текст</h3>
                    <p className="text-xs text-slate-500 truncate">Ваш текст для обработки</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    onClick={handleRunTypografOnRawText}
                    title="Применить типограф к исходному тексту в Блоке А"
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 bg-indigo-50/60 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer shadow-2xs"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Типограф</span>
                  </button>
                  <button
                    onClick={handleClearText}
                    title="Очистить всё"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 bg-white px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Очистить</span>
                  </button>
                </div>
              </div>

              {/* Ignore Rules Sub-Header Bar */}
              <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
                    Игнорирование строк:
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium select-none bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors shadow-2xs">
                    <input
                      type="checkbox"
                      checked={ignoreEmptyLines}
                      onChange={(e) => setIgnoreEmptyLines(e.target.checked)}
                      className="w-3.5 h-3.5 accent-blue-600 text-blue-500 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Пустые строки</span>
                  </label>

                  <button
                    onClick={() => setShowIgnorePanel(prev => !prev)}
                    title="Настройка правил игнорирования строк по символам и префиксам"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0"
                  >
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    <span>{showIgnorePanel ? 'Закрыть настройку' : 'Правила по символам'}</span>
                    {activeIgnoreRulesCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
                        {activeIgnoreRulesCount}
                      </span>
                    )}
                    {showIgnorePanel ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Symbol Ignore Rules Panel */}
              {showIgnorePanel && (
                <div className="bg-slate-50/90 border-b border-slate-200/80 p-3.5 space-y-2.5 shrink-0 max-h-[320px] overflow-y-auto">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Правила игнорирования по символам и словам:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleAddIgnoreRule}
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-blue-200/60"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Добавить правило</span>
                        </button>
                        <button
                          onClick={() => setShowIgnorePanel(false)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title="Закрыть панель"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {ignoreRules.length === 0 ? (
                      <div className="text-center py-3 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                        Нет активных правил. Нажмите «Добавить правило» или выберите быстрый префикс ниже.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {ignoreRules.map((rule) => (
                          <div key={rule.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={() => handleToggleIgnoreRule(rule.id)}
                              title={rule.enabled ? 'Отключить правило' : 'Включить правило'}
                              className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                            />
                            <select
                              value={rule.matchMode}
                              onChange={(e) => handleUpdateIgnoreRule(rule.id, 'matchMode', e.target.value)}
                              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-hidden focus:border-blue-400 shrink-0 cursor-pointer"
                            >
                              <option value="starts-with">^ Начало</option>
                              <option value="contains">* Содержит</option>
                              <option value="regex">.* Regex</option>
                            </select>
                            <input
                              type="text"
                              value={rule.pattern}
                              onChange={(e) => handleUpdateIgnoreRule(rule.id, 'pattern', e.target.value)}
                              placeholder={rule.matchMode === 'regex' ? 'Шаблон (напр. ^#|\\/\\/)' : 'Префикс/Слово (напр. #, //, NOTE:)'}
                              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-mono placeholder:text-slate-400 focus:outline-hidden focus:border-blue-400 focus:bg-white"
                            />
                            <button
                              onClick={() => handleDeleteIgnoreRule(rule.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                              title="Удалить правило"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Add Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-600">Быстрые префиксы:</span>
                      <button
                        onClick={() => handleAddQuickIgnoreRule('#', 'starts-with')}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 font-mono text-slate-700 cursor-pointer shadow-2xs"
                      >
                        + #
                      </button>
                      <button
                        onClick={() => handleAddQuickIgnoreRule('№', 'starts-with')}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 font-mono text-slate-700 cursor-pointer shadow-2xs"
                      >
                        + №
                      </button>
                      <button
                        onClick={() => handleAddQuickIgnoreRule('//', 'starts-with')}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 font-mono text-slate-700 cursor-pointer shadow-2xs"
                      >
                        + //
                      </button>
                      <button
                        onClick={() => handleAddQuickIgnoreRule('=', 'starts-with')}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 font-mono text-slate-700 cursor-pointer shadow-2xs"
                      >
                        + =
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Textarea Workspace Area */}
              <div 
                className={`relative flex-1 flex flex-col p-4 transition-colors ${
                  dragActive ? 'bg-blue-50/50 border-2 border-dashed border-blue-400' : ''
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Вставьте сюда ваш сырой сценарий или перетащите текстовый файл...
Пример:
#01
Место+ Готэм.
Закадр+ Стояла дождливая тёмная ночь.
Чего стоишь? В ногах правды нет…"
                  className="w-full flex-1 resize-none bg-transparent text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm leading-relaxed font-mono border-none"
                />

                {rawText.trim() === '' && !dragActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none select-none">
                    <Upload className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm font-medium">Перетащите сюда текстовый файл (.txt)</p>
                    <p className="text-slate-400 text-xs mt-1">или кликните кнопку ниже для импорта</p>
                  </div>
                )}

                {dragActive && (
                  <div className="absolute inset-0 bg-blue-50/80 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600 animate-bounce mb-2 shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-display font-bold text-blue-700 text-sm">Отпустите файл для загрузки</p>
                    <p className="text-blue-500 text-xs">Импорт сценария произойдет мгновенно</p>
                  </div>
                )}
              </div>

              {/* Footer Panel Import Selector */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2 font-medium flex-wrap">
                  <span className="text-slate-700">Строки: {processedLines.length}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-700">Пропущено: {ignoredLinesCount}</span>
                  <span className="text-slate-300">|</span>
                  <span>Символов: {rawText.length}</span>
                </div>
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Загрузить .txt</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleTextFileUpload}
                    accept=".txt,.rtf"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Rules Configuration with real-time settings */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col transition-all duration-300 ${
              showGuide 
                ? 'h-[550px] lg:h-[calc(100vh-450px)] lg:min-h-[400px]' 
                : 'h-[750px] lg:h-[calc(100vh-250px)] lg:min-h-[550px]'
            }`}>
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-sm text-slate-800">Блок Б: Стили и маркеры</h3>
                    <p className="text-xs text-slate-500 truncate">Правила замен и стили RTF</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    onClick={() => rulesFileInputRef.current?.click()}
                    title="Импортировать настройки из файла .json"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Импорт</span>
                  </button>
                  <input
                    type="file"
                    ref={rulesFileInputRef}
                    onChange={handleImportRules}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={handleExportRules}
                    title="Экспортировать настройки в файл .json"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Экспорт</span>
                  </button>
                  <button
                    onClick={() => setShowClearRulesConfirm(true)}
                    title="Очистить настройки"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 bg-white px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Очистить</span>
                  </button>
                </div>
              </div>

              {/* Ruleset Settings Panel */}
              <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label htmlFor="default-style-input" className="text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
                    Стиль по умолчанию:
                  </label>
                  <input
                    id="default-style-input"
                    type="text"
                    value={defaultStyleName}
                    onChange={(e) => setDefaultStyleName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '_'))}
                    placeholder="Например: base или Normal"
                    className="flex-1 text-xs font-semibold text-slate-800 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 px-3 py-1.5 rounded-lg outline-hidden transition-all shadow-2xs"
                    title="Стиль в Affinity Publisher для строк без маркеров"
                  />
                </div>
              </div>

              {/* Scrollable rules list */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                {/* Section A: Paragraph Styles */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Стили абзацев</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {rules.length === 0 ? (
                      <div className="text-center py-5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-4">
                        <p className="text-slate-500 text-xs font-semibold">Нет активных правил для строк</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">Каждая строка без подходящего правила получит стиль "{defaultStyleName}"</p>
                        <button
                          onClick={handleAddRule}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Добавить стиль абзаца</span>
                        </button>
                      </div>
                    ) : (
                      rules.map((rule, idx) => {
                        let isRegexError = false;
                        if (rule.matchMode === 'regex' && rule.pattern.trim()) {
                          try {
                            new RegExp(rule.pattern);
                          } catch (e) {
                            isRegexError = true;
                          }
                        }

                        return (
                          <div 
                            key={rule.id} 
                            className="bg-white border border-slate-200 hover:border-blue-200 hover:ring-2 hover:ring-blue-50/50 rounded-xl p-2.5 flex flex-col gap-2 relative transition-all shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getRuleColor(rule.styleName) }} />
                                Стиль абзаца #{idx + 1}
                              </span>
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1 rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                                title="Удалить стиль абзаца"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                              <div className="md:col-span-7 flex flex-col gap-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Метод и Маркер
                                </label>
                                <div className="flex items-center gap-1">
                                  <select
                                    value={rule.matchMode}
                                    onChange={(e) => handleUpdateRule(rule.id, { matchMode: e.target.value as 'starts-with' | 'regex' })}
                                    className="bg-slate-100 border border-slate-200 rounded-lg text-xs px-1.5 py-1 focus:border-blue-400 focus:outline-hidden text-slate-700 font-semibold shrink-0 cursor-pointer"
                                  >
                                    <option value="starts-with">^ Начало</option>
                                    <option value="regex">.* Regex</option>
                                  </select>
                                  <div className="relative flex-1 min-w-0">
                                    <input
                                      type="text"
                                      value={rule.pattern}
                                      onChange={(e) => handleUpdateRule(rule.id, { pattern: e.target.value })}
                                      className={`w-full bg-slate-50/50 border ${
                                        isRegexError ? 'border-rose-400 focus:ring-rose-200 text-rose-700' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                                      } rounded-lg px-2.5 py-1 text-xs font-mono focus:ring-3 focus:outline-hidden`}
                                      placeholder={rule.matchMode === 'regex' ? '^М\\+\\s*' : 'М+'}
                                    />
                                    {isRegexError && (
                                      <span className="absolute right-2 top-1 text-[9px] text-rose-500 font-semibold bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                                        ошибка RegExp
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="md:col-span-5 flex flex-col gap-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Имя Paragraph Style в Affinity
                                </label>
                                <input
                                  type="text"
                                  value={rule.styleName}
                                  onChange={(e) => handleUpdateRule(rule.id, { styleName: e.target.value })}
                                  onBlur={(e) => handleUpdateRule(rule.id, { styleName: cleanStyleName(e.target.value) })}
                                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-400 focus:ring-blue-100 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:ring-3 focus:outline-hidden"
                                  placeholder="Character_M"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Section B: Character Styles */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-xs" />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Стили символов</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {inlineRules.length === 0 ? (
                      <div className="text-center py-5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-4">
                        <p className="text-slate-500 text-xs font-semibold">Нет активных стилей символов</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">Добавьте знаки-ограничители, чтобы выделять слова внутри строк конкретным Character Style</p>
                        <button
                          onClick={handleAddInlineRule}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-2 py-1 rounded-md transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Добавить стиль</span>
                        </button>
                      </div>
                    ) : (
                      inlineRules.map((rule, idx) => (
                        <div 
                          key={rule.id} 
                          className="bg-white border border-slate-200 hover:border-violet-200 hover:ring-2 hover:ring-violet-50/50 rounded-xl p-2.5 flex flex-col gap-2 relative transition-all shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getRuleColor(rule.styleName) }} />
                              Стиль символа #{idx + 1}
                            </span>
                            <button
                              onClick={() => handleDeleteInlineRule(rule.id)}
                              className="p-1 rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                              title="Удалить стиль символа"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                            <div className="md:col-span-5 flex flex-col gap-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Знаки-ограничители
                              </label>
                              <input
                                type="text"
                                value={rule.marker}
                                onChange={(e) => handleUpdateInlineRule(rule.id, { marker: e.target.value })}
                                className="w-full bg-slate-50/50 border border-slate-200 focus:border-violet-400 focus:ring-violet-100 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:ring-3 focus:outline-hidden text-slate-800"
                                placeholder="Например, **** или **"
                              />
                            </div>

                            <div className="md:col-span-7 flex flex-col gap-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Имя Character Style в Affinity
                              </label>
                              <input
                                type="text"
                                value={rule.styleName}
                                onChange={(e) => handleUpdateInlineRule(rule.id, { styleName: e.target.value })}
                                onBlur={(e) => handleUpdateInlineRule(rule.id, { styleName: cleanStyleName(e.target.value) })}
                                className="w-full bg-slate-50/50 border border-slate-200 focus:border-violet-400 focus:ring-violet-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-3 focus:outline-hidden"
                                placeholder="Например, Bold_Style"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Add rule footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-slate-700">Стилей абзацев: {rules.length}</span>
                  <span className="text-slate-300">|</span>
                  <span>Стилей символов: {inlineRules.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleAddRule}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                    title="Добавить новый маркер абзаца"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    <span>Стиль абзаца</span>
                  </button>
                  <button
                    onClick={handleAddInlineRule}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 border border-slate-200 hover:border-violet-200 bg-white px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                    title="Добавить новый стиль символа"
                  >
                    <Plus className="w-3.5 h-3.5 text-violet-500" />
                    <span>Стиль символа</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block В: Typograf */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col transition-all">
          <div className={`px-5 py-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isTypografRulesExpanded ? 'border-b border-slate-100' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
                <Wand2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-sm text-slate-800">Блок В: Типограф</h3>
                  <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {activeTypografRulesCount} из {availableTypografRules.length} правил
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">Правила Typograf для вёрстки текста</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 flex-wrap shrink-0">
              <label htmlFor="auto-typograf-toggle" className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium select-none bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  id="auto-typograf-toggle"
                  checked={autoApplyTypograf}
                  onChange={(e) => setAutoApplyTypograf(e.target.checked)}
                  className="w-3.5 h-3.5 accent-indigo-600 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                />
                <span>Автоматически применять типограф перед конвертацией в RTF</span>
              </label>

              <button
                onClick={() => setIsTypografRulesExpanded(prev => !prev)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 bg-white px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isTypografRulesExpanded ? 'Скрыть правила' : 'Показать правила'}</span>
                {isTypografRulesExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          {isTypografRulesExpanded && (
            <div className="p-5 flex flex-col gap-4">
              {/* Controls Bar: Search & Batch actions */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={typografSearch}
                    onChange={(e) => setTypografSearch(e.target.value)}
                    placeholder="Поиск правил (например: кавычки, тире, инициалы, №, %)..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-indigo-100 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-3 focus:outline-hidden transition-all"
                  />
                  {typografSearch && (
                    <button
                      onClick={() => setTypografSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleEnableAllTypografRules(filteredTypografRules)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2.5 py-2 rounded-xl font-medium transition-all cursor-pointer"
                    title="Включить все показанные правила"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Включить все ({filteredTypografRules.length})</span>
                  </button>

                  <button
                    onClick={() => handleDisableAllTypografRules(filteredTypografRules)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-2 rounded-xl font-medium transition-all cursor-pointer"
                    title="Выключить все показанные правила"
                  >
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Выключить все</span>
                  </button>

                  <button
                    onClick={handleResetTypografRules}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-xl font-medium transition-all cursor-pointer"
                    title="Сбросить все правила к стандартным настройкам"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Сбросить</span>
                  </button>
                </div>
              </div>

              {/* Group Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
                <button
                  onClick={() => setTypografGroupFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    typografGroupFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600'
                  }`}
                >
                  Все правила ({availableTypografRules.length})
                </button>
                {typografGroups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setTypografGroupFilter(g.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      typografGroupFilter === g.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {g.title} ({g.count})
                  </button>
                ))}
              </div>

              {/* Rules list grid */}
              {filteredTypografRules.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Правила не найдены</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredTypografRules.map(rule => {
                    const isEnabled = !!typografRuleStates[rule.id];
                    return (
                      <div
                        key={rule.id}
                        onClick={() => handleToggleTypografRule(rule.id)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none relative group ${
                          isEnabled
                            ? 'bg-indigo-50/40 border-indigo-200/80 hover:border-indigo-300 hover:bg-indigo-50/80 shadow-2xs'
                            : 'bg-slate-50/60 border-slate-200/60 opacity-65 hover:opacity-100 hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => {}}
                          className="w-4 h-4 accent-indigo-600 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500 cursor-pointer mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1">
                            <span className={`text-xs font-bold leading-snug ${isEnabled ? 'text-slate-900' : 'text-slate-600'}`}>
                              {rule.title}
                            </span>
                          </div>

                          {rule.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              {rule.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-1.5 mt-2 pt-1.5 border-t border-slate-100/80">
                            <span className="text-[10px] font-mono text-slate-400 truncate">
                              {rule.id}
                            </span>
                            <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50/80 border border-indigo-100/80 px-1.5 py-0.2 rounded-sm shrink-0">
                              {rule.groupTitle}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button Strip & Exports */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/30 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm text-white">Блок Г: Готово к импорту в Affinity</h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Экспортируемый RTF-файл содержит внедрённую таблицу стилей. Импортируя его через <b>File → Place</b>, все названия ваших стилей мгновенно определятся и создадутся в <b>Affinity</b>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleDownloadFile}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Конвертировать и скачать (.rtf)</span>
            </button>
          </div>
        </div>

        {/* Block Д: RTF Code Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col transition-all">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800">Блок Д: Предпросмотр кода RTF</h3>
                <p className="text-xs text-slate-500">Сгенерированная RTF-разметка с таблицей стилей и тегами абзацев</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 rounded-lg">
                {(new Blob([readableRTFContent]).size / 1024).toFixed(1)} КБ
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-[380px] overflow-y-auto selection:bg-emerald-500/30 selection:text-emerald-200">
            <pre className="whitespace-pre-wrap break-all text-emerald-400/90 font-mono">
              {readableRTFContent}
            </pre>
          </div>
        </div>

      </main>

      {/* Clear Rules Confirmation Dialog Modal */}
      {showClearRulesConfirm && (
        <ClearRulesModal 
          onClose={() => setShowClearRulesConfirm(false)}
          onRestoreDefaults={() => {
            setRules(DEFAULT_RULES);
            setInlineRules(DEFAULT_INLINE_RULES);
            setShowClearRulesConfirm(false);
            triggerToast('Правила сброшены к стандартным.');
          }}
          onClearAll={handleClearAllRules}
        />
      )}

      {/* Page Footer */}
      <footer className="mt-12 bg-slate-900 text-slate-400 py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-200 font-bold text-sm">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Аффинизатор текста от BATCOM</span>
            </div>
            <p className="text-slate-400 max-w-xl text-xs leading-relaxed">
              Веб-инструмент для подготовки текста к вёрстке в Affinity by Canva. Он превращает сырой черновик в оттипографленный RTF‑файл с уже размеченными стилями. Система сама распознаёт пользовательские маркеры, расставляет стили абзацев и символов, а встроенный Типограф доводит качество текста до идеала. Итоговый файл легко импортируется в проект, где автоматически создаются новые стили или подтягиваются существующие.
            </p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-2">
              <span>© 2026</span>
              <span>•</span>
              <a
                href="https://github.com/nik3elge/BATCOM-Text-Affinitizer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors underline decoration-slate-600 hover:decoration-slate-300"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub проекта</span>
              </a>
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5">
              <a
                href="https://github.com/nik3elge/BATCOM-Text-Affinitizer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm transition-all group cursor-pointer"
                title="Репозиторий на GitHub"
              >
                <Github className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-transform" />
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href="https://boosty.to/nananabatcom/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition-all group cursor-pointer"
                title="Поддержать проект на Boosty"
              >
                <BoostyIcon className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Поддержать на Boosty</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1.5 bg-slate-800/60 p-3 rounded-xl border border-slate-800 w-full">
              <span className="text-[11px] font-semibold text-slate-400">Использованные библиотеки:</span>
              <div className="flex items-center gap-3 text-[11px]">
                <a
                  href="https://github.com/typograf/typograf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200 font-medium transition-colors hover:underline"
                >
                  <span>Типограф</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
                <span className="text-slate-600">•</span>
                <a
                  href="https://github.com/e2yo/eyo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200 font-medium transition-colors hover:underline"
                >
                  <span>Ёфикатор (eyo)</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
