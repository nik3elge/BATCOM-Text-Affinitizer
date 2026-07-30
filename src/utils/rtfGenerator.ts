import { MarkerRule, InlineRule, ProcessedLine } from '../types';
import { RANDOM_COLORS } from '../constants/defaults';

// Helper to assign consistent preview colors deterministically based on styleName
export const getRuleColor = (styleName: string): string => {
  let hash = 0;
  for (let i = 0; i < styleName.length; i++) {
    hash = styleName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % RANDOM_COLORS.length;
  return RANDOM_COLORS[index];
};

export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Clean a style name input to ensure it is valid for CSS and Affinity Publisher style mapping
export const cleanStyleName = (name: string): string => {
  let clean = name
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace unsupported characters with underscore
    .replace(/^[^a-zA-Z]+/g, '');     // CSS classes shouldn't start with numbers or dashes
  
  if (!clean) {
    clean = 'Style_' + Math.floor(Math.random() * 1000);
  }
  return clean;
};

// Simple helper to parse custom inline character style markers to HTML spans
export const parseInlineStylesToHTML = (text: string, inlineRules: InlineRule[], lang?: string): string => {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (!inlineRules || inlineRules.length === 0) return html;

  const sortedRules = [...inlineRules].sort((a, b) => b.marker.length - a.marker.length);

  sortedRules.forEach(rule => {
    if (!rule.marker.trim() || !rule.styleName.trim()) return;
    try {
      const escapedMarker = escapeRegExp(rule.marker);
      const regex = new RegExp(`${escapedMarker}(.+?)${escapedMarker}`, 'g');
      const color = getRuleColor(rule.styleName);
      const titlePrefix = lang === 'en' ? 'Character Style:' : 'Стиль символа:';
      html = html.replace(regex, (_, content) => {
        return `<span class="inline-style-${rule.styleName} font-semibold transition-all duration-150 px-1 rounded-md bg-slate-50 border-b-2" style="color: ${color}; border-color: ${color};" title="${titlePrefix} ${rule.styleName}">${content}</span>`;
      });
    } catch (e) {
      console.error(e);
    }
  });

  return html;
};

export const generateCSS = (rules: MarkerRule[], defaultStyleName: string): string => {
  let css = `/* CSS Stylesheet mapping for Affinity Publisher Styles */\n`;
  const defaultStyle = defaultStyleName.trim() || 'base';
  css += `p.${defaultStyle} {\n  font-family: Georgia, serif;\n  font-size: 15px;\n  color: #1e293b;\n  line-height: 1.6;\n  margin-top: 0px;\n  margin-bottom: 12px;\n}\n`;
  
  rules.forEach(rule => {
    const color = getRuleColor(rule.styleName);
    css += `p.${rule.styleName} {\n`;
    css += `  color: ${color};\n`;
    css += `  font-family: system-ui, -apple-system, sans-serif;\n`;
    css += `  font-size: 15px;\n`;
    css += `  line-height: 1.6;\n`;
    css += `  margin-top: 0px;\n`;
    css += `  margin-bottom: 12px;\n`;
    css += `}\n`;
  });

  return css;
};

export const generateRTFString = (
  processedLines: ProcessedLine[],
  rules: MarkerRule[],
  inlineRules: InlineRule[],
  defaultStyleName: string,
  encodeUnicode: boolean
): string => {
  const escapeRTFText = (text: string): string => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = text.charCodeAt(i);
      if (char === '\\') {
        result += '\\\\';
      } else if (char === '{') {
        result += '\\{';
      } else if (char === '}') {
        result += '\\}';
      } else if (encodeUnicode && code > 127) {
        result += `\\u${code}?`;
      } else {
        result += char;
      }
    }
    return result;
  };

  let rtf = '{\\rtf1\\ansi\\ansicpg1251\\deff0\\deflang1049\n';
  rtf += '{\\fonttbl{\\f0\\froman\\fcharset204 Georgia;}{\\f1\\fswiss\\fcharset204 Arial;}}\n';
  
  // Color table
  let colorTable = '{\\colortbl ;\\red30\\green41\\blue59;';
  const colorIndices: Record<string, number> = {};
  rules.forEach((rule, idx) => {
    const colorHex = getRuleColor(rule.styleName);
    const r = parseInt(colorHex.slice(1, 3), 16) || 0;
    const g = parseInt(colorHex.slice(3, 5), 16) || 0;
    const b = parseInt(colorHex.slice(5, 7), 16) || 0;
    colorTable += `\\red${r}\\green${g}\\blue${b};`;
    colorIndices[rule.id] = idx + 2;
  });
  colorTable += '}\n';
  rtf += colorTable;

  // Stylesheet table mapping to Affinity Publisher Paragraph & Character Styles
  const defaultStyle = defaultStyleName.trim() || 'base';
  rtf += '{\\stylesheet\n';
  rtf += `{\\s0\\f0\\fs24\\cf1\\snext0 ${defaultStyle};}\n`;
  rules.forEach((rule, idx) => {
    const styleIdx = idx + 1;
    const colIdx = colorIndices[rule.id] || 1;
    rtf += `{\\s${styleIdx}\\sbasedon0\\cf${colIdx}\\snext${styleIdx} ${rule.styleName};}\n`;
  });
  inlineRules.forEach((rule, idx) => {
    const charStyleIdx = 101 + idx;
    rtf += `{\\*\\cs${charStyleIdx}\\additive\\sbasedon0 ${rule.styleName};}\n`;
  });
  rtf += '}\n';

  // Precompile inline rules regexes
  const sortedInlineRules = [...inlineRules]
    .filter(rule => rule.marker.trim() && rule.styleName.trim())
    .sort((a, b) => b.marker.length - a.marker.length)
    .map(rule => {
      const originalIdx = inlineRules.findIndex(ir => ir.id === rule.id);
      return {
        charStyleIdx: 101 + originalIdx,
        regex: new RegExp(`${escapeRegExp(rule.marker)}(.+?)${escapeRegExp(rule.marker)}`, 'g')
      };
    });

  // RTF Document body
  processedLines.forEach(line => {
    let styleIdx = 0;
    if (line.matchedRuleId) {
      const rIdx = rules.findIndex(r => r.id === line.matchedRuleId);
      if (rIdx !== -1) {
        styleIdx = rIdx + 1;
      }
    }

    let rtfInline = escapeRTFText(line.text);

    sortedInlineRules.forEach(({ charStyleIdx, regex }) => {
      rtfInline = rtfInline.replace(regex, `{\\cs${charStyleIdx} $1}`);
    });

    rtf += `\\pard\\plain\\s${styleIdx} ${rtfInline}\\par\n`;
  });

  rtf += '}';
  return rtf;
};
