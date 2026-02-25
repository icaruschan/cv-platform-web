import React from 'react';
import { User, Lightbulb, PenTool, Layout, Monitor, Moon, BarChart3, Link as LinkIcon, AtSign, Send, Image as ImageIcon, Briefcase, Mail, Upload } from 'lucide-react';

const CardWrapper = ({ children, rotate = "-2deg", className = "" }: { children?: React.ReactNode, rotate?: string, className?: string }) => (
    <div
        className={`bg-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-white/50 relative z-10 transition-transform hover:rotate-0 duration-500 ${className}`}
        style={{ transform: `rotate(${rotate})` }}
    >
        {children}
    </div>
);

const FloatContainer = ({ children }: { children?: React.ReactNode }) => (
    <div className="relative w-full h-full flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
        {children}
    </div>
);

const BlobBackground = ({ color = "bg-purple-200/40" }) => (
    <div className={`absolute w-96 h-96 ${color} rounded-full blur-3xl -z-0`}></div>
);

// -- Specific Visuals --

export const ProfileVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <CardWrapper rotate="-3deg">
                <div className="flex items-center gap-4 w-64">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex-shrink-0 relative overflow-hidden border-2 border-white shadow-sm">
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60"
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                        <div className="h-3 bg-slate-50 rounded-full w-1/2"></div>
                    </div>
                </div>
                <div className="mt-6 flex gap-3 opacity-60">
                    <div className="h-8 bg-slate-50 rounded-lg w-20"></div>
                    <div className="h-8 bg-slate-50 rounded-lg w-20"></div>
                </div>
            </CardWrapper>
        </FloatContainer>
        <BlobBackground color="bg-orange-200/40" />

        {/* Floating Badge */}
        <div className="absolute top-[25%] right-[25%] bg-white p-3 rounded-2xl shadow-lg animate-bounce delay-1000 z-20">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
    </div>
);

export const RoleVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <CardWrapper rotate="2deg" className="!p-0 overflow-hidden w-72">
                <div className="h-24 w-full relative">
                    <img
                        src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=60"
                        alt="Workspace"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-indigo-900/10"></div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                            <Briefcase size={18} />
                        </div>
                        <div className="h-2 w-12 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-5 bg-slate-800 rounded-md w-2/3 opacity-80"></div>
                        <div className="h-2 bg-slate-100 rounded-full w-full"></div>
                        <div className="h-2 bg-slate-100 rounded-full w-4/5"></div>
                    </div>
                </div>
            </CardWrapper>
        </FloatContainer>
        <BlobBackground color="bg-indigo-200/40" />
    </div>
);

export const StatsVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <CardWrapper rotate="-2deg">
                <div className="w-64">
                    <div className="flex justify-between items-end h-32 gap-3 px-2 pb-4 border-b border-slate-50">
                        <div className="w-8 bg-slate-100 rounded-t-lg h-[40%]"></div>
                        <div className="w-8 bg-slate-100 rounded-t-lg h-[60%]"></div>
                        <div className="w-8 bg-emerald-400 rounded-t-lg h-[80%] shadow-lg shadow-emerald-200 relative group">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-100">Exp</div>
                        </div>
                        <div className="w-8 bg-slate-100 rounded-t-lg h-[55%]"></div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <div className="h-2 bg-slate-100 rounded-full flex-1"></div>
                        <div className="h-2 bg-slate-100 rounded-full flex-1"></div>
                    </div>
                </div>
            </CardWrapper>
        </FloatContainer>
        <div className="absolute top-[30%] left-[20%] bg-white p-3 rounded-xl shadow-lg animate-[pulse_3s_infinite] z-20">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
        </div>
        <BlobBackground color="bg-emerald-200/40" />
    </div>
);

