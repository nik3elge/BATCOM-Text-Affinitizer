<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3.0-38bdf8?logo=tailwindcss" alt="TailwindCSS"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-6.0-646cff?logo=vite" alt="Vite"></a>
  <a href="https://nik3elge.github.io/BATCOM-Text-Affinitizer"><img src="https://img.shields.io/badge/site-online-brightgreen" alt="site"></a>
  <a href="https://boosty.to/nananabatcom/donate"><img src="https://img.shields.io/badge/Boosty-BATCOM-orange?logo=boosty&logoColor=white" alt="Boosty"></a>
</p>

<h1 align="center">BATCOM Text Affinitizer</h1>

<p align="center">
  <b><a href="README.md">Русский</a> | English</b>
</p>

**A web tool designed to prepare text for typesetting in Affinity by Canva**. It transforms a raw draft into a properly formatted **RTF file** with mapped styles. The system automatically detects custom markers, assigns paragraph and character styles, while the built-in **typographer** ensures perfect typesetting. The resulting file imports seamlessly into your project, automatically creating new styles or matching existing ones.

---

## 🔍 About the Project

When moving text into **Affinity by Canva**, you no longer need to manually assign **Paragraph Styles** and **Character Styles**. The Text Affinitizer analyzes your source material: it detects predefined markers or regex patterns, cleans them from the text, and binds the appropriate styles to each segment.

At the same time, the built-in **typographer** elevates the typesetting quality—adding non-breaking spaces, applying correct quotes, and inserting proper dashes, with fully customizable rules. The output is a ready-to-use RTF file that imports into Affinity complete with a clean **style structure** and professional formatting.

---

## ✨ Key Features

#### 1. ¶ Automatic Paragraph Styling (Paragraph Styles)
- **Exact Markers (`^ Start`):** Recognizes line-start prefixes (e.g., `M+`, `System\`, `Batman:`).
- **Regular Expressions (`.* Regex`):** Flexible pattern matching (e.g., numbering `^\d+\.`, dialogues `^(Anna|Mark):`, ALL CAPS names `^[A-Z\s]+:`).
- **Marker Stripping:** Detected prefixes are automatically removed, leaving only clean text for your layout.
- **Default Style:** Lines with no matches are assigned a base style (`base`, `Normal`, or user-defined).

#### 2. ✍️ Inline Character Styling (Character Styles)
- **Delimiters:** Automatically highlights words and phrases using special characters (e.g., `**bold**`, `*italic*`, `==highlighted==`).
- **Style Mapping:** Converts delimited text directly into Affinity character styles.

#### 3. 🧹 Line Filtering and Exclusion
- **Empty Line Removal:** Automatically skips blank lines.
- **Service Line Ignorance:** Hides technical notes or comments starting with prefix characters (e.g., `#`, `//`, `=`).
- **Flexible Filters:** Filter out content by line prefixes, keywords, or custom regex.

#### 4. 🔠 Built-in Typographer (Typograf)
- **Automated Typesetting:** Replaces hyphens with em-dashes (—) in dialogues/ranges and applies proper quotation marks.
- **Smart Spacing:** Inserts non-breaking spaces to prevent orphaned words, numbers, and symbols at line breaks, while cleaning up duplicate spaces and improper punctuation.
- **Full Control:** Toggle individual typographic rules on or off based on your project needs.

#### 5. 💾 Import and Export
- **File Support:** Load `.txt` and `.rtf` scripts using simple Drag & Drop.
- **Preset Export/Import:** Backup and restore all style and filter configurations via `.json`.
- **Auto-save:** Text and settings instantly save to browser local storage (`localStorage`).

---

## 🛠 Tech Stack

* **Core:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Text Processing:**
  * [typograf](https://github.com/typograf/typograf) — Automated typographic formatting engine
  * [eyo-kernel](https://github.com/e2yo/eyo-kernel) — Russian letter "Ё" restoration module

---

## 📄 License

[MIT License](LICENSE.md)
