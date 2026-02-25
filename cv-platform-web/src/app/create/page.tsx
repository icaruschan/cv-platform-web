'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CursorClick, Sparkle, Spinner, ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default function CreatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        vibe: '',
        email: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const brief = {
                personal: {
                    name: formData.name,
                    role: formData.role,
                    email: formData.email,
                    tagline: `I am a ${formData.role}`,
                    bio: `Experienced ${formData.role} ready to build.`,
                },
                socials: { twitter: "example", linkedin: "example" },
                work: [],
                style: { vibe: formData.vibe }
            };

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brief })
            });

            const data = await res.json();

            if (data.projectId) {
                router.push(`/project/${data.projectId}`);
            } else {
                alert('Error generating project');
            }
        } catch (e) {
            console.error(e);
            alert('Network Error');
        } finally {
            // setLoading(false); // keep loading while redirecting
        }
    };

    return (
        <main className="min-h-screen bg-[#faf9f7] text-neutral-900 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-orange-100 selection:text-orange-900">
            {/* Background Ambience from V2 System */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-200/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-100/40 rounded-full blur-[80px] pointer-events-none" />

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-neutral-500 hover:text-orange-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Home</span>
            </Link>

            <div className="max-w-md w-full space-y-10 relative z-10">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-50 mb-2 border border-orange-100">
                        <Sparkle className="w-7 h-7 text-orange-500" weight="fill" />
                    </div>
                    <h1 className="font-semibold tracking-tight text-4xl text-neutral-900">Create your Portfolio</h1>
                    <p className="text-lg text-neutral-500">Describe your vibe, and we'll build it.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-[2rem] shadow-2xl shadow-neutral-200/50 border border-neutral-100 relative">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Full Name</label>
                            <input
                                required
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-neutral-400 text-neutral-900"
                                placeholder="Alex Chen"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Role</label>
                            <input
                                required
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-neutral-400 text-neutral-900"
                                placeholder="Product Designer"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email (Optional)</label>
                            <input
                                type="email"
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-neutral-400 text-neutral-900"
                                placeholder="alex@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Describe your Vibe</label>
                            <textarea
                                required
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 h-28 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none resize-none transition-all placeholder:text-neutral-400 text-neutral-900 leading-relaxed"
                                placeholder="Minimalist, clean typography, lots of whitespace. Inspired by linear.app..."
                                value={formData.vibe}
                                onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-orange-600 text-white font-medium rounded-xl py-4 hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                        {loading ? (
                            <>
                                <Spinner className="w-5 h-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                Generate Project
                                <CursorClick className="w-5 h-5" weight="fill" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
