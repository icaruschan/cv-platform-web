'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Status = 'idle' | 'loading' | 'sent' | 'error';

export default function RecoverPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !email.includes('@')) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setStatus('sent');
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Failed to send. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md"
            >
                {/* Logo / Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 mb-5">
                        <span className="text-3xl">🔗</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Recover Your Portfolio
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                        Enter the email you used to create your portfolio and we'll send you a fresh access link.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#111111] border border-[#222] rounded-2xl p-6 shadow-2xl shadow-black/40">
                    <AnimatePresence mode="wait">
                        {status === 'sent' ? (
                            /* Success State */
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center py-6"
                            >
                                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">✉️</span>
                                </div>
                                <h2 className="text-lg font-semibold mb-2">Check Your Email</h2>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    If a portfolio exists for <span className="text-white font-medium">{email}</span>, you'll receive an access link shortly.
                                </p>
                                <p className="text-gray-500 text-xs">
                                    Don't see it? Check your spam folder.
                                </p>
                                <button
                                    onClick={() => {
                                        setStatus('idle');
                                        setEmail('');
                                    }}
                                    className="mt-6 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    ← Try a different email
                                </button>
                            </motion.div>
                        ) : (
                            /* Form State */
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-300 mb-1.5"
                                    >
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                    />
                                </div>

                                {/* Error */}
                                <AnimatePresence>
                                    {status === 'error' && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-red-400 text-sm"
                                        >
                                            {errorMessage}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !email.trim()}
                                    className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all active:scale-[0.98]"
                                >
                                    {status === 'loading' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Sending…
                                        </span>
                                    ) : (
                                        'Send Access Link'
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    Need help? Contact support.
                </p>
            </motion.div>
        </div>
    );
}
