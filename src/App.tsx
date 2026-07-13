import React, { useState } from "react";
import { ResumeData, SAMPLE_RESUME, ThemeConfig } from "./types";

// Components
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import ThemeCustomizer from "./components/ThemeCustomizer";

// Icons
import { 
  Download, Plus, Trash2, ZoomIn, ZoomOut, 
  Eye, Settings, Palette, FileText,
  RefreshCw
} from "lucide-react";

// jsPDF / html2canvas imports
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function App() {
  // Resume states
  const [activeResume, setActiveResume] = useState<ResumeData>(() => {
    const saved = localStorage.getItem("active_resume");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local active resume, loading default");
      }
    }
    return { ...SAMPLE_RESUME, id: `resume-${Date.now()}` };
  });

  const [resumesList, setResumesList] = useState<ResumeData[]>(() => {
    const savedList = localStorage.getItem("local_resumes_list");
    if (savedList) {
      try {
        return JSON.parse(savedList);
      } catch (e) {
        console.error("Failed to parse saved resumes list");
      }
    }
    // Default fallback list
    const active = localStorage.getItem("active_resume");
    if (active) {
      try {
        return [JSON.parse(active)];
      } catch (e) {}
    }
    const defaultRes = { ...SAMPLE_RESUME, id: `resume-${Date.now()}` };
    return [defaultRes];
  });
  
  // UI States
  const [activeTab, setActiveTab] = useState<"form" | "style">("form");
  const [isExporting, setIsExporting] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState<number>(0.9); // scale zoom for preview
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit"); // mobile responsive toggle
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Save changes locally
  const handleResumeChange = (updated: ResumeData) => {
    setActiveResume(updated);
    localStorage.setItem("active_resume", JSON.stringify(updated));
    
    // Keep local list synchronized with edits
    const updatedList = resumesList.map((res) => (res.id === updated.id ? updated : res));
    // If the list is empty or doesn't have it, add it
    if (!updatedList.some((res) => res.id === updated.id)) {
      updatedList.unshift(updated);
    }
    setResumesList(updatedList);
    localStorage.setItem("local_resumes_list", JSON.stringify(updatedList));
  };

  // Create a brand new clean resume
  const handleCreateNewResume = () => {
    const newResume: ResumeData = {
      ...SAMPLE_RESUME,
      id: `resume-${Date.now()}`,
      title: "New Custom Resume",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: "guest",
      personalInfo: {
        fullName: "Your Name",
        title: "Your Professional Headline",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
        summary: "Write a high-impact profile summary here...",
        profileImage: ""
      },
      workExperience: [],
      education: [],
      skills: [],
      projects: []
    };
    
    setActiveResume(newResume);
    localStorage.setItem("active_resume", JSON.stringify(newResume));
    
    const updatedList = [newResume, ...resumesList];
    setResumesList(updatedList);
    localStorage.setItem("local_resumes_list", JSON.stringify(updatedList));
  };

  // Delete resume
  const handleDeleteResume = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (resumesList.length <= 1) {
      alert("You must keep at least one resume.");
      return;
    }
    
    if (confirm("Are you sure you want to delete this resume permanently?")) {
      const updatedList = resumesList.filter((res) => res.id !== id);
      setResumesList(updatedList);
      localStorage.setItem("local_resumes_list", JSON.stringify(updatedList));
      
      if (id === activeResume.id) {
        const nextActive = updatedList[0];
        setActiveResume(nextActive);
        localStorage.setItem("active_resume", JSON.stringify(nextActive));
      }
    }
  };

  // Switch resume
  const handleSelectResume = (res: ResumeData) => {
    setActiveResume(res);
    localStorage.setItem("active_resume", JSON.stringify(res));
  };

  // High-fidelity One-Click PDF Export using jsPDF and html2canvas
  const handleExportPdf = async () => {
    const element = document.getElementById("resume-canvas");
    if (!element) return;

    setIsExporting(true);
    try {
      // Resolve background color if it contains oklch
      let bgColor = activeResume.themeConfig.colors.background;
      if (bgColor && bgColor.includes("oklch")) {
        try {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = 1;
          tempCanvas.height = 1;
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.fillStyle = bgColor;
            const resolved = tempCtx.fillStyle;
            if (typeof resolved === "string" && resolved !== "#000000" && !resolved.includes("oklch")) {
              bgColor = resolved;
            }
          }
        } catch (e) {
          // fallback
        }
      }

      // Temporarily scale canvas layout to standard A4 pixels for pixel-perfect screenshot rendering
      const opt = {
        scale: 2, // High resolution vectors
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: bgColor,
        onclone: (clonedDoc: Document) => {
          // Resolve any oklch colors inside the cloned document before html2canvas processes it.
          // This prevents "Attempting to parse an unsupported color function oklch" error.
          const elements = clonedDoc.getElementsByTagName("*");
          const canvas = clonedDoc.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext("2d");

          const resolveColor = (colorStr: string): string => {
            if (!colorStr || !colorStr.includes("oklch")) return colorStr;
            if (!ctx) return colorStr;
            try {
              ctx.fillStyle = colorStr;
              const resolved = ctx.fillStyle;
              if (typeof resolved === "string" && resolved !== "#000000" && !resolved.includes("oklch")) {
                return resolved;
              }
            } catch (e) {
              // ignore and fallback
            }
            return colorStr;
          };

          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            if (!el.style) continue;

            try {
              const computed = window.getComputedStyle(el);
              const properties = [
                "backgroundColor",
                "color",
                "borderColor",
                "borderTopColor",
                "borderRightColor",
                "borderBottomColor",
                "borderLeftColor",
                "outlineColor",
                "fill",
                "stroke"
              ];

              properties.forEach(prop => {
                const val = computed[prop as any];
                if (val && val.includes("oklch")) {
                  const resolved = resolveColor(val);
                  if (resolved && !resolved.includes("oklch")) {
                    el.style[prop as any] = resolved;
                  }
                }
              });
            } catch (err) {
              // silent catch
            }
          }
        }
      };

      const canvas = await html2canvas(element, opt);
      const imgData = canvas.toDataURL("image/png");
      
      // Page size configuration in mm
      const sizeConfig: Record<string, { width: number; height: number; format: any }> = {
        A4: { width: 210, height: 297, format: "a4" },
        A3: { width: 297, height: 420, format: "a3" },
        B3: { width: 353, height: 500, format: [353, 500] },
        B4: { width: 250, height: 353, format: "b4" },
        Letter: { width: 215.9, height: 279.4, format: "letter" },
        Legal: { width: 215.9, height: 355.6, format: "legal" },
      };

      const selectedSize = activeResume.themeConfig.pageSize || "A4";
      const { width: pdfWidth, height: pdfHeight, format: pdfFormat } = sizeConfig[selectedSize] || sizeConfig.A4;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: pdfFormat,
      });

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeName = activeResume.personalInfo.fullName.toLowerCase().replace(/\s+/g, "_") || "resume";
      pdf.save(`${safeName}_resume.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Note: If the PDF download fails, you can use our built-in 'Print Mode' inside the toolbar. Click 'Print Mode' -> 'Print / Save to PDF' to generate a pixel-perfect, vector PDF directly from your browser's native print engine!");
    } finally {
      setIsExporting(false);
    }
  };

  if (isPrintMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col text-slate-800 antialiased font-sans printable-wrap">
        {/* Floating toolbar at the top */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50 print-hide">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="text-white text-xs font-bold tracking-wider uppercase">Dedicated Print View Mode</span>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-bold uppercase hidden sm:inline-block">Ready for Physical Printing</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-indigo-500/20"
            >
              <Download size={13} />
              <span>Print / Save to PDF</span>
            </button>
            
            <button
              onClick={() => setIsPrintMode(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
            >
              Exit Mode
            </button>
          </div>
        </div>

        {/* Centered page container */}
        <div className="flex-1 bg-slate-950 py-8 px-4 flex justify-center overflow-y-auto printable-area">
          <div className="w-full max-w-fit bg-white shadow-2xl rounded p-2 printable-card">
            <ResumePreview data={activeResume} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      
      {/* App Header control bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-black text-sm tracking-tighter">
            C
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-sm md:text-base text-gray-900">
              CURRICULA <span className="text-slate-400 font-normal">PRO</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">
              Resume Workspace
            </p>
          </div>
        </div>

        {/* Middle quick controls: active resume title */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1 rounded border border-slate-200">
          <input 
            type="text"
            value={activeResume.title}
            onChange={(e) => handleResumeChange({ ...activeResume, title: e.target.value })}
            className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-hidden min-w-[150px] text-center"
            placeholder="Untitled Resume"
          />
        </div>

        {/* Right side action buttons */}
        <div className="flex items-center gap-3">
          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-4 py-2 bg-black hover:bg-slate-800 disabled:bg-slate-600 text-white text-xs font-semibold rounded hover:shadow-xs transition-colors uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
            id="header-export-btn"
          >
            {isExporting ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download size={12} />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace split */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Mobile View Toggles (Visible only on mobile) */}
        <div className="md:hidden flex bg-white border-b border-gray-100 p-2 z-10 sticky top-[69px]">
          <button
            onClick={() => setMobileView("edit")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileView === "edit" ? "bg-slate-800 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Form Details
          </button>
          <button
            onClick={() => setMobileView("preview")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileView === "preview" ? "bg-slate-800 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Live Preview
          </button>
        </div>

        {/* Left Side: Resumes List Sidebar index + Active editing form */}
        <div 
          className={`w-full md:w-[45%] lg:w-[40%] xl:w-[35%] bg-white border-r border-gray-100 flex flex-col shrink-0 md:flex ${
            mobileView === "edit" ? "block" : "hidden"
          }`}
        >
          {/* Quick Resumes switcher row */}
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Resumes ({resumesList.length})</span>
            <button 
              onClick={handleCreateNewResume}
              className="text-xs text-slate-900 hover:text-black font-bold flex items-center gap-0.5 uppercase tracking-wider cursor-pointer"
              id="create-resume-btn"
            >
              <Plus size={12} /> Add New
            </button>
          </div>

          {resumesList.length > 1 && (
            <div className="px-4 py-2.5 flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-slate-50/50 no-scrollbar select-none">
              {resumesList.map((res) => (
                <button
                  key={res.id}
                  onClick={() => handleSelectResume(res)}
                  className={`px-3 py-1.5 rounded border text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeResume.id === res.id 
                      ? "bg-black border-black text-white shadow-xs" 
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <FileText size={12} />
                  <span className="truncate max-w-[120px]">{res.title}</span>
                  {activeResume.id !== res.id && (
                    <span 
                      onClick={(e) => handleDeleteResume(res.id, e)}
                      className="p-0.5 rounded-full hover:bg-red-500 hover:text-white transition-all ml-1 shrink-0 text-gray-400"
                    >
                      <Trash2 size={10} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Dual tab controller (Form vs Theme Config) */}
          <div className="flex border-b border-slate-200 bg-white">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "form" 
                  ? "border-black text-black" 
                  : "border-transparent text-slate-400 hover:text-slate-800 hover:border-slate-200"
              }`}
              id="tab-form-btn"
            >
              <Settings size={12} />
              Resume Content
            </button>
            <button
              onClick={() => setActiveTab("style")}
              className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "style" 
                  ? "border-black text-black" 
                  : "border-transparent text-slate-400 hover:text-slate-800 hover:border-slate-200"
              }`}
              id="tab-style-btn"
            >
              <Palette size={12} />
              AI Themes & Layouts
            </button>
          </div>

          {/* Workspace left panel views */}
          <div className="flex-1 p-4 md:p-5 overflow-hidden flex flex-col bg-slate-50/30">
            {activeTab === "form" ? (
              <ResumeForm 
                data={activeResume} 
                onChange={handleResumeChange} 
              />
            ) : (
              <ThemeCustomizer
                config={activeResume.themeConfig}
                templateId={activeResume.templateId}
                onChangeTheme={(theme) => handleResumeChange({ ...activeResume, themeConfig: theme })}
                onChangeTemplate={(tplId) => handleResumeChange({ ...activeResume, templateId: tplId })}
              />
            )}
          </div>
        </div>

        {/* Right Side: High-fidelity Real-Time Preview Area */}
        <div 
          className={`flex-1 bg-slate-200 p-4 md:p-8 overflow-y-auto flex flex-col items-center relative ${
            mobileView === "preview" ? "block" : "hidden md:flex"
          }`}
        >
          {/* Zoom & utility bar for preview */}
          <div className="w-full max-w-[21cm] flex items-center justify-between mb-4 select-none flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border px-3 py-1.5 rounded-xl shadow-xs text-xs font-bold text-gray-600">
                <Eye size={13} className="text-blue-500" />
                <span>Real-Time Visualizer</span>
              </div>
              
              <button
                onClick={() => setIsPrintMode(true)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs text-xs font-bold text-slate-700 cursor-pointer transition-all hover:text-black hover:border-slate-400"
                title="Enter physical physical A4/A3 layout printing mode"
              >
                <FileText size={13} className="text-indigo-500 animate-pulse" />
                <span>Print Mode</span>
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white border rounded-xl shadow-xs p-1">
              <button
                onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-500 cursor-pointer transition-all"
                title="Zoom Out"
                id="zoom-out-btn"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] font-bold text-gray-500 px-2 uppercase min-w-[45px] text-center">
                {Math.round(canvasZoom * 100)}%
              </span>
              <button
                onClick={() => setCanvasZoom(Math.min(1.5, canvasZoom + 0.1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-500 cursor-pointer transition-all"
                title="Zoom In"
                id="zoom-in-btn"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>

          {/* Scalable Container stage */}
          <div 
            className="w-full flex-1 flex justify-center items-start origin-top"
            style={{ transform: `scale(${canvasZoom})` }}
          >
            <div className="w-full max-w-[21cm] transition-all duration-300">
              <ResumePreview data={activeResume} />
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}
