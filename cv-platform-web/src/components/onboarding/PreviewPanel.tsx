'use client';

import React from 'react';
import { OnboardingData } from './types';
import { Github, Twitter, Linkedin } from 'lucide-react';

interface PreviewPanelProps {
    data: OnboardingData;
    currentStep: number;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ data, currentStep }) => {
    // Determine style based on user selection or default
    const styleText = data.visualStyle.toLowerCase();
    const isDarkMode = styleText.includes('dark');
    const isBold = styleText.includes('bold');

    // Theme classes
    const theme = {
        bg: isDarkMode ? 'bg-slate-900' : 'bg-white',
        text: isDarkMode ? 'text-white' : 'text-slate-900',
        subtext: isDarkMode ? 'text-slate-400' : 'text-slate-500',
        card: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100',
        accent: isDarkMode ? 'text-orange-400' : 'text-orange-600',
        border: isDarkMode ? 'border-slate-800' : 'border-slate-100',
    };

    const fontClass = isBold ? 'font-sans' : 'font-serif';

    return (
        <div className={`w-full h-full p-8 flex flex-col items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>

            {/* Mock Browser/Device Container */}
            <div className={`w-full max-w-sm aspect-[9/16] md:aspect-auto md:h-[650px] rounded-[2.5rem] shadow-2xl overflow-hidden relative border-8 transition-colors duration-500 ${isDarkMode ? 'border-slate-800' : 'border-white'}`}>

                {/* Screen Content */}
                <div className={`w-full h-full overflow-y-auto ${theme.bg} ${theme.text} transition-colors duration-500`}>

                    {/* Header / Hero */}
                    <div className={`p-8 pb-4 flex flex-col items-start space-y-4`}>
                        <div className="w-full flex justify-between items-center opacity-50 mb-2">
                            <span className="text-[10px] uppercase tracking-widest">Portfolio</span>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-current"></div>
                                <div className="w-1 h-1 rounded-full bg-current"></div>
                            </div>
                        </div>

                        {/* Avatar Placeholder */}
                        <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} flex items-center justify-center overflow-hidden`}>
                            {data.socials.x ? (
                                <span className="text-xs text-center px-1 opacity-50">Img from X</span>
                            ) : (
                                <span className="text-2xl opacity-30">
                                    {data.fullName ? data.fullName[0] : '?'}
                                </span>
                            )}
                        </div>

                        {/* Name & Role */}
                        <div className="space-y-1">
                            <h2 className={`text-2xl ${fontClass} font-bold leading-tight`}>
                                {data.fullName || 'Your Name'}
                            </h2>
                            <p className={`text-sm ${theme.accent} font-medium`}>
                                {data.role || 'Professional Role'}
                            </p>
                        </div>

                        {/* Tagline */}
                        <p className={`text-sm ${theme.subtext} leading-relaxed`}>
                            {data.tagline || 'Your catchy professional tagline will appear here.'}
                        </p>

                        {/* Socials Row */}
                        <div className="flex gap-3 pt-2">
                            {data.socials.github && <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}> <Github size={14} /> </div>}
                            {data.socials.x && <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}> <Twitter size={14} /> </div>}
                            {data.socials.linkedin && <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}> <Linkedin size={14} /> </div>}
                            {/* Fallback previews if empty */}
                            {!data.socials.github && !data.socials.x && !data.socials.linkedin && (
                                <>
                                    <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} opacity-30`}> <Github size={14} /> </div>
                                    <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} opacity-30`}> <Twitter size={14} /> </div>
                                    <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} opacity-30`}> <Linkedin size={14} /> </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className={`px-8 py-6 border-y ${theme.border} flex justify-between`}>
                        <div>
                            <div className={`text-xl font-bold ${fontClass}`}>{data.experienceYears || '0'}+</div>
                            <div className="text-[10px] uppercase tracking-wider opacity-60">Years Exp</div>
                        </div>
                        <div>
                            <div className={`text-xl font-bold ${fontClass}`}>{data.projects?.filter(p => p.name).length || '0'}</div>
                            <div className="text-[10px] uppercase tracking-wider opacity-60">Projects</div>
                        </div>
                        <div>
                            <div className={`text-xl font-bold ${fontClass}`}>100%</div>
                            <div className="text-[10px] uppercase tracking-wider opacity-60">Impact</div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="p-8 space-y-3">
                        <h3 className={`text-sm font-bold uppercase tracking-wider opacity-80`}>About</h3>
                        <div className={`text-sm ${theme.subtext} leading-relaxed whitespace-pre-wrap`}>
                            {data.bio || 'This is where your professional biography will shine. Tell your story, highlight your achievements, and let people know what drives you.'}
                        </div>
                    </div>

                    {/* Projects Preview (If data exists) */}
                    {data.projects?.some(p => p.name) && (
                        <div className="p-8 pt-0 space-y-3">
                            <h3 className={`text-sm font-bold uppercase tracking-wider opacity-80`}>Selected Work</h3>
                            {data.projects.filter(p => p.name).map((proj, i) => (
                                <div key={i} className={`p-4 rounded-xl border ${theme.border} ${theme.card} ${i > 0 ? 'mt-2' : ''}`}>
                                    <div className="w-8 h-8 rounded bg-orange-500 mb-2"></div>
                                    <div className="text-xs font-bold">{proj.name}</div>
                                    <div className="text-[10px] opacity-60 mt-1">{proj.role}</div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Dynamic Label */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full z-10 pointer-events-none">
                    Live Preview
                </div>

            </div>
        </div>
    );
};
