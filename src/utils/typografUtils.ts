import Typograf from 'typograf';
import { Eyo, safeDictionary } from 'eyo-kernel';

export interface TypografRuleItem {
  id: string;
  group: string;
  groupTitle: string;
  title: string;
  description: string;
  tooltip?: string;
  enabledByDefault: boolean;
}

// Global eyo & Typograf setup (run once at module level)
const eyoInstance = new Eyo();
eyoInstance.dictionary.set(safeDictionary);

if (!Typograf.getRules().some(r => r.name === 'ru/symbols/eyo')) {
  Typograf.addRule({
    name: 'ru/symbols/eyo',
    handler: function(text: string) {
      return eyoInstance.restore(text);
    }
  });
}

// Single reusable Typograf instance for optimal performance
const sharedTypograf = new Typograf({ locale: ['ru', 'en-US'] });

export const TYPOGRAF_RULE_DETAILS: Record<string, { title: string; description?: string; tooltip?: string }> = {
  // --- Кавычки ---
  'common/punctuation/quote': {
    title: 'Расстановка и вложенность кавычек («... „...“ ...»)',
    description: 'Преобразует прямые кавычки в типографские с учётом языка (для русского — внешние «ёлочки» и вложенные „лапки“) и автоматическим контролем уровня вложенности.'
  },

  // --- Тире ---
  'ru/dash/main': {
    title: 'Длинное тире в тексте (—)',
    description: 'Заменяет дефис с пробелами ("слово - слово") на длинное тире с неразрывным пробелом: "слово — слово".'
  },
  'ru/dash/directSpeech': {
    title: 'Тире в прямой речи и диалогах',
    description: 'Заменяет дефис в начале строки диалога на длинное тире: "- Привет!" → "— Привет!".'
  },
  'ru/dash/month': {
    title: 'Тире в диапазонах месяцев',
    description: 'Заменяет дефис между названиями месяцев на тире: "Январь - Февраль" → "Январь — Февраль".'
  },
  'ru/dash/time': {
    title: 'Тире в интервалах времени',
    description: 'Заменяет дефис в временных интервалах на тире: "10:00 - 18:00" → "10:00—18:00".'
  },
  'ru/dash/centuries': {
    title: 'Тире в диапазонах веков (I—XX вв.)',
    description: 'Заменяет дефис на тире в интервалах веков, записанных римскими цифрами.'
  },
  'ru/dash/daysMonth': {
    title: 'Тире в диапазонах дней месяца (1—5 мая)',
    description: 'Заменяет дефис на тире в числовых диапазонах дат.'
  },
  'ru/dash/de': {
    title: 'Дефис в частицах «де-» и «де»',
    description: 'Приводит частицы «де», «де-» к нормативному написанию.'
  },
  'ru/dash/decade': {
    title: 'Тире в диапазонах десятилетий (80—90-е)',
    description: 'Заменяет дефис на тире в интервалах лет и десятилетий.'
  },
  'ru/dash/izpod': {
    title: 'Дефис в предлоге «из-под»',
    description: 'Пишет предлог «из-под» через дефис.'
  },
  'ru/dash/izza': {
    title: 'Дефис в предлоге «из-за»',
    description: 'Пишет предлог «из-за» через дефис.'
  },
  'ru/dash/ka': {
    title: 'Дефис перед частицей «-ка»',
    description: 'Пишет частицу «-ка» через дефис (скажи-ка, смотри-ка).'
  },
  'ru/dash/koe': {
    title: 'Дефис после приставки «кое-»',
    description: 'Пишет приставку «кое-» («кой-») через дефис.'
  },
  'ru/dash/taki': {
    title: 'Дефис перед частицей «-таки»',
    description: 'Пишет частицу «-таки» через дефис после глаголов, наречий и частиц.'
  },
  'ru/dash/surname': {
    title: 'Дефис в двойных фамилиях',
    description: 'Приводит двойные фамилии и сложные названия к написанию через дефис.'
  },
  'ru/dash/weekday': {
    title: 'Тире в диапазонах дней недели',
    description: 'Заменяет дефис на тире в интервалах дней недели (понедельник — пятница).'
  },
  'ru/dash/kakto': {
    title: 'Дефис в слове «как-то»',
    description: 'Пишет «как-то» и союз «как-то» перед перечислением через дефис.'
  },
  'ru/dash/to': {
    title: 'Дефис с суффиксами «-то», «-либо», «-нибудь»',
    description: 'Присоединяет суффиксы «-то», «-либо», «-нибудь» через дефис.'
  },
  'ru/dash/years': {
    title: 'Тире в диапазонах лет (1941—1945 гг.)',
    description: 'Заменяет дефис на тире в цифровых интервалах лет.'
  },

  // --- Неразрывные пробелы ---
  'common/nbsp/afterShortWord': {
    title: 'Неразрывный пробел после любого короткого слова',
    description: 'Привязывает абсолютно любое короткое слово (до 2 символов) к следующему слову неразрывным пробелом, работая как универсальный алгоритмический фильтр вне зависимости от словарей.'
  },
  'common/nbsp/afterShortWordByList': {
    title: 'Неразрывный пробел после предлогов и союзов',
    description: 'Привязывает предлоги, союзы, частицы к следующим за ними словам (и он → и&nbsp;он), предотвращая появление висячих предлогов в конце строк.'
  },
  'ru/nbsp/initials': {
    title: 'Неразрывный пробел в инициалах',
    description: 'Предотвращает отрыв инициалов от фамилии при переносе строк: "А. С. Пушкин".'
  },
  'ru/nbsp/abbr': {
    title: 'Неразрывный пробел в сокращениях',
    description: 'Ставит неразрывные пробелы внутри устойчивых сокращений: "и т. д.", "и т. п.", "т. е.", "т. к.".'
  },
  'ru/nbsp/page': {
    title: 'Неразрывный пробел в номерах страниц',
    description: 'Привязывает сокращение "с." или "стр." к последующему номеру страницы неразрывным пробелом.'
  },
  'ru/nbsp/dayMonth': {
    title: 'Неразрывный пробел между датой и месяцем',
    description: 'Предотвращает перенос названия месяца на следующую строку без числа.'
  },
  'ru/nbsp/m': {
    title: 'Неразрывный пробел в единицах длины',
    description: 'Привязывает единицы измерения длины к числу: "100 км", "5 см".'
  },
  'ru/nbsp/rubleKopek': {
    title: 'Неразрывный пробел с денежными знаками и валютами',
    description: 'Привязывает знаки валют и слова "руб.", "коп." к сумме: "1000 руб.", "50 €".'
  },
  'ru/nbsp/year': {
    title: 'Неразрывный пробел в годах и веках',
    description: 'Привязывает число к сокращению года или века: "2026 г.", "XXI в.".'
  },
  'ru/nbsp/years': {
    title: 'Неразрывный пробел в диапазонах лет',
    description: 'Ставит неразрывные пробелы при указании диапазонов лет и веков.'
  },
  'ru/nbsp/ps': {
    title: 'Неразрывный пробел после постскриптума',
    description: 'Ставит неразрывный пробел после обозначений постскриптума (P. S., P.S., З.Ы.).'
  },
  'ru/nbsp/addr': {
    title: 'Неразрывный пробел в адресах',
    description: 'Привязывает сокращения "д.", "кв.", "ул.", "стр." к номерам: "д. 5, кв. 12".'
  },
  'ru/nbsp/see': {
    title: 'Неразрывный пробел после ссылки на рисунки и таблицы',
    description: 'Привязывает сокращения "см.", "ср.", "рис.", "табл." к последующему номеру.'
  },
  'common/nbsp/afterNumber': {
    title: 'Неразрывный пробел после числа',
    description: 'Привязывает числа (до 5 цифр) к следующему за ними слову (в 2026 году → в 2026&nbsp;году), предотвращая отрыв числительных от существительных.'
  },
  'ru/nbsp/afterNumberSign': {
    title: 'Узкий неразрывный пробел после знака №',
    description: 'Ставит узкий неразрывный пробел между значком № и числом.'
  },
  'common/nbsp/afterParagraphMark': {
    title: 'Неразрывный пробел после знака параграфа (¶)',
    description: 'Ставит неразрывный пробел после знака параграфа (¶ 12 → ¶&nbsp;12), чтобы символ не отрывался от номера статьи или пункта.'
  },
  'common/nbsp/afterSectionMark': {
    title: 'Узкий неразрывный пробел после секции (§)',
    description: 'Ставит узкий (в русской локали) или обычный неразрывный пробел после § перед арабскими и римскими цифрами (§ 12, § IV).'
  },
  'common/nbsp/beforeShortLastNumber': {
    title: 'Неразрывный пробел перед коротким числом',
    description: 'Привязывает короткие цифры и числа или цитаты (версия 2., страница 15) к предшествующему слову, предотвращая появление висячих чисел на новой строке.'
  },
  'common/nbsp/beforeShortLastWord': {
    title: 'Неразрывный пробел перед коротким словом',
    description: 'Привязывает короткое последнее слово предложений и абзацев (до 3 символов) к предыдущему слову (сказал он. → сказал&nbsp;он.), предотвращая появления висячих слов в конце строк.'
  },
  'common/nbsp/dpi': {
    title: 'Неразрывный пробел перед единицей dpi/lpi',
    description: 'Привязывает единицы измерения разрешения (dpi, lpi) к предшествующему числу.'
  },
  'common/nbsp/replaceNbsp': {
    title: 'Нормализация видов неразрывных пробелов',
    description: 'Заменяет нетипичные варианты неразрывных пробелов на стандартный символ &nbsp;.'
  },
  'ru/nbsp/centuries': {
    title: 'Неразрывный пробел с сокращением века (в., вв.)',
    description: 'Привязывает обозначение века «в.» или «вв.» к предшествующим цифрам.'
  },
  'ru/nbsp/mln': {
    title: 'Неразрывный пробел с «млн», «млрд», «тыс.»',
    description: 'Привязывает сокращения «млн», «млрд», «тыс.», «трлн» к числу.'
  },
  'ru/nbsp/ooo': {
    title: 'Неразрывный пробел в аббревиатурах (ООО, ОАО, ЗАО)',
    description: 'Ставит неразрывный пробел после аббревиатур форм собственности перед названием компании.'
  },
  'ru/nbsp/beforeParticle': {
    title: 'Неразрывный пробел перед частицами',
    description: 'Привязывает однобуквенные и двухбуквенные частицы «бы», «ли», «же» к предшествующему слову.'
  },

  // --- Пунктуация ---
  'ru/punctuation/exclamationQuestion': {
    title: 'Порядок знаков в «?!» (!? → ?!)',
    description: 'Исправление порядка знаков в вопросительно-восклицательных конструкциях (!? → ?!).'
  },
  'ru/punctuation/ano': {
    title: 'Запятая перед союзами «а» и «но»',
    description: 'Автоматическая расстановка отсутствующей запятой перед союзами «а» и «но» (слово а слово → слово, а слово).'
  },
  'common/punctuation/apostrophe': {
    title: 'Замена прямого апострофа на типографский (\' → ’)',
    description: 'Замена прямого (программистского) апострофа \' на типографский апостроф ’.'
  },
  'common/punctuation/hellip': {
    title: 'Многоточие из точек (... → …)',
    description: 'Заменяет три или четыре точки подряд на официальный символ многоточия (…).'
  },
  'ru/punctuation/hellipQuestion': {
    title: 'Сочетание многоточия с ? ! , («?…» → «?..»)',
    description: 'Исправляет сочетание многоточия со знаками препинания: «?…» → «?..», «!…» → «!..», а также удаляет лишнюю запятую после многоточия («…,» → «…»).'
  },

  // --- Пробелы ---
  'common/space/delBeforePunctuation': {
    title: 'Удаление пробела перед знаками препинания',
    description: 'Удаляет ошибочный пробел перед точкой, запятой, двоеточием или точкой с запятой.'
  },
  'common/space/delBeforeDot': {
    title: 'Удаление пробела перед точкой',
    description: 'Убирает ошибочный пробел непосредственно перед точкой.'
  },
  'common/space/afterComma': {
    title: 'Пробел после запятых',
    description: 'Добавляет отсутствующий пробел после запятых.'
  },
  'common/space/afterColon': {
    title: 'Пробел после двоеточия',
    description: 'Добавляет отсутствующий пробел после двоеточия.'
  },
  'common/space/afterQuestionMark': {
    title: 'Пробел после вопросительного знака',
    description: 'Добавляет отсутствующий пробел после вопросительного знака.'
  },
  'common/space/afterExclamationMark': {
    title: 'Пробел после восклицательного знака',
    description: 'Добавляет отсутствующий пробел после восклицательного знака.'
  },
  'common/space/afterSemicolon': {
    title: 'Пробел после точки с запятой',
    description: 'Добавляет отсутствующий пробел после точки с запятой.'
  },
  'common/space/beforeBracket': {
    title: 'Пробел перед открывающей скобкой',
    description: 'Добавляет отсутствующий пробел перед открывающей скобкой.'
  },
  'common/space/delLeadingBlanks': {
    title: 'Удаление пробелов в начале каждой строки',
    description: 'Удаляет начальные пробелы и табуляции перед текстом на всех строках документа.'
  },
  'common/space/delTrailingBlanks': {
    title: 'Удаление пробелов в конце каждой строки',
    description: 'Удаляет висячие пробелы и табуляции в конце каждой строки перед переносом.'
  },
  'common/space/delBetweenExclamationMarks': {
    title: 'Удаление пробелов между «!» и «?»',
    description: 'Удаляет пробелы между восклицательными и вопросительными знаками препинания.'
  },
  'common/space/insertFinalNewline': {
    title: 'Перевод строки в конце текста',
    description: 'Гарантирует наличие символа переноса строки в самом конце текста.'
  },
  'ru/space/afterHellip': {
    title: 'Пробел после многоточия',
    description: 'Добавляет отсутствующий пробел после многоточия.'
  },
  'ru/space/year': {
    title: 'Пробел перед «г.» и «гг.»',
    description: 'Добавляет отсутствующий пробел перед обозначениями «г.», «гг.», «в.», «вв.».'
  },
  'common/space/trimRight': {
    title: 'Удаление пробелов в самом конце текста',
    description: 'Удаляет пробелы и переводы строк в самом конце документа (только после последней строки).'
  },
  'common/space/trimLeft': {
    title: 'Удаление пробелов в самом начале текста',
    description: 'Удаляет пробелы и переводы строк в самом начале документа (только перед первой строкой).'
  },
  'common/space/squareBracket': {
    title: 'Пробелы внутри квадратных скобок',
    description: 'Убирает пробелы с внутренней стороны квадратных скобок: "[ текст ]" → "[текст]".'
  },
  'common/space/delBeforePercent': {
    title: 'Удаление пробела перед процентом (%)',
    description: 'Убирает пробел между числом и знаком процента: "100 %" → "100%".'
  },
  'common/space/delRepeatSpace': {
    title: 'Удаление повторяющихся обычных пробелов',
    description: 'Заменяет два и более обычных пробелов подряд на один одиночный пробел.'
  },
  'common/space/bracket': {
    title: 'Пробелы около скобок',
    description: 'Очистка пробелов внутри ( скобок ) и добавление снаружи.'
  },
  'common/space/replaceTab': {
    title: 'Замена табуляций на пробелы',
    description: 'Преобразование символов табуляции в стандартные пробелы.'
  },

  // --- Знаки и символы ---
  'ru/symbols/eyo': {
    title: 'Расстановка буквы «ё» (Ёфикатор)',
    description: 'Автоматически восстанавливает букву «ё» в словах с однозначной ёфикацией (ёлка, ёжик, ещё, зелёная).'
  },
  'common/symbols/arrow': {
    title: 'Замена текстовых стрелок (->, <-, =>)',
    description: 'Заменяет комбинации "->", "<-", "=>", "<=" на графические стрелки: →, ←, ⇒, ⇐.'
  },
  'common/symbols/cf': {
    title: 'Градусы Цельсия и Фаренгейта (°C, °F)',
    description: 'Форматирует знаки градусов: "25 C" → "25 °C".'
  },
  'common/symbols/copy': {
    title: 'Знаки авторского права и марок (©, ®, ™)',
    description: 'Преобразует текстовые сочетания "(c)", "(r)", "(tm)" в типографские символы ©, ®, ™.'
  },

  // --- Числа и математика ---
  'common/number/digitGrouping': {
    title: 'Группировка разрядов в числах',
    description: 'Разделение тысяч и миллионов пробелами (10 000).'
  },
  'ru/number/ordinals': {
    title: 'Наращения порядковых числительных (1-й, 2-я)',
    description: 'Форматирует окончания порядковых числительных: "1-й", "2-я", "3-е".'
  },
  'ru/number/comma': {
    title: 'Запятая в десятичных дробях (1,5 %)',
    description: 'Замена точки на запятую в десятичных дробях перед единицами и знаками (1.5 % → 1,5 %).'
  },
  'ru/other/accent': {
    title: 'Знак ударения',
    description: 'Преобразование заглавной буквы внутри слова в знак ударения (замо́к).'
  },
  'common/other/delBOM': {
    title: 'Удаление невидимого символа BOM',
    description: 'Удаляет невидимый байтовый маркер UTF-8 (BOM), предотвращая скрытые сбои и ошибки верстки.'
  },
  'common/other/repeatWord': {
    title: 'Удаление повторов слов',
    description: 'Устранение случайно продублированных подряд слов («он он пошел» → «он пошел»).'
  }
};

