# Professional AI Resume Builder & Creator

An elite, full-stack interactive resume builder designed to craft visually stunning, applicant-tracking-system (ATS) optimized, and executive-ready professional resumes. Fully integrated with the Google Gemini 3.5 API to offer intelligent layout recommendations, custom aesthetic vibes, interactive accomplishment polishing, and dynamic industry-specific skill suggestions.

## 🚀 Key Features

### 🎨 AI-Powered Visual Engine
- **Describe Your Vibe**: Type natural-language styling guidelines (e.g., *"Design a warm, sand-toned aesthetic with bold serif headers and wide margins"* or *"Elegant editorial in soft sage green"*), and watch Gemini transform your document's fonts, color palettes, spacing, and rhythm.
- **Color Presets & Themes**: Switch instantly between pre-curated designer palettes (Warm Terracotta, Slate Minimalist, Emerald Executive, Cyberpunk Slate).
- **Template Layout Selector**: Select different structural configurations (Minimalist Clean, Modern Sidebar, Executive Double Column, or Editorial Classic).

### ✍️ Intelligent Content Optimization
- **AI Skill Assistant**: Generates highly targeted, role-specific professional skill groups (e.g., frameworks, programming languages, core capabilities) dynamically aligned with your typed Job Title using sRGB/JSON structured output.
- **Accomplishment Bullet Point Polisher**: Polish raw drafts of professional experience or achievements into punchy, executive-level, action-oriented, result-driven accomplishment bullets.
- **Real-Time Character Counters**: Built-in limits and tips for Summary (Recommend < 300 chars) and Accomplishment Bullets (Recommend < 150 chars) to prevent over-crowded layouts.

### 🖨️ Production-Ready Export & Paper Sizes
- **Dedicated Print View**: Access a specialized "Print Mode" toolbar that strips away all UI chrome, sidebars, and dashboard control panel modules for local browser printing or physical paper delivery.
- **Multiple Paper Formats**: Supports standard paper layouts such as **A4, A3, B3, B4, Letter, and Legal** instantly responsive in the preview canvas.
- **PDF Vector Engine**: Uses client-side vector-scaling screenshot modules resolving modern CSS variables, including OKLCH functions, safely to high-resolution standard RGB formats.

---

## 🛠️ Architecture & Tech Stack

- **Client**: React (Vite, TypeScript), Tailwind CSS, Framer Motion (for physics-based responsive UI transitions).
- **Server**: Express (TypeScript/tsx), bundling to standalone CommonJS via esbuild for fast Cloud Run containers.
- **AI Integration**: Official `@google/genai` TypeScript SDK referencing the modern `gemini-3.5-flash` model.
- **Database**: Google Firebase Cloud Firestore and Authentication for secure cross-device synchronization.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Server Secret Configuration
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=3000
```

### 3. Installation & Booting
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 📦 Production Deployment (Cloud Run / VPS)
The server compiles down to a clean, bundled standalone target file using esbuild.

```bash
# Build production client and backend
npm run build

# Start production server
npm run start
```
This serves the React application directly via Express static file serving, proxying Gemini API calls safely on the backend to keep keys secure.

---

## 📄 License
MIT License.
