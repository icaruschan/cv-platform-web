import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Lightning, X, ShieldCheck } from '@phosphor-icons/react/dist/ssr';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    if (!isOpen) return null;

    const handleTopUp = () => {
        window.location.href = `/api/topup?token=${token}`;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden relative border border-transparent dark:border-neutral-800"
                >
                    {/* Decorative Background Blob matching Landing V2 */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-100/50 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100/50">
                                <Lightning className="w-6 h-6 text-orange-500" weight="fill" />
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                            >
                                <X className="w-4 h-4" weight="bold" />
                            </button>
                        </div>

                        <div className="mb-8">
                            <h2 className="font-semibold text-2xl text-neutral-900 mb-2 tracking-tight">
                                Keep Creating
                            </h2>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                Refill your revision credits to keep perfecting and expanding your portfolio with AI.
                            </p>
                        </div>

                        {/* Top-Up Card */}
                        <div className="border border-neutral-200/80 rounded-2xl p-5 bg-white mb-6 transition-all duration-300 hover:border-orange-200 hover:shadow-[0_0_20px_rgba(251,146,60,0.1)] group relative overflow-hidden">
                            {/* Inner subtle glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className="flex items-center justify-between mb-5 relative z-10">
                                <div>
                                    <h3 className="font-semibold text-neutral-900 text-[15px]">5 Credits Pack</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">Enough for major updates</p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-2xl font-bold text-neutral-900">$5</span>
                                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mt-0.5">One-Time</span>
                                </div>
                            </div>
                            <button
                                onClick={handleTopUp}
                                className="w-full py-3.5 px-4 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/20 relative z-10"
                            >
                                Top up now
                            </button>
                        </div>

                        <p className="text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5 font-medium">
                            <ShieldCheck className="w-4 h-4" weight="fill" />
                            Secure checkout via Polar
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