let cachedRules: TypografRuleItem[] | null = null;

export const getAvailableTypografRules = (): TypografRuleItem[] => {
  if (cachedRules) return cachedRules;
  try {
    const rules = Typograf.getRules();
    const groupsMap: Record<string, string> = {
      quote: 'Кавычки',
      dash: 'Тире и дефисы',
      nbsp: 'Неразрывные пробелы',
      punctuation: 'Пунктуация',
      symbols: 'Символы',
      number: 'Числа',
      space: 'Пробелы',
      money: 'Валюта',
      other: 'Прочие правила',
    };

    if (Array.isArray(Typograf.groups)) {
      Typograf.groups.forEach(g => {
        if (g.name && g.title && g.title.ru) {
          groupsMap[g.name] = g.title.ru;
        }
      });
    }
    groupsMap['dash'] = 'Тире и дефисы';
    groupsMap['symbols'] = 'Символы';
    groupsMap['number'] = 'Числа';

    cachedRules = rules
      .filter(r => (r.locale === 'ru' || r.locale === 'common') && 
        !r.name.startsWith('common/html/') && 
        !r.name.startsWith('html/') && 
        r.group !== 'html' &&
        !r.name.startsWith('ru/date/') &&
        !r.name.startsWith('date/') &&
        r.group !== 'date' &&
        !r.name.startsWith('ru/typo/') &&
        !r.name.startsWith('typo/') &&
        r.group !== 'typo' &&
        !r.name.startsWith('ru/money/') &&
        !r.name.startsWith('money/') &&
        r.group !== 'money' &&
        !r.name.startsWith('ru/optalign/') &&
        !r.name.startsWith('common/optalign/') &&
        !r.name.startsWith('optalign/') &&
        r.group !== 'optalign' &&
        !r.name.includes('phone') &&
        r.name !== 'ru/symbols/NN' &&
        !r.name.endsWith('/NN') &&
        r.name !== 'common/number/fraction' &&
        !r.name.endsWith('/number/fraction') &&
        r.name !== 'common/number/mathSigns' &&
        !r.name.endsWith('/number/mathSigns') &&
        r.name !== 'common/number/times' &&
        !r.name.endsWith('/number/times') &&
        r.name !== 'common/punctuation/delDoublePunctuation' &&
        !r.name.endsWith('/punctuation/delDoublePunctuation') &&
        r.name !== 'common/punctuation/quoteLink' &&
        !r.name.endsWith('/punctuation/quoteLink') &&
        r.name !== 'ru/punctuation/exclamation' &&
        !r.name.endsWith('/punctuation/exclamation') &&
        r.name !== 'common/space/delRepeatN' &&
        !r.name.endsWith('/space/delRepeatN') &&
        r.name !== 'common/nbsp/nowrap' &&
        !r.name.endsWith('/nbsp/nowrap')
      )
      .map(r => {
        const detail = TYPOGRAF_RULE_DETAILS[r.name];
        const gTitle = groupsMap[r.group] || r.group;
        
        let title = detail?.title;
        let description = detail?.description || '';
        let tooltip = detail?.tooltip || '';

        if (!title) {
          const rawRuTitle = Typograf.titles?.[r.name]?.ru || r.shortName || r.name;
          title = rawRuTitle;
        }

        if (!description) {
          if (r.name.includes('nbsp')) {
            description = 'Привязка неразрывным пробелом для предотвращения висячих символов';
          } else if (r.name.includes('dash')) {
            description = 'Автоматическая замена дефисов на правильное тире в соответствующем контексте';
          } else if (r.name.includes('quote')) {
            description = 'Приведение кавычек к аккуратному типографскому виду';
          } else if (r.name.includes('space')) {
            description = 'Удаление лишних и добавление пропущенных пробелов';
          } else if (r.name.includes('punctuation')) {
            description = 'Коррекция знаков препинания и устранение опечаток';
          } else if (r.name.includes('symbol')) {
            description = 'Замена текстовых символов на аккуратные графические знаки';
          } else if (r.name.includes('number')) {
            description = 'Правильное форматирование чисел, разрядов и математических выражений';
          } else {
            description = 'Автоматическая корректировка и повышение качества оформления текста';
          }
        }

        const isEnabledByDefault = 
          r.name === 'common/number/digitGrouping' ||
          r.name.endsWith('/number/digitGrouping') ||
          r.name === 'common/nbsp/afterNumber' ||
          r.name.endsWith('/nbsp/afterNumber') ||
          r.name === 'ru/symbols/eyo' ||
          r.name.endsWith('/symbols/eyo');

        const isDisabledByDefault = 
          r.name === 'common/symbols/arrow' ||
          r.name === 'common/symbols/cf' ||
          r.name === 'common/symbols/copy' ||
          r.name === 'common/punctuation/quote' ||
          r.name === 'common/punctuation/apostrophe' ||
          r.name === 'common/space/replaceTab' ||
          r.name.endsWith('/symbols/arrow') ||
          r.name.endsWith('/symbols/cf') ||
          r.name.endsWith('/symbols/copy') ||
          r.name.endsWith('/punctuation/quote') ||
          r.name.endsWith('/punctuation/apostrophe') ||
          r.name.endsWith('/space/replaceTab');

        return {
          id: r.name,
          group: r.group || 'other',
          groupTitle: gTitle,
          title,
          description,
          tooltip,
          enabledByDefault: isEnabledByDefault ? true : (isDisabledByDefault ? false : r.enabled !== false)
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    return cachedRules;
  } catch (e) {
    console.error('Error fetching Typograf rules:', e);
    return [];
  }
};

export const applyTypograf = (text: string, ruleStates: Record<string, boolean>): string => {
  if (!text) return text;
  try {
    // Disable rules that should never run
    sharedTypograf.disableRule('common/html/*');
    sharedTypograf.disableRule('html/*');
    sharedTypograf.disableRule('ru/date/*');
    sharedTypograf.disableRule('date/*');
    sharedTypograf.disableRule('ru/typo/*');
    sharedTypograf.disableRule('typo/*');
    sharedTypograf.disableRule('ru/money/*');
    sharedTypograf.disableRule('money/*');
    sharedTypograf.disableRule('ru/optalign/*');
    sharedTypograf.disableRule('common/optalign/*');
    sharedTypograf.disableRule('optalign/*');
    sharedTypograf.disableRule('ru/other/phone-number');
    sharedTypograf.disableRule('ru/other/phone');
    sharedTypograf.disableRule('ru/symbols/NN');
    sharedTypograf.disableRule('common/number/fraction');
    sharedTypograf.disableRule('common/number/mathSigns');
    sharedTypograf.disableRule('common/number/times');
    sharedTypograf.disableRule('common/punctuation/delDoublePunctuation');
    sharedTypograf.disableRule('common/punctuation/quoteLink');
    sharedTypograf.disableRule('ru/punctuation/exclamation');
    sharedTypograf.disableRule('common/space/delRepeatN');
    sharedTypograf.disableRule('common/nbsp/nowrap');

    Object.entries(ruleStates).forEach(([ruleId, isEnabled]) => {
      if (isEnabled) {
        sharedTypograf.enableRule(ruleId);
      } else {
        sharedTypograf.disableRule(ruleId);
      }
    });

    return sharedTypograf.execute(text);
  } catch (e) {
    console.error('Typograf execution error:', e);
    return text;
  }
};
