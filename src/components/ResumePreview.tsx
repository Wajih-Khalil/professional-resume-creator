import { ResumeData } from "../types";
import { getFontClass, formatDate } from "../lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const { personalInfo, workExperience, education, skills, projects, themeConfig, templateId } = data;
  const { colors, fontSans, fontDisplay, fontMono, fontSize, spacing } = themeConfig;

  // Page Sizes Map
  const pageSizesMap = {
    A4: "max-w-[21cm] min-h-[29.7cm]",
    A3: "max-w-[29.7cm] min-h-[42cm]",
    B3: "max-w-[35.3cm] min-h-[50cm]",
    B4: "max-w-[25cm] min-h-[35.3cm]",
    Letter: "max-w-[21.59cm] min-h-[27.94cm]",
    Legal: "max-w-[21.59cm] min-h-[35.56cm]",
  };
  const activePageSizeClass = pageSizesMap[themeConfig.pageSize || "A4"] || pageSizesMap.A4;

  // Resolve fonts
  const bodyFont = getFontClass(fontSans);
  const displayFont = getFontClass(fontDisplay);
  const monoFont = getFontClass(fontMono);

  // Text sizes
  const sizeMap = {
    sm: { body: "text-xs", h1: "text-2xl", h2: "text-base", h3: "text-xs" },
    base: { body: "text-sm", h1: "text-3xl", h2: "text-lg", h3: "text-sm" },
    lg: { body: "text-base", h1: "text-4xl", h2: "text-xl", h3: "text-base" },
  };
  const sizes = sizeMap[fontSize] || sizeMap.base;

  // Spacing sizes
  const spacingMap = {
    compact: { gapY: "space-y-2", sectionGap: "space-y-3", itemGap: "space-y-1.5", padY: "py-2" },
    normal: { gapY: "space-y-4", sectionGap: "space-y-5", itemGap: "space-y-3", padY: "py-4" },
    relaxed: { gapY: "space-y-6", sectionGap: "space-y-7", itemGap: "space-y-4", padY: "py-6" },
  };
  const spacings = spacingMap[spacing] || spacingMap.normal;

  // Render contacts list helper
  const renderContactItem = (icon: any, text: string, href?: string) => {
    if (!text) return null;
    const content = (
      <span className="inline-flex items-center gap-1">
        {icon}
        <span className="truncate">{text}</span>
      </span>
    );
    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
          {content}
        </a>
      );
    }
    return content;
  };

  const contactIconsSize = 13;

  // Shared inner components

  // Work experience block
  const renderWorkExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <div className={spacings.sectionGap}>
        <h2 
          className={`${displayFont} ${sizes.h2} font-bold border-b pb-1 flex items-center justify-between`}
          style={{ color: colors.primary, borderColor: colors.border }}
        >
          Professional Experience
        </h2>
        <div className={spacings.gapY}>
          {workExperience.map((exp) => (
            <div key={exp.id} className={spacings.itemGap}>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                <div>
                  <h3 className={`${bodyFont} font-bold text-gray-900 ${sizes.h3}`} style={{ color: colors.textPrimary }}>
                    {exp.role}
                  </h3>
                  <div className="text-gray-700 font-medium" style={{ color: colors.textSecondary }}>
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                </div>
                <div className="text-xs font-semibold text-gray-500 shrink-0" style={{ color: colors.textSecondary }}>
                  {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                </div>
              </div>
              {exp.description && exp.description.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
                  {exp.description.map((bullet, idx) => (
                    <li key={idx} className={`${bodyFont} ${sizes.body} leading-relaxed align-top`}>
                      <span className="relative -left-1 text-gray-700" style={{ color: colors.textSecondary }}>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Education block
  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <div className={spacings.sectionGap}>
        <h2 
          className={`${displayFont} ${sizes.h2} font-bold border-b pb-1`}
          style={{ color: colors.primary, borderColor: colors.border }}
        >
          Education
        </h2>
        <div className={spacings.gapY}>
          {education.map((edu) => (
            <div key={edu.id} className="flex flex-col sm:flex-row sm:items-baseline justify-between">
              <div>
                <h3 className={`${bodyFont} font-bold text-gray-900 ${sizes.h3}`} style={{ color: colors.textPrimary }}>
                  {edu.degree} in {edu.fieldOfStudy}
                </h3>
                <div className="text-gray-700" style={{ color: colors.textSecondary }}>
                  {edu.school} {edu.location && `• ${edu.location}`}
                </div>
                {edu.description && (
                  <p className={`${bodyFont} ${sizes.body} mt-1 text-gray-600 italic`} style={{ color: colors.textSecondary }}>
                    {edu.description}
                  </p>
                )}
              </div>
              <div className="text-xs font-semibold text-gray-500 shrink-0" style={{ color: colors.textSecondary }}>
                {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Skills block
  const renderSkills = (asGrid = false) => {
    if (!skills || skills.length === 0) return null;
    return (
      <div className={spacings.sectionGap}>
        <h2 
          className={`${displayFont} ${sizes.h2} font-bold border-b pb-1`}
          style={{ color: colors.primary, borderColor: colors.border }}
        >
          Skills
        </h2>
        <div className={asGrid ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-2"}>
          {skills.map((group) => (
            <div key={group.id} className="text-gray-700">
              <span className={`${bodyFont} font-bold mr-2 text-xs uppercase tracking-wider`} style={{ color: colors.textPrimary }}>
                {group.category}:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {group.skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className={`${bodyFont} text-xs px-2 py-0.5 rounded-md border font-medium`}
                    style={{ 
                      backgroundColor: `${colors.accent}15`, 
                      color: colors.primary, 
                      borderColor: `${colors.primary}20` 
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Projects block
  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <div className={spacings.sectionGap}>
        <h2 
          className={`${displayFont} ${sizes.h2} font-bold border-b pb-1`}
          style={{ color: colors.primary, borderColor: colors.border }}
        >
          Projects
        </h2>
        <div className={spacings.gapY}>
          {projects.map((proj) => (
            <div key={proj.id} className={spacings.itemGap}>
              <div className="flex items-baseline justify-between">
                <h3 className={`${bodyFont} font-bold text-gray-900 ${sizes.h3}`} style={{ color: colors.textPrimary }}>
                  {proj.name}
                </h3>
                {proj.url && (
                  <a 
                    href={proj.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs hover:underline" 
                    style={{ color: colors.primary }}
                  >
                    View Project
                  </a>
                )}
              </div>
              <p className={`${bodyFont} ${sizes.body} text-gray-600 leading-relaxed`} style={{ color: colors.textSecondary }}>
                {proj.description}
              </p>
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {proj.technologies.map((tech, idx) => (
                    <span 
                      key={idx} 
                      className={`${monoFont} text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };


  // TEMPLATE 1: CLASSIC (academic/professional)
  if (templateId === "classic") {
    return (
      <div 
        id="resume-canvas"
        className={`w-full h-full bg-white print-shadow-none p-8 md:p-12 shadow-md ${activePageSizeClass} mx-auto relative transition-all duration-300 select-text`}
        style={{ backgroundColor: colors.background }}
      >
        <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b" style={{ borderColor: colors.border }}>
          {personalInfo.profileImage && (
            <img 
              src={personalInfo.profileImage} 
              alt={personalInfo.fullName} 
              className="w-24 h-24 rounded-full object-cover border-2 shadow-sm"
              style={{ borderColor: colors.primary }}
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <h1 className={`${displayFont} ${sizes.h1} font-extrabold tracking-tight`} style={{ color: colors.primary }}>
              {personalInfo.fullName}
            </h1>
            {personalInfo.title && (
              <div className={`${bodyFont} text-md font-medium uppercase tracking-widest mt-1`} style={{ color: colors.secondary }}>
                {personalInfo.title}
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600 max-w-2xl font-medium" style={{ color: colors.textSecondary }}>
            {renderContactItem(<Mail size={contactIconsSize} />, personalInfo.email, `mailto:${personalInfo.email}`)}
            {renderContactItem(<Phone size={contactIconsSize} />, personalInfo.phone)}
            {renderContactItem(<MapPin size={contactIconsSize} />, personalInfo.location)}
            {renderContactItem(<Globe size={contactIconsSize} />, personalInfo.website, personalInfo.website)}
            {renderContactItem(<Linkedin size={contactIconsSize} />, personalInfo.linkedin, personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`)}
            {renderContactItem(<Github size={contactIconsSize} />, personalInfo.github, personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`)}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {personalInfo.summary && (
            <div className={spacings.sectionGap}>
              <p className={`${bodyFont} ${sizes.body} text-center leading-relaxed italic max-w-3xl mx-auto`} style={{ color: colors.textSecondary }}>
                "{personalInfo.summary}"
              </p>
            </div>
          )}
          {renderWorkExperience()}
          {renderEducation()}
          {renderSkills(true)}
          {renderProjects()}
        </div>
      </div>
    );
  }

  // TEMPLATE 2: MODERN (sleek left layout)
  if (templateId === "modern") {
    return (
      <div 
        id="resume-canvas"
        className={`w-full h-full bg-white print-shadow-none shadow-md ${activePageSizeClass} mx-auto relative transition-all duration-300 overflow-hidden select-text`}
        style={{ backgroundColor: colors.background }}
      >
        {/* Modern colored banner top */}
        <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ backgroundColor: `${colors.primary}08`, borderBottom: `4px solid ${colors.primary}` }}>
          <div className="flex items-center gap-5">
            {personalInfo.profileImage && (
              <img 
                src={personalInfo.profileImage} 
                alt={personalInfo.fullName} 
                className="w-20 h-20 rounded-xl object-cover border shadow-sm shrink-0"
                style={{ borderColor: colors.primary }}
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <h1 className={`${displayFont} ${sizes.h1} font-extrabold tracking-tight`} style={{ color: colors.primary }}>
                {personalInfo.fullName}
              </h1>
              {personalInfo.title && (
                <div className={`${bodyFont} text-sm font-semibold tracking-wider uppercase mt-1`} style={{ color: colors.secondary }}>
                  {personalInfo.title}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 max-w-sm font-medium shrink-0" style={{ color: colors.textSecondary }}>
            {renderContactItem(<Mail size={contactIconsSize} className="text-gray-400" />, personalInfo.email, `mailto:${personalInfo.email}`)}
            {renderContactItem(<Phone size={contactIconsSize} className="text-gray-400" />, personalInfo.phone)}
            {renderContactItem(<MapPin size={contactIconsSize} className="text-gray-400" />, personalInfo.location)}
            {renderContactItem(<Globe size={contactIconsSize} className="text-gray-400" />, personalInfo.website, personalInfo.website)}
            {renderContactItem(<Linkedin size={contactIconsSize} className="text-gray-400" />, personalInfo.linkedin, personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`)}
            {renderContactItem(<Github size={contactIconsSize} className="text-gray-400" />, personalInfo.github, personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`)}
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-6">
          {personalInfo.summary && (
            <div className={spacings.sectionGap}>
              <p className={`${bodyFont} ${sizes.body} leading-relaxed font-normal`} style={{ color: colors.textSecondary }}>
                {personalInfo.summary}
              </p>
            </div>
          )}
          {renderWorkExperience()}
          {renderEducation()}
          {renderSkills(false)}
          {renderProjects()}
        </div>
      </div>
    );
  }

  // TEMPLATE 3: SIDEBAR (split 2-column)
  if (templateId === "sidebar") {
    return (
      <div 
        id="resume-canvas"
        className={`w-full h-full bg-white print-shadow-none shadow-md ${activePageSizeClass} mx-auto relative transition-all duration-300 flex flex-col md:flex-row overflow-hidden select-text`}
        style={{ backgroundColor: colors.background }}
      >
        {/* Left column / Sidebar */}
        <div 
          className="w-full md:w-[32%] p-6 md:p-8 flex flex-col space-y-6 text-white shrink-0"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            {personalInfo.profileImage ? (
              <img 
                src={personalInfo.profileImage} 
                alt={personalInfo.fullName} 
                className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center font-bold text-xl uppercase tracking-wider">
                {personalInfo.fullName.split(" ").map(n => n[0]).join("")}
              </div>
            )}
            <div>
              <h1 className={`${displayFont} text-xl md:text-2xl font-extrabold tracking-tight text-white`}>
                {personalInfo.fullName}
              </h1>
              {personalInfo.title && (
                <div className={`${bodyFont} text-[11px] font-semibold uppercase tracking-wider text-white/80 mt-1`}>
                  {personalInfo.title}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Contacts */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className={`${displayFont} text-xs font-bold uppercase tracking-widest text-white/60`}>Contact</h3>
            <div className="flex flex-col space-y-2.5 text-xs text-white/90">
              {renderContactItem(<Mail size={12} className="shrink-0" />, personalInfo.email, `mailto:${personalInfo.email}`)}
              {renderContactItem(<Phone size={12} className="shrink-0" />, personalInfo.phone)}
              {renderContactItem(<MapPin size={12} className="shrink-0" />, personalInfo.location)}
              {renderContactItem(<Globe size={12} className="shrink-0" />, personalInfo.website, personalInfo.website)}
              {renderContactItem(<Linkedin size={12} className="shrink-0" />, personalInfo.linkedin, personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`)}
              {renderContactItem(<Github size={12} className="shrink-0" />, personalInfo.github, personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`)}
            </div>
          </div>

          {/* Sidebar Skills */}
          {skills && skills.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h3 className={`${displayFont} text-xs font-bold uppercase tracking-widest text-white/60`}>Core Skills</h3>
              <div className="space-y-3">
                {skills.map((group) => (
                  <div key={group.id} className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-white/70 tracking-wider">{group.category}</div>
                    <div className="flex flex-wrap gap-1">
                      {group.skills.map((skill, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column / Main info */}
        <div className="flex-1 p-6 md:p-8 space-y-6">
          {personalInfo.summary && (
            <div className="space-y-2">
              <h2 
                className={`${displayFont} ${sizes.h2} font-bold border-b pb-1`}
                style={{ color: colors.primary, borderColor: colors.border }}
              >
                Profile Summary
              </h2>
              <p className={`${bodyFont} ${sizes.body} leading-relaxed`} style={{ color: colors.textSecondary }}>
                {personalInfo.summary}
              </p>
            </div>
          )}
          {renderWorkExperience()}
          {renderEducation()}
          {renderProjects()}
        </div>
      </div>
    );
  }

  // TEMPLATE 4: MINIMAL (clean executive)
  return (
    <div 
      id="resume-canvas"
      className={`w-full h-full bg-white print-shadow-none p-10 md:p-14 shadow-md ${activePageSizeClass} mx-auto relative transition-all duration-300 select-text`}
      style={{ backgroundColor: colors.background }}
    >
      <div className="space-y-8">
        
        {/* Header Block */}
        <div className="border-b pb-6" style={{ borderColor: colors.border }}>
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
            <div>
              <h1 className={`${displayFont} text-3xl font-black tracking-tight text-slate-900 uppercase`} style={{ color: colors.textPrimary }}>
                {personalInfo.fullName}
              </h1>
              {personalInfo.title && (
                <div className={`${bodyFont} text-xs font-bold uppercase tracking-widest mt-1`} style={{ color: colors.primary }}>
                  {personalInfo.title}
                </div>
              )}
            </div>

            {/* Optional profile image for minimal theme */}
            {personalInfo.profileImage && (
              <img 
                src={personalInfo.profileImage} 
                alt={personalInfo.fullName} 
                className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          {/* Clean Contact Details Row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium mt-4">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <span className="text-slate-300">•</span>
                <a href={`mailto:${personalInfo.email}`} className="hover:underline">{personalInfo.email}</a>
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <span className="text-slate-300">•</span>
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <span className="text-slate-300">•</span>
                <span>{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.website && (
              <span className="flex items-center gap-1">
                <span className="text-slate-300">•</span>
                <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{personalInfo.website.replace(/^https?:\/\//, "")}</a>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <span className="text-slate-300">•</span>
                <a href={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
              </span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1">
                <span className="text-slate-300">•</span>
                <a href={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
              </span>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        {personalInfo.summary && (
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="sm:w-1/4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
              Profile
            </div>
            <div className="sm:w-3/4">
              <p className={`${bodyFont} ${sizes.body} leading-relaxed text-slate-600 font-medium italic`} style={{ color: colors.textSecondary }}>
                "{personalInfo.summary}"
              </p>
            </div>
          </div>
        )}

        {/* Work Experience */}
        {workExperience && workExperience.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="sm:w-1/4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
              Experience
            </div>
            <div className="sm:w-3/4 space-y-6">
              {workExperience.map((exp) => (
                <div key={exp.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div>
                      <h3 className={`${bodyFont} font-bold text-slate-900 ${sizes.h3}`} style={{ color: colors.textPrimary }}>
                        {exp.role}
                      </h3>
                      <div className="text-[12px] font-semibold text-slate-500" style={{ color: colors.textSecondary }}>
                        {exp.company} {exp.location && `• ${exp.location}`}
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                      {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="space-y-1.5 pl-0">
                      {exp.description.map((bullet, idx) => (
                        <li key={idx} className={`${bodyFont} ${sizes.body} leading-relaxed text-slate-600 flex items-start gap-2`} style={{ color: colors.textSecondary }}>
                          <span className="text-slate-300 mt-1.5 shrink-0 text-[8px]">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Background */}
        {education && education.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="sm:w-1/4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
              Education
            </div>
            <div className="sm:w-3/4 space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <h3 className={`${bodyFont} font-bold text-slate-900 ${sizes.h3}`} style={{ color: colors.textPrimary }}>
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <div className="text-[12px] font-semibold text-slate-500" style={{ color: colors.textSecondary }}>
                      {edu.school} {edu.location && `• ${edu.location}`}
                    </div>
                    {edu.description && (
                      <p className={`${bodyFont} ${sizes.body} mt-1 text-slate-500 italic`} style={{ color: colors.textSecondary }}>
                        {edu.description}
                      </p>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                    {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills List */}
        {skills && skills.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="sm:w-1/4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
              Expertise
            </div>
            <div className="sm:w-3/4 space-y-3">
              {skills.map((group) => (
                <div key={group.id} className="text-slate-700">
                  <span className={`${bodyFont} font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1`} style={{ color: colors.textPrimary }}>
                    {group.category}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className={`${bodyFont} text-[11px] px-2 py-0.5 rounded-sm border border-slate-200 font-semibold bg-slate-50 text-slate-700`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Projects */}
        {projects && projects.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="sm:w-1/4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
              Projects
            </div>
            <div className="sm:w-3/4 space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className={`${bodyFont} font-bold text-slate-900 ${sizes.h3}`} style={{ color: colors.textPrimary }}>
                      {proj.name}
                    </h3>
                    {proj.url && (
                      <a 
                        href={proj.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[11px] font-semibold hover:underline text-slate-500 uppercase tracking-wider"
                      >
                        Link
                      </a>
                    )}
                  </div>
                  <p className={`${bodyFont} ${sizes.body} text-slate-600 leading-relaxed`} style={{ color: colors.textSecondary }}>
                    {proj.description}
                  </p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className={`${monoFont} text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase font-bold`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
