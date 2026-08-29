<div align="center">

<b><a href="README.md">Русский</a> | English</b>

[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=flat-square&logo=vite)](https://vite.dev/)
[![Site](https://img.shields.io/badge/site-online-brightgreen?style=flat-square)](https://nik3elge.github.io/BATCOM-Text-Affinitizer)
[![Integration](https://img.shields.io/badge/Affinity-by%20Canva-bbee81?style=flat-square)](https://affinity.serif.com/)
[![Boosty](https://img.shields.io/badge/Boosty-BATCOM-orange?style=flat-square&logo=boosty&logoColor=white)](https://boosty.to/nananabatcom/donate)

# Text Affinitizer by BATCOM

</div>

A web tool for preparing text for layout in **Affinity by Canva**. It transforms a raw drafts into a properly formatted **RTF file** with tagged styles. The system auto-detects user markers, applies paragraph and character styles, and built-in typography features ensure polished output. The final file imports effortlessly, automatically generating new styles or linking to existing ones.

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
- **Inline Text Markup:** Detects custom delimiter symbols (e.g., `**bold**`, `*italic*`, `==highlighted==`) within sentences.
- **Style Mapping:** Instantly converts the marked text into corresponding Affinity character styles while removing the raw delimiters.

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

---

## 📄 License

[MIT License](LICENSE.md)
