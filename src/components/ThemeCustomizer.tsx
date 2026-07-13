import React, { useState } from "react";
import { ThemeConfig, DEFAULT_THEME_COLORS } from "../types";
import { Sparkles, Palette, Type, Layout, Sliders, RefreshCw } from "lucide-react";

interface ThemeCustomizerProps {
  config: ThemeConfig;
  templateId: string;
  onChangeTheme: (config: ThemeConfig) => void;
  onChangeTemplate: (templateId: string) => void;
}

const PRESET_PALETTES = [
  {
    name: "Midnight Corporate",
    primary: "#1e3a8a",
    secondary: "#475569",
    accent: "#3b82f6",
    background: "#ffffff",
    textPrimary: "#111827",
    textSecondary: "#4b5563",
    border: "#e2e8f0",
  },
  {
    name: "Emerald Professional",
    primary: "#065f46",
    secondary: "#374151",
    accent: "#10b981",
    background: "#ffffff",
    textPrimary: "#111827",
    textSecondary: "#4b5563",
    border: "#e5e7eb",
  },
  {
    name: "Creative Plum",
    primary: "#581c87",
    secondary: "#4b5563",
    accent: "#ec4899",
    background: "#ffffff",
    textPrimary: "#111827",
    textSecondary: "#4b5563",
    border: "#f1f5f9",
  },
  {
    name: "Tech Slate (Dark)",
    primary: "#3b82f6",
    secondary: "#94a3b8",
    accent: "#10b981",
    background: "#0f172a",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    border: "#334155",
  },
  {
    name: "Minimalist Sand",
    primary: "#78350f",
    secondary: "#78716c",
    accent: "#d97706",
    background: "#fffbeb",
    textPrimary: "#292524",
    textSecondary: "#57534e",
    border: "#e7e5e4",
  }
];

