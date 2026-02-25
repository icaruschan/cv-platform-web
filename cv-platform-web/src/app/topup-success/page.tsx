'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function TopUpSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    const token = searchParams.get('token');
    const projectId = searchParams.get('project');

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Redirect back to editor
                    if (token && projectId) {
                        router.push(`/project/${projectId}?token=${token}`);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [token, projectId, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
                >
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    🎉 Credits Added!
                </h1>

                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    You've successfully purchased <span className="font-bold text-green-600 dark:text-green-400">5 more revision credits</span>.
                    Keep perfecting your portfolio!
                </p>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Redirecting you back to the editor in <span className="font-bold text-green-600 dark:text-green-400">{countdown}</span>s
                    </p>
                </div>

                <button
                    onClick={() => token && projectId && router.push(`/project/${projectId}?token=${token}`)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    or click here to return now →
                </button>
            </motion.div>
        </div>
    );
}

export default function TopUpSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <p className="text-gray-500">Loading...</p>
            </div>
        }>
            <TopUpSuccessContent />
        </Suspense>
    );
}
