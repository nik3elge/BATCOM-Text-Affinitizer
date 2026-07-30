export interface MarkerRule {
  id: string;
  name: string;
  pattern: string;
  matchMode: 'starts-with' | 'regex';
  styleName: string;
}

export interface InlineRule {
  id: string;
  marker: string;
  styleName: string;
}

export interface IgnoreRule {
  id: string;
  pattern: string;
  matchMode: 'starts-with' | 'contains' | 'regex';
  enabled: boolean;
}

export interface ProcessedLine {
  id: string;
  styleName: string;
  text: string;
  originalText: string;
  matchedRuleId: string | null;
}

export interface Preset {
  id: string;
  name: string;
  rules: MarkerRule[];
  inlineRules: InlineRule[];
  defaultStyleName: string;
  ignoreEmptyLines?: boolean;
  ignoreRules?: IgnoreRule[];
}