export default function ThemeCustomizer({
  config,
  templateId,
  onChangeTheme,
  onChangeTemplate,
}: ThemeCustomizerProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Trigger Gemini AI custom theme builder
  const handleAiThemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setAiLoading(true);
    setAiMessage(null);

    try {
      const response = await fetch("/api/ai/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const data = await response.json();
      
      if (data.success && data.themeConfig) {
        onChangeTheme(data.themeConfig);
        if (data.themeConfig.layoutStyle) {
          onChangeTemplate(data.themeConfig.layoutStyle);
        }
        setAiMessage(data.themeConfig.customStylingTips || "AI Theme applied successfully!");
      } else {
        alert(data.error || "Failed to generate custom theme.");
      }
    } catch (err) {
      console.error(err);
      alert("Error building custom theme. Check your GEMINI_API_KEY.");
    } finally {
      setAiLoading(false);
    }
  };

  const handlePresetSelect = (palette: typeof PRESET_PALETTES[0]) => {
    onChangeTheme({
      ...config,
      colors: {
        primary: palette.primary,
        secondary: palette.secondary,
        accent: palette.accent,
        background: palette.background,
        textPrimary: palette.textPrimary,
        textSecondary: palette.textSecondary,
        border: palette.border,
      }
    });
  };

  return (
    <div className="space-y-5 bg-white border border-slate-200 rounded p-5 select-none">
      
      {/* 1. Template Layout Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Layout size={12} className="text-slate-400" />
          Template Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "modern", name: "Modern Band", desc: "Top highlights banner" },
            { id: "classic", name: "Classic Centered", desc: "Academic layout" },
            { id: "sidebar", name: "Split Sidebar", desc: "Double column profile" },
            { id: "minimal", name: "Sleek Minimal", desc: "Crisp airy columns" },
          ].map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onChangeTemplate(tpl.id)}
              className={`p-3 text-left rounded border text-xs font-semibold transition-all cursor-pointer ${
                templateId === tpl.id 
                  ? "border-black bg-white text-black ring-0 shadow-xs" 
                  : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50"
              }`}
              id={`template-select-${tpl.id}`}
            >
              <div className="font-bold">{tpl.name}</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">{tpl.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. AI Custom Vibe Prompter */}
      <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
            <Sparkles size={12} className="text-black animate-pulse" />
            Visual Engine
          </label>
          {aiLoading && <RefreshCw size={11} className="text-black animate-spin" />}
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
          "Design a warm, sand-toned aesthetic with bold serif headers and wide margins..."
        </p>
        
        <form onSubmit={handleAiThemeSubmit} className="flex">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={aiLoading}
            placeholder="Describe your theme..."
            className="flex-1 px-3 py-1.5 border border-slate-300 bg-white rounded-l text-[10px] text-gray-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiPrompt.trim()}
            className="px-3 bg-black hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-r text-[10px] transition-all flex items-center justify-center cursor-pointer"
            id="ai-theme-submit-btn"
          >
            <Sparkles size={11} />
          </button>
        </form>

        {aiMessage && (
          <div className="p-2 bg-slate-100 text-slate-700 rounded text-[10px] leading-relaxed border border-slate-200">
            <span className="font-bold">Vibe Summary:</span> {aiMessage}
          </div>
        )}
      </div>

      {/* 3. Theme Colors Presets */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Palette size={12} className="text-slate-400" />
          Color Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PALETTES.map((pal, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(pal)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold cursor-pointer transition-all"
              id={`preset-palette-${idx}`}
            >
              <div className="flex gap-0.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: pal.primary }}></span>
                <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: pal.background }}></span>
              </div>
              <span className="text-[10px] text-slate-600 font-medium">{pal.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Details Tweaker (Fonts, Size, Spacing) */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        
        {/* Colors Fine-Tuner */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase">Primary Accent</label>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="color"
                value={config.colors.primary}
                onChange={(e) => onChangeTheme({
                  ...config,
                  colors: { ...config.colors, primary: e.target.value }
                })}
                className="w-8 h-8 rounded-lg border cursor-pointer shrink-0"
              />
              <span className="text-[10px] font-mono text-gray-500 shrink-0 uppercase">{config.colors.primary}</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase">Secondary Accent</label>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="color"
                value={config.colors.secondary}
                onChange={(e) => onChangeTheme({
                  ...config,
                  colors: { ...config.colors, secondary: e.target.value }
                })}
                className="w-8 h-8 rounded-lg border cursor-pointer shrink-0"
              />
              <span className="text-[10px] font-mono text-gray-500 shrink-0 uppercase">{config.colors.secondary}</span>
            </div>
          </div>
        </div>

        {/* Fonts Fine-Tuner */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Body Font</label>
            <select
              value={config.fontSans}
              onChange={(e) => onChangeTheme({ ...config, fontSans: e.target.value })}
              className="w-full p-1.5 border rounded-lg text-xs text-gray-900 bg-white"
            >
              <option value="Inter">Inter (Clean UI)</option>
              <option value="Outfit">Outfit (Modern Tech)</option>
              <option value="Plus Jakarta Sans">Jakarta Sans</option>
              <option value="Lora">Lora (Elegant Serif)</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Display Font</label>
            <select
              value={config.fontDisplay}
              onChange={(e) => onChangeTheme({ ...config, fontDisplay: e.target.value })}
              className="w-full p-1.5 border rounded-lg text-xs text-gray-900 bg-white"
            >
              <option value="Inter">Inter (Sans)</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="Playfair Display">Playfair (Serif)</option>
              <option value="Lora">Lora (Serif)</option>
              <option value="Outfit">Outfit (Clean)</option>
            </select>
          </div>
        </div>

        {/* Sizes and Spacing slider / switches */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Text Scale</label>
            <div className="flex bg-slate-50 p-0.5 rounded border border-slate-200">
              {(["sm", "base", "lg"] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onChangeTheme({ ...config, fontSize: sz })}
                  className={`flex-1 py-1 text-center text-[10px] uppercase font-bold rounded-sm transition-all cursor-pointer ${
                    config.fontSize === sz ? "bg-black text-white shadow-xs" : "text-slate-500 hover:text-black"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Margin Air</label>
            <div className="flex bg-slate-50 p-0.5 rounded border border-slate-200">
              {(["compact", "normal", "relaxed"] as const).map((sp) => (
                <button
                  key={sp}
                  onClick={() => onChangeTheme({ ...config, spacing: sp })}
                  className={`flex-1 py-1 text-center text-[10px] uppercase font-bold rounded-sm transition-all cursor-pointer ${
                    config.spacing === sp ? "bg-black text-white shadow-xs" : "text-slate-500 hover:text-black"
                  }`}
                >
                  {sp.substring(0, 4)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Standard Page Size Selection */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Standard Document Page Size</label>
          <div className="flex bg-slate-50 p-0.5 rounded border border-slate-200">
            {(["A4", "A3", "B3", "B4", "Letter", "Legal"] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => onChangeTheme({ ...config, pageSize: sz })}
                className={`flex-1 py-1.5 text-center text-[10px] uppercase font-bold rounded-sm transition-all cursor-pointer ${
                  (config.pageSize === sz) || (!config.pageSize && sz === "A4") ? "bg-black text-white shadow-xs" : "text-slate-500 hover:text-black"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