export const TextVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <CardWrapper rotate="-2deg">
                <div className="w-72 p-2">
                    <div className="flex gap-4 items-start">
                        <div className="w-1.5 h-16 bg-pink-500 rounded-full mt-1"></div>
                        <div className="space-y-4 flex-1">
                            <div className="h-4 bg-slate-800 rounded-md w-full opacity-80"></div>
                            <div className="h-3 bg-slate-100 rounded-full w-3/4"></div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                            <PenTool size={14} className="text-pink-400" />
                        </div>
                    </div>
                </div>
            </CardWrapper>
        </FloatContainer>
        <BlobBackground color="bg-pink-200/40" />
    </div>
);

export const BioVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-80 transform rotate-[-3deg] transition-transform hover:rotate-0 duration-500 relative z-10 border border-white/50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shadow-inner">
                        <User size={24} />
                    </div>
                    <div className="space-y-3 flex-1">
                        <div className="h-3 bg-slate-100 rounded-full w-3/4"></div>
                        <div className="h-3 bg-slate-50 rounded-full w-1/2"></div>
                    </div>
                </div>
                <div className="space-y-4 mb-8">
                    <div className="h-2.5 bg-slate-100 rounded-full w-full"></div>
                    <div className="h-2.5 bg-slate-100 rounded-full w-full"></div>
                    <div className="h-2.5 bg-slate-100 rounded-full w-11/12"></div>
                    <div className="h-2.5 bg-slate-100 rounded-full w-4/5"></div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <div className="flex -space-x-2 pt-2">
                        <div className="w-8 h-8 rounded-full bg-orange-200 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-purple-200 border-2 border-white"></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold pt-2">Bio</span>
                </div>
            </div>
        </FloatContainer>

        <div className="absolute top-[20%] right-[20%] bg-white p-4 rounded-2xl shadow-lg animate-[bounce_3s_infinite] z-20">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
        </div>

        <BlobBackground color="bg-purple-200/40" />
    </div>
);

export const StyleVisual = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm flex flex-col gap-6 relative z-10">

            {/* Card 1 - Minimalist */}
            <div className="w-full bg-white p-2.5 rounded-2xl shadow-xl flex flex-col gap-2 transform translate-x-[-20px] rotate-[-2deg] transition-all hover:translate-x-0 hover:rotate-0 hover:scale-105 duration-500 cursor-default">
                <div className="h-32 w-full rounded-xl overflow-hidden relative">
                    <img
                        src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop&q=60"
                        alt="Minimalist"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                        Minimalist
                    </div>
                </div>
                <div className="px-2 pb-2 space-y-2 opacity-50">
                    <div className="h-2 bg-slate-200 rounded-full w-full"></div>
                    <div className="h-2 bg-slate-200 rounded-full w-2/3"></div>
                </div>
            </div>

            {/* Card 2 - Bold */}
            <div className="w-full bg-white p-2.5 rounded-2xl shadow-2xl flex flex-col gap-2 transform translate-x-[20px] rotate-[1deg] z-20 scale-110 transition-all hover:translate-x-0 hover:rotate-0 hover:scale-115 duration-500 cursor-default">
                <div className="h-32 w-full rounded-xl overflow-hidden relative">
                    <img
                        src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60"
                        alt="Bold"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                        Bold
                    </div>
                </div>
                <div className="px-2 pb-2 flex gap-2 opacity-80">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <div className="h-2 bg-slate-200 rounded-full w-1/2 mt-1"></div>
                </div>
            </div>

            {/* Card 3 - Modern */}
            <div className="w-full bg-white p-2.5 rounded-2xl shadow-xl flex flex-col gap-2 transform translate-x-[-10px] rotate-[-1deg] transition-all hover:translate-x-0 hover:rotate-0 hover:scale-105 duration-500 cursor-default">
                <div className="h-32 w-full rounded-xl overflow-hidden relative">
                    <img
                        src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&auto=format&fit=crop&q=60"
                        alt="Modern"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                        Modern
                    </div>
                </div>
                <div className="px-2 pb-2 space-y-2 opacity-50">
                    <div className="h-2 bg-slate-200 rounded-full w-3/4"></div>
                </div>
            </div>

        </div>

        <BlobBackground color="bg-orange-100/40" />
    </div>
);

