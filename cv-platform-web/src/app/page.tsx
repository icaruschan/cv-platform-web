'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CursorClick, Sparkle, Spinner } from '@phosphor-icons/react/dist/ssr';

export default function Home() {
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
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
            <Sparkle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create your Portfolio</h1>
          <p className="text-neutral-400">Describe your vibe, and we'll build it.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Full Name</label>
            <input
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Alex Chen"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Role</label>
            <input
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Product Designer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Email (Optional)</label>
            <input
              type="email"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Describe your Vibe</label>
            <textarea
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-blue-600 outline-none resize-none"
              placeholder="Minimalist, clean typography, lots of whitespace. Inspired by linear.app..."
              value={formData.vibe}
              onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-neutral-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Project
                <CursorClick className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
