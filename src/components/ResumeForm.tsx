import React, { useState } from "react";
import { ResumeData, WorkExperience, Education, SkillGroup, Project } from "../types";
import { 
  User, Briefcase, GraduationCap, Code2, FolderGit, 
  Plus, Trash2, Sparkles, ChevronDown, ChevronUp, 
  Upload, Check, RefreshCw, Eye, EyeOff, ClipboardCheck
} from "lucide-react";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (updatedData: ResumeData) => void;
}

export default function ResumeForm({ data, onChange }: ResumeFormProps) {
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // AI related states
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [suggestingFor, setSuggestingFor] = useState<{ expId: string; text: string } | null>(null);
  const [rawBulletInput, setRawBulletInput] = useState<string>("");
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [suggestedGroups, setSuggestedGroups] = useState<{ category: string; skills: string[] }[]>([]);
  const [polishingBulletId, setPolishingBulletId] = useState<string | null>(null);
  const [experienceTyping, setExperienceTyping] = useState<Record<string, string>>({});

  // Accordion toggle
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  // Profile Image upload helpers
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onChange({
        ...data,
        personalInfo: {
          ...data.personalInfo,
          profileImage: base64,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Experience Handlers
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `work-${Date.now()}`,
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: []
    };
    onChange({
      ...data,
      workExperience: [...data.workExperience, newExp]
    });
  };

  const updateExperience = (id: string, fields: Partial<WorkExperience>) => {
    onChange({
      ...data,
      workExperience: data.workExperience.map(exp => 
        exp.id === id ? { ...exp, ...fields } : exp
      )
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      workExperience: data.workExperience.filter(exp => exp.id !== id)
    });
  };

  const addBulletToExperience = (expId: string, bulletText: string) => {
    if (!bulletText.trim()) return;
    const exp = data.workExperience.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, {
        description: [...exp.description, bulletText.trim()]
      });
    }
  };

  const removeBulletFromExperience = (expId: string, idx: number) => {
    const exp = data.workExperience.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, {
        description: exp.description.filter((_, i) => i !== idx)
      });
    }
  };

  // AI Bullet Optimizer
  const runAiBulletOptimizer = async (expId: string, rawText: string, role: string, company: string) => {
    if (!rawText.trim()) return;
    setOptimizingId(expId);
    setAiSuggestions([]);
    try {
      const response = await fetch("/api/ai/optimize-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, jobTitle: role, company })
      });
      const resData = await response.json();
      if (resData.success && resData.suggestions) {
        setAiSuggestions(resData.suggestions);
        setSuggestingFor({ expId, text: rawText });
      } else {
        alert(resData.error || "Failed to generate optimized suggestions.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting AI polisher. Check server logs and key.");
    } finally {
      setOptimizingId(null);
    }
  };

  // Education Handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      school: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    };
    onChange({
      ...data,
      education: [...data.education, newEdu]
    });
  };

  const updateEducation = (id: string, fields: Partial<Education>) => {
    onChange({
      ...data,
      education: data.education.map(edu => 
        edu.id === id ? { ...edu, ...fields } : edu
      )
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter(edu => edu.id !== id)
    });
  };

  // Skill Handlers
  const addSkillGroup = () => {
    const newGroup: SkillGroup = {
      id: `skill-${Date.now()}`,
      category: "",
      skills: []
    };
    onChange({
      ...data,
      skills: [...data.skills, newGroup]
    });
  };

  const updateSkillGroup = (id: string, fields: Partial<SkillGroup>) => {
    onChange({
      ...data,
      skills: data.skills.map(group => 
        group.id === id ? { ...group, ...fields } : group
      )
    });
  };

  const removeSkillGroup = (id: string) => {
    onChange({
      ...data,
      skills: data.skills.filter(group => group.id !== id)
    });
  };

  const handleFetchSkillSuggestions = async () => {
    const title = data.personalInfo.title || "Software Engineer";
    setIsFetchingSuggestions(true);
    try {
      const response = await fetch("/api/ai/suggest-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: title }),
      });
      const resData = await response.json();
      if (resData.success && resData.suggestedGroups) {
        setSuggestedGroups(resData.suggestedGroups);
      } else {
        alert(resData.error || "Failed to fetch suggestions.");
      }
    } catch (err) {
      console.error(err);
      alert("Error getting skill suggestions.");
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleAddSuggestedGroup = (group: { category: string; skills: string[] }) => {
    const newGroup: SkillGroup = {
      id: `skill-${Date.now()}`,
      category: group.category,
      skills: group.skills
    };
    onChange({
      ...data,
      skills: [...data.skills, newGroup]
    });
    setSuggestedGroups(suggestedGroups.filter(g => g.category !== group.category));
  };

  const handlePolishExistingBullet = async (expId: string, bIdx: number, bulletText: string, jobTitle: string) => {
    setPolishingBulletId(`${expId}-${bIdx}`);
    try {
      const response = await fetch("/api/ai/polish-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: bulletText, jobTitle }),
      });
      const resData = await response.json();
      if (resData.success && resData.polishedText) {
        onChange({
          ...data,
          workExperience: data.workExperience.map(exp => {
            if (exp.id === expId) {
              const updatedBullets = [...exp.description];
              updatedBullets[bIdx] = resData.polishedText;
              return { ...exp, description: updatedBullets };
            }
            return exp;
          })
        });
      } else {
        alert(resData.error || "Failed to polish bullet point.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting AI polisher.");
    } finally {
      setPolishingBulletId(null);
    }
  };

  // Projects Handlers
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: "",
      description: "",
      url: "",
      technologies: []
    };
    onChange({
      ...data,
      projects: [...data.projects, newProj]
    });
  };

  const updateProject = (id: string, fields: Partial<Project>) => {
    onChange({
      ...data,
      projects: data.projects.map(proj => 
        proj.id === id ? { ...proj, ...fields } : proj
      )
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter(proj => proj.id !== id)
    });
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 select-none no-scrollbar">
      {/* 1. Contact / Personal Info Section */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <button
          onClick={() => toggleSection("personal")}
          className="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-all focus:outline-hidden"
          id="section-personal-btn"
        >
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-slate-50 text-slate-800 border border-slate-200 rounded">
              <User size={16} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Contact & Profile Information</span>
          </div>
          {activeSection === "personal" ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {activeSection === "personal" && (
          <div className="px-5 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 animate-fadeIn duration-200">
            {/* Image Upload Widget */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-4 py-2">
              <div className="relative">
                {data.personalInfo.profileImage ? (
                  <img 
                    src={data.personalInfo.profileImage} 
                    alt="Uploaded avatar" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-gray-400">
                    <User size={30} />
                  </div>
                )}
                {data.personalInfo.profileImage && (
                  <button
                    onClick={() => onChange({
                      ...data,
                      personalInfo: { ...data.personalInfo, profileImage: "" }
                    })}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-xs transition-all cursor-pointer"
                    title="Remove Image"
                    id="remove-image-btn"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
              
              <div 
                className={`flex-1 w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  dragActive ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("avatar-upload")?.click()}
              >
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />
                <Upload size={18} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500 font-medium">
                  <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Optional profile image (JPG, PNG)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text"
                value={data.personalInfo.fullName}
                onChange={(e) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, fullName: e.target.value }
                })}
                placeholder="Alex Rivera"
                className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Professional Title</label>
              <input 
                type="text"
                value={data.personalInfo.title}
                onChange={(e) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, title: e.target.value }
                })}
                placeholder="Senior Full-Stack Engineer"
                className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, email: e.target.value }
                })}
                placeholder="alex.rivera@example.com"
                className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text"
                value={data.personalInfo.phone}
                onChange={(e) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, phone: e.target.value }
                })}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
              <input 
                type="text"
                value={data.personalInfo.location}
                onChange={(e) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, location: e.target.value }
                })}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Personal Website</label>
              <input 
                type="text"
                value={data.personalInfo.website}
                onChange={(e) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, website: e.target.value }
                })}
                placeholder="https://alexrivera.dev"
                className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">LinkedIn URL</label>
              <input 
                type="text"
                value={data.personalInfo.linkedin}
                onChange={(e) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, linkedin: e.target.value }
                })}
                placeholder="linkedin.com/in/alex-rivera"
                className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">GitHub URL</label>
              <input 
                type="text"
                value={data.personalInfo.github}
                onChange={(e) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, github: e.target.value }
                })}
                placeholder="github.com/alexrivera"
                className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-400"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">Professional Profile Summary</label>
                <span className={`text-[10px] font-semibold ${(data.personalInfo.summary || "").length > 300 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                  {(data.personalInfo.summary || "").length} characters (Recommend &lt; 300)
                </span>
              </div>
              <textarea 
                rows={3}
                value={data.personalInfo.summary}
                onChange={(e) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, summary: e.target.value }
                })}
                placeholder="Brief summary introducing yourself, your experience, and key professional values..."
                className="w-full px-3 py-1.5 border rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Work History Section */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <button
          onClick={() => toggleSection("experience")}
          className="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-all focus:outline-hidden"
          id="section-experience-btn"
        >
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-slate-50 text-slate-800 border border-slate-200 rounded">
              <Briefcase size={16} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Work Experience</span>
          </div>
          {activeSection === "experience" ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {activeSection === "experience" && (
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-50 animate-fadeIn duration-200">
            {data.workExperience.map((exp, expIdx) => (
              <div key={exp.id} className="p-4 border rounded-xl bg-slate-50/50 space-y-3 relative group">
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 shadow-xs transition-all cursor-pointer"
                  title="Remove Experience"
                  id={`remove-work-${expIdx}-btn`}
                >
                  <Trash2 size={13} />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Company Name</label>
                    <input 
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      placeholder="TechNova Solutions"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Job Title / Role</label>
                    <input 
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      placeholder="Lead Full-Stack Engineer"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Location</label>
                    <input 
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      placeholder="San Francisco, CA"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Start Date</label>
                      <input 
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                        className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">End Date</label>
                      <input 
                        type="month"
                        disabled={exp.current}
                        value={exp.current ? "" : exp.endDate}
                        onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                        className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2 mt-1">
                    <input 
                      type="checkbox" 
                      id={`current-job-${exp.id}`}
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`current-job-${exp.id}`} className="text-xs text-gray-700 font-medium">
                      I currently work in this role
                    </label>
                  </div>
                </div>

                {/* Bullets List and Dynamic AI Assistant */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Key Accomplishments & Bullet Points</span>
                  
                  {/* Current Bullets list */}
                  {exp.description.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {exp.description.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2 bg-white px-2.5 py-1.5 border rounded-lg group/bullet">
                          <span className="text-xs text-slate-400 font-bold shrink-0">•</span>
                          <span className="text-xs text-gray-700 flex-1">{bullet}</span>
                          
                          {/* Polish Bullet Button */}
                          <button
                            type="button"
                            disabled={polishingBulletId === `${exp.id}-${bIdx}`}
                            onClick={() => handlePolishExistingBullet(exp.id, bIdx, bullet, exp.role)}
                            className="p-1 rounded text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 disabled:text-indigo-300 transition-all shrink-0 cursor-pointer"
                            title="Polish with AI"
                          >
                            {polishingBulletId === `${exp.id}-${bIdx}` ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : (
                              <Sparkles size={11} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeBulletFromExperience(exp.id, bIdx)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shrink-0 cursor-pointer rounded"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add manual bullet point */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Type new accomplishment bullet</span>
                      <span className={`text-[9px] font-semibold ${(experienceTyping[exp.id] || "").length > 150 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                        {(experienceTyping[exp.id] || "").length} characters (Recommend &lt; 150)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id={`new-bullet-${exp.id}`}
                        value={experienceTyping[exp.id] || ""}
                        onChange={(e) => setExperienceTyping({ ...experienceTyping, [exp.id]: e.target.value })}
                        placeholder="Add a dynamic accomplishment bullet point..."
                        className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = experienceTyping[exp.id] || "";
                            if (val.trim()) {
                              addBulletToExperience(exp.id, val);
                              setExperienceTyping({ ...experienceTyping, [exp.id]: "" });
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = experienceTyping[exp.id] || "";
                          if (val.trim()) {
                            addBulletToExperience(exp.id, val);
                            setExperienceTyping({ ...experienceTyping, [exp.id]: "" });
                          }
                        }}
                        className="px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* AI Bullet Polisher Section */}
                  <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                        AI Bullet Polisher
                      </div>
                      <button
                        type="button"
                        disabled={optimizingId === exp.id}
                        onClick={() => {
                          const inputVal = (document.getElementById(`new-bullet-${exp.id}`) as HTMLInputElement)?.value || "";
                          runAiBulletOptimizer(exp.id, inputVal || exp.role || "software development", exp.role, exp.company);
                        }}
                        className="text-[10px] px-2 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {optimizingId === exp.id ? (
                          <>
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            Polishing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-2.5 h-2.5" />
                            Optimize with AI
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-indigo-600/80 leading-normal mb-2">
                      Type a basic draft of your job duties in the box above or click Optimize to let Gemini build impact-focused bullets for a {exp.role || "professional"} role!
                    </p>

                    {/* AI Suggestions Box */}
                    {suggestingFor?.expId === exp.id && aiSuggestions.length > 0 && (
                      <div className="space-y-1.5 mt-2 bg-white/80 p-2.5 rounded-lg border border-indigo-100 animate-fadeIn">
                        <span className="block text-[9px] font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Generated High-Impact Suggestions:</span>
                        {aiSuggestions.map((sug, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-1.5 hover:bg-indigo-50/40 p-1.5 rounded-md transition-all group/sug">
                            <span className="text-[11px] font-bold text-indigo-500 shrink-0 mt-0.5">{sIdx + 1}</span>
                            <span className="text-[11px] text-gray-700 leading-normal flex-1 font-medium">{sug}</span>
                            <button
                              type="button"
                              onClick={() => {
                                addBulletToExperience(exp.id, sug);
                                // Remove suggestion from list
                                setAiSuggestions(aiSuggestions.filter((_, idx) => idx !== sIdx));
                              }}
                              className="text-[10px] px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded flex items-center gap-0.5 transition-all cursor-pointer opacity-0 group-hover/sug:opacity-100 shrink-0"
                            >
                              <Check size={10} />
                              Use
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addExperience}
              className="w-full py-2.5 border border-dashed border-slate-200 hover:border-black text-slate-600 hover:text-black rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer uppercase tracking-wider"
              id="add-work-btn"
            >
              <Plus size={14} />
              Add Work History
            </button>
          </div>
        )}
      </div>

      {/* 3. Educational Background Section */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <button
          onClick={() => toggleSection("education")}
          className="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-all focus:outline-hidden"
          id="section-education-btn"
        >
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-slate-50 text-slate-800 border border-slate-200 rounded">
              <GraduationCap size={16} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Educational Background</span>
          </div>
          {activeSection === "education" ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {activeSection === "education" && (
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-50 animate-fadeIn duration-200">
            {data.education.map((edu, eduIdx) => (
              <div key={edu.id} className="p-4 border rounded-xl bg-slate-50/50 space-y-3 relative">
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 shadow-xs transition-all cursor-pointer"
                  title="Remove Education"
                  id={`remove-edu-${eduIdx}-btn`}
                >
                  <Trash2 size={13} />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">School / University</label>
                    <input 
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                      placeholder="University of California, Berkeley"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Degree (e.g. B.S., M.S., MBA)</label>
                    <input 
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                      placeholder="Bachelor of Science"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Field of Study</label>
                    <input 
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                      placeholder="Computer Science"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Location</label>
                    <input 
                      type="text"
                      value={edu.location}
                      onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                      placeholder="Berkeley, CA"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Start Date</label>
                      <input 
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                        className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">End Date</label>
                      <input 
                        type="month"
                        disabled={edu.current}
                        value={edu.current ? "" : edu.endDate}
                        onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                        className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2 mt-1">
                    <input 
                      type="checkbox" 
                      id={`current-edu-${edu.id}`}
                      checked={edu.current}
                      onChange={(e) => updateEducation(edu.id, { current: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`current-edu-${edu.id}`} className="text-xs text-gray-700 font-medium">
                      I am currently enrolled here
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Details (e.g. GPA, Honors, Activities)</label>
                    <textarea 
                      rows={2}
                      value={edu.description}
                      onChange={(e) => updateEducation(edu.id, { description: e.target.value })}
                      placeholder="Graduated with Honors. Focus on Systems Engineering."
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addEducation}
              className="w-full py-2.5 border border-dashed border-slate-200 hover:border-black text-slate-600 hover:text-black rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer uppercase tracking-wider"
              id="add-edu-btn"
            >
              <Plus size={14} />
              Add Educational Degree
            </button>
          </div>
        )}
      </div>

      {/* 4. Skills Section */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <button
          onClick={() => toggleSection("skills")}
          className="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-all focus:outline-hidden"
          id="section-skills-btn"
        >
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-slate-50 text-slate-800 border border-slate-200 rounded">
              <Code2 size={16} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Professional Skills</span>
          </div>
          {activeSection === "skills" ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {activeSection === "skills" && (
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-50 animate-fadeIn duration-200">
            {/* AI Skills Assistant */}
            <div className="bg-indigo-50/40 border border-indigo-100/50 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  AI Skill Recommendation Assistant
                </div>
                {isFetchingSuggestions && <RefreshCw size={11} className="text-indigo-600 animate-spin" />}
              </div>
              <p className="text-[10px] text-indigo-600/80 leading-normal font-medium">
                Get professional skills custom-fitted for your job title: <span className="font-bold underline">{data.personalInfo.title || "Senior Software Engineer"}</span>.
              </p>
              
              <button
                type="button"
                disabled={isFetchingSuggestions}
                onClick={handleFetchSkillSuggestions}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} />
                {isFetchingSuggestions ? "Recommending skills..." : "Recommend Skills based on Job Title"}
              </button>

              {/* Display suggested groups */}
              {suggestedGroups.length > 0 && (
                <div className="pt-2.5 border-t border-indigo-100/80 space-y-2 animate-fadeIn">
                  <span className="block text-[9px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Recommended Skill Batches:</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {suggestedGroups.map((group, gIdx) => (
                      <div key={gIdx} className="bg-white p-2.5 rounded-lg border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group/rec">
                        <div className="space-y-1 flex-1">
                          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide block">{group.category}</span>
                          <div className="flex flex-wrap gap-1">
                            {group.skills.map((sk, skIdx) => (
                              <span key={skIdx} className="text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-md font-medium">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddSuggestedGroup(group)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px] flex items-center gap-0.5 transition-all cursor-pointer self-start sm:self-center shrink-0"
                        >
                          <Check size={11} />
                          Add Batch
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {data.skills.map((group, groupIdx) => (
              <div key={group.id} className="p-4 border rounded-xl bg-slate-50/50 space-y-2 relative">
                <button
                  onClick={() => removeSkillGroup(group.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 shadow-xs transition-all cursor-pointer"
                  title="Remove Group"
                  id={`remove-skill-${groupIdx}-btn`}
                >
                  <Trash2 size={13} />
                </button>

                <div className="pr-8 space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Skill Category / Group Name</label>
                    <input 
                      type="text"
                      value={group.category}
                      onChange={(e) => updateSkillGroup(group.id, { category: e.target.value })}
                      placeholder="e.g. Languages, Frameworks, Certifications"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Skills (Comma-separated or type & Enter)</label>
                    <input 
                      type="text"
                      id={`skills-input-${group.id}`}
                      placeholder="TypeScript, Python, Go"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = document.getElementById(`skills-input-${group.id}`) as HTMLInputElement;
                          const splitSkills = input.value.split(",").map(s => s.trim()).filter(Boolean);
                          if (splitSkills.length > 0) {
                            updateSkillGroup(group.id, {
                              skills: [...group.skills, ...splitSkills]
                            });
                            input.value = "";
                          }
                        }
                      }}
                    />
                  </div>

                  {group.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 bg-white p-2 rounded-lg border border-gray-100">
                      {group.skills.map((sk, skIdx) => (
                        <span 
                          key={skIdx} 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold"
                        >
                          {sk}
                          <button
                            type="button"
                            onClick={() => {
                              updateSkillGroup(group.id, {
                                skills: group.skills.filter((_, idx) => idx !== skIdx)
                              });
                            }}
                            className="text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={9} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSkillGroup}
              className="w-full py-2.5 border border-dashed border-slate-200 hover:border-black text-slate-600 hover:text-black rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer uppercase tracking-wider"
              id="add-skill-group-btn"
            >
              <Plus size={14} />
              Add Skill Category
            </button>
          </div>
        )}
      </div>

      {/* 5. Projects Section */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <button
          onClick={() => toggleSection("projects")}
          className="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-all focus:outline-hidden"
          id="section-projects-btn"
        >
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-slate-50 text-slate-800 border border-slate-200 rounded">
              <FolderGit size={16} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Projects</span>
          </div>
          {activeSection === "projects" ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {activeSection === "projects" && (
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-50 animate-fadeIn duration-200">
            {data.projects.map((proj, projIdx) => (
              <div key={proj.id} className="p-4 border rounded-xl bg-slate-50/50 space-y-3 relative">
                <button
                  onClick={() => removeProject(proj.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 shadow-xs transition-all cursor-pointer"
                  title="Remove Project"
                  id={`remove-proj-${projIdx}-btn`}
                >
                  <Trash2 size={13} />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Project Name</label>
                    <input 
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                      placeholder="e.g. DevStream Summarizer"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Project Link (Optional)</label>
                    <input 
                      type="text"
                      value={proj.url || ""}
                      onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Technologies Used (Comma separated)</label>
                    <input 
                      type="text"
                      placeholder="React, Tailwind, Node.js"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                      id={`tech-input-${proj.id}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = document.getElementById(`tech-input-${proj.id}`) as HTMLInputElement;
                          const splitTech = input.value.split(",").map(t => t.trim()).filter(Boolean);
                          if (splitTech.length > 0) {
                            updateProject(proj.id, {
                              technologies: [...proj.technologies, ...splitTech]
                            });
                            input.value = "";
                          }
                        }
                      }}
                    />
                    {proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-[10px] font-semibold text-gray-600 border">
                            {t}
                            <button
                              type="button"
                              onClick={() => {
                                updateProject(proj.id, {
                                  technologies: proj.technologies.filter((_, i) => i !== idx)
                                });
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={9} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Project Description</label>
                    <textarea 
                      rows={2}
                      value={proj.description}
                      onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                      placeholder="Detail what you built, how you built it, and any key performance achievements..."
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addProject}
              className="w-full py-2.5 border border-dashed border-slate-200 hover:border-black text-slate-600 hover:text-black rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer uppercase tracking-wider"
              id="add-project-btn"
            >
              <Plus size={14} />
              Add Project Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