export const HeroVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <CardWrapper rotate="0deg" className="w-[340px] !p-3">
                <div className="w-full aspect-video bg-slate-100 rounded-lg overflow-hidden relative mb-4 shadow-inner">
                    <img
                        src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60"
                        alt="Hero Placeholder"
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px]">
                        <div className="w-3/4 h-2 bg-white/80 rounded-full mb-2"></div>
                        <div className="w-1/2 h-2 bg-white/60 rounded-full"></div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="w-1/3 h-16 bg-slate-50 rounded-lg"></div>
                    <div className="w-1/3 h-16 bg-slate-50 rounded-lg"></div>
                    <div className="w-1/3 h-16 bg-slate-50 rounded-lg"></div>
                </div>
            </CardWrapper>
        </FloatContainer>
        <div className="absolute top-[25%] right-[15%] w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg animate-bounce z-20">
            <Upload size={20} />
        </div>
        <BlobBackground color="bg-orange-200/40" />
    </div>
);

export const SocialVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <CardWrapper rotate="-1deg">
                <div className="w-56 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-orange-100 text-orange-500' : i === 2 ? 'bg-sky-100 text-sky-500' : 'bg-pink-100 text-pink-500'}`}>
                                {i === 1 ? <AtSign size={14} /> : i === 2 ? <Send size={14} /> : <LinkIcon size={14} />}
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full w-24 opacity-60"></div>
                        </div>
                    ))}
                </div>
            </CardWrapper>
        </FloatContainer>
        <BlobBackground color="bg-sky-200/40" />
    </div>
);

export const ContactVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <CardWrapper rotate="3deg">
                <div className="w-64 flex flex-col items-center p-2">
                    <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                        <Mail size={32} />
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full w-3/4 mb-2"></div>
                    <div className="h-2 bg-slate-50 rounded-full w-1/2"></div>

                    <div className="mt-6 w-full bg-slate-50 rounded-xl p-3 flex gap-3 items-center">
                        <div className="w-8 h-8 bg-white rounded-full shadow-sm"></div>
                        <div className="h-2 bg-slate-200 rounded-full w-24"></div>
                    </div>
                </div>
            </CardWrapper>
        </FloatContainer>
        <BlobBackground color="bg-red-200/40" />
    </div>
);

export const ProjectVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <CardWrapper rotate="3deg">
                <div className="w-64 grid grid-cols-2 gap-3">
                    <div className="aspect-square bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-square bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=60" className="w-full h-full object-cover" />
                    </div>
                    <div className="col-span-2 aspect-[2/1] bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100 relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60" className="w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <ImageIcon size={18} className="text-teal-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardWrapper>
        </FloatContainer>
        <BlobBackground color="bg-teal-200/40" />
    </div>
);

export const LinkVisual = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <FloatContainer>
            <CardWrapper rotate="-2deg">
                <div className="w-64 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg"><LinkIcon size={16} /></div>
                        <div className="h-2 bg-slate-100 w-32 rounded-full"></div>
                    </div>
                    <div className="w-full h-px bg-slate-100"></div>
                    <div className="flex items-center gap-3 opacity-50">
                        <div className="p-2 bg-slate-100 text-slate-400 rounded-lg"><LinkIcon size={16} /></div>
                        <div className="h-2 bg-slate-100 w-24 rounded-full"></div>
                    </div>
                    <div className="w-full h-px bg-slate-100"></div>
                    <div className="flex items-center gap-3 opacity-30">
                        <div className="p-2 bg-slate-100 text-slate-400 rounded-lg"><LinkIcon size={16} /></div>
                        <div className="h-2 bg-slate-100 w-20 rounded-full"></div>
                    </div>
                </div>
            </CardWrapper>
        </FloatContainer>
        <BlobBackground color="bg-cyan-200/40" />
    </div>
);
