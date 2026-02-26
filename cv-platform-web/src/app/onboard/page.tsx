'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, Variants, TargetAndTransition } from 'framer-motion';
import { OnboardingLayout } from '@/components/onboarding/Layout';
import { TextInput, NumberInput, TextAreaInput, FileUploadInput, SocialLinksInput, ProjectCardsInput, StylePickerInput } from '@/components/onboarding/InputFields';
import { QUESTIONS } from '@/components/onboarding/constants';
import { OnboardingData, QuestionConfig, ProjectEntry } from '@/components/onboarding/types';
import { ArrowRight, Check, Loader2, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { mapOnboardingToBrief } from '@/components/onboarding/lib/brief-mapper';
import { uploadProfileImage } from '@/components/onboarding/lib/image-upload';
import { polishBrief } from '@/components/onboarding/lib/polish';

const INITIAL_DATA: OnboardingData = {
    fullName: '',
    role: '',
    email: '',
    tagline: '',
    experienceYears: '',
    bio: '',
    projects: [{ name: '', role: '', link: '', impact: '' }],
    testimonials: '',
    visualStyle: '',
    heroImage: null,
    socials: { x: '', linkedin: '', discord: '', github: '' },
};

type SubmissionState =
    | { status: 'idle' }
    | { status: 'uploading-image' }
    | { status: 'polishing' }
    | { status: 'submitting' }
    | { status: 'success'; magicLink: string }
    | { status: 'error'; message: string };

// ─── Animation Variants ─────────────────────────────────────

const pageTransition: Variants = {
    initial: (direction: number) => ({
        x: direction > 0 ? 40 : -40,
        opacity: 0,
        filter: 'blur(2px)',
    }),
    animate: {
        x: 0,
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 500,
            damping: 35,
            mass: 0.5,
        },
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -30 : 30,
        opacity: 0,
        filter: 'blur(2px)',
        transition: {
            duration: 0.15,
            ease: [0.4, 0, 1, 1],
        },
    }),
};

const visualTransition: Variants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 22,
            delay: 0.05,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: { duration: 0.18, ease: 'easeIn' },
    },
};

const stagger: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.05,
        },
    },
};

const fadeUp: Variants = {
    initial: { opacity: 0, y: 12 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 500, damping: 30, mass: 0.5 },
    },
};

const buttonHover: TargetAndTransition = {
    scale: 1.02,
    y: -1,
    transition: { type: 'spring', stiffness: 400, damping: 17 },
};

const buttonTap: TargetAndTransition = {
    scale: 0.97,
    y: 0,
};

const overlayVariants: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 25,
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 },
    },
};

const overlayItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
};

// ─── Main Component ─────────────────────────────────────────

function OnboardContent() {
    const searchParams = useSearchParams();
    const checkoutId = searchParams.get('checkout_id');

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
    const [formData, setFormData] = useState<OnboardingData>(INITIAL_DATA);
    const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' });
    const [validationError, setValidationError] = useState<string | null>(null);

    const currentQuestion: QuestionConfig = QUESTIONS[currentStepIndex];
    const isLastStep = currentStepIndex === QUESTIONS.length - 1;

    const handleSubmit = async () => {
        try {
            setSubmission({ status: 'uploading-image' });
            let profileImageUrl: string | null = null;
            if (formData.heroImage) {
                profileImageUrl = await uploadProfileImage(formData.heroImage, formData.email);
            }

            const rawBrief = mapOnboardingToBrief(formData, profileImageUrl);

            setSubmission({ status: 'polishing' });
            const brief = await polishBrief(rawBrief);

            setSubmission({ status: 'submitting' });
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brief,
                    checkout_id: checkoutId || undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(err.error || `Server error (${res.status})`);
            }

            const result = await res.json();
            setSubmission({ status: 'success', magicLink: result.magicLink });
        } catch (err: any) {
            setSubmission({ status: 'error', message: err.message || 'Something went wrong' });
        }
    };

    const handleNext = () => {
        if (currentQuestion.required) {
            const val = formData[currentQuestion.key];
            if (currentQuestion.key === 'projects') {
                const projects = val as ProjectEntry[];
                const hasValidProject = projects.some((p) => p.name.trim() && p.role.trim());
                if (!hasValidProject) { setValidationError('Please add at least one project with a name and role.'); return; }
            } else if (currentQuestion.key === 'socials') {
                const socials = val as any;
                const hasAtLeastOne = socials && Object.values(socials).some((v: any) => v && v.toString().trim());
                if (!hasAtLeastOne) { setValidationError('Please add at least one social link.'); return; }
            } else if (typeof val !== 'object' && (val === '' || val === null || val === undefined)) {
                setValidationError('This field is required to continue.');
                return;
            }
        }

        setValidationError(null);
        if (isLastStep) { handleSubmit(); return; }
        setDirection(1);
        setCurrentStepIndex((prev) => prev + 1);
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setDirection(-1);
            setCurrentStepIndex((prev) => prev - 1);
        }
    };

    const updateField = (val: any) => {
        if (validationError) setValidationError(null); // Clear error on any input change
        setFormData((prev) => ({ ...prev, [currentQuestion.key]: val }));
    };

    const renderInput = () => {
        const commonProps = {
            value: formData[currentQuestion.key],
            onChange: updateField,
            placeholder: currentQuestion.placeholder,
            autoFocus: true,
            onEnter: handleNext,
            suggestions: currentQuestion.suggestions,
        };

        switch (currentQuestion.inputType) {
            case 'text':
            case 'email':
            case 'url':
                return <TextInput {...commonProps} />;
            case 'number':
                return <NumberInput {...commonProps} />;
            case 'textarea':
            case 'selection-card':
                return <TextAreaInput {...commonProps} minHeight={currentQuestion.minHeight} options={currentQuestion.options} />;
            case 'file':
                return <FileUploadInput value={formData[currentQuestion.key] as string | null} onChange={updateField} />;
            case 'social-multi':
                return <SocialLinksInput {...commonProps} />;
            case 'project-cards':
                return <ProjectCardsInput value={formData.projects} onChange={updateField} />;
            case 'style-picker':
                return (
                    <StylePickerInput
                        value={formData.visualStyle}
                        onChange={updateField}
                        placeholder={currentQuestion.placeholder}
                        styleOptions={currentQuestion.styleOptions}
                        minHeight={currentQuestion.minHeight}
                    />
                );
            default:
                return <TextInput {...commonProps} />;
        }
    };

    // ─── Submission Overlay ──────────────────────────────────────
    if (submission.status !== 'idle') {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    className="fixed inset-0 bg-white z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="max-w-md w-full mx-auto text-center px-8 space-y-8"
                        variants={overlayVariants}
                        initial="initial"
                        animate="animate"
                    >
                        {/* Loading States */}
                        {(submission.status === 'uploading-image' ||
                            submission.status === 'polishing' ||
                            submission.status === 'submitting') && (
                                <>
                                    <motion.div variants={overlayItem} className="relative">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                                        >
                                            <Loader2 className="w-16 h-16 text-orange-500 mx-auto" />
                                        </motion.div>
                                        <motion.div
                                            className="absolute inset-0 rounded-full"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)' }}
                                        />
                                    </motion.div>
                                    <motion.div variants={overlayItem} className="space-y-3">
                                        <h2 className="text-2xl font-bold text-gray-900">Building Your Portfolio</h2>
                                        <div className="space-y-2">
                                            <ProgressStep label="Uploading profile image" done={submission.status !== 'uploading-image'} active={submission.status === 'uploading-image'} />
                                            <ProgressStep label="Polishing your content" done={submission.status === 'submitting'} active={submission.status === 'polishing'} />
                                            <ProgressStep label="Launching the AI pipeline" done={false} active={submission.status === 'submitting'} />
                                        </div>
                                    </motion.div>
                                </>
                            )}

                        {/* Success */}
                        {submission.status === 'success' && (
                            <>
                                <motion.div variants={overlayItem}>
                                    <motion.div
                                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                                    >
                                        <Check className="w-10 h-10 text-green-600" />
                                    </motion.div>
                                </motion.div>
                                <motion.div variants={overlayItem} className="space-y-3">
                                    <h2 className="text-2xl font-bold text-gray-900">You&apos;re All Set! 🎉</h2>
                                    <p className="text-gray-500 leading-relaxed">Your AI portfolio is being generated right now. It typically takes 2-3 minutes.</p>
                                </motion.div>
                                <motion.a
                                    variants={overlayItem}
                                    href={submission.magicLink}
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors"
                                    whileHover={buttonHover}
                                    whileTap={buttonTap}
                                >
                                    Watch Progress <ExternalLink className="w-5 h-5 ml-2" />
                                </motion.a>
                            </>
                        )}

                        {/* Error */}
                        {submission.status === 'error' && (
                            <>
                                <motion.div variants={overlayItem}>
                                    <motion.div
                                        className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    >
                                        <AlertCircle className="w-10 h-10 text-red-600" />
                                    </motion.div>
                                </motion.div>
                                <motion.div variants={overlayItem} className="space-y-3">
                                    <h2 className="text-2xl font-bold text-gray-900">Something Went Wrong</h2>
                                    <p className="text-gray-500 leading-relaxed">{submission.message}</p>
                                </motion.div>
                                <motion.button
                                    variants={overlayItem}
                                    onClick={() => { setSubmission({ status: 'idle' }); handleSubmit(); }}
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-neutral-900 rounded-xl"
                                    whileHover={buttonHover}
                                    whileTap={buttonTap}
                                >
                                    <RefreshCw className="w-5 h-5 mr-2" /> Try Again
                                </motion.button>
                                <motion.button
                                    variants={overlayItem}
                                    onClick={() => setSubmission({ status: 'idle' })}
                                    className="block mx-auto mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Back to form
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // ─── Main Form ────────────────────────────────────────────────
    return (
        <OnboardingLayout
            currentStep={currentStepIndex + 1}
            totalSteps={QUESTIONS.length}
            onBack={handleBack}
            showBack={currentStepIndex > 0}
            formData={formData}
            leftPanelContent={
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`visual-${currentStepIndex}`}
                        className="w-full h-full flex items-center justify-center"
                        variants={visualTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {currentQuestion.illustration}
                    </motion.div>
                </AnimatePresence>
            }
        >
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={`step-${currentStepIndex}`}
                    custom={direction}
                    variants={pageTransition}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="h-full flex flex-col justify-center"
                >
                    <motion.div
                        className="flex-grow flex flex-col justify-center space-y-8"
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                    >
                        {/* Question Header */}
                        <motion.div className="space-y-4" variants={fadeUp}>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                {currentQuestion.title}
                            </h1>
                            <motion.p
                                className="text-lg text-gray-500 font-normal leading-relaxed max-w-xl"
                                variants={fadeUp}
                            >
                                {currentQuestion.subtitle}
                            </motion.p>
                        </motion.div>

                        {/* Input Area */}
                        <motion.div className="w-full" variants={fadeUp}>
                            {renderInput()}

                            {/* Inline validation error */}
                            <AnimatePresence mode="wait">
                                {validationError && (
                                    <motion.p
                                        key="validation-error"
                                        className="mt-3 text-sm text-red-500 font-medium flex items-center gap-1.5"
                                        initial={{ opacity: 0, y: -4, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -4, height: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
                                    >
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                        {validationError}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {currentQuestion.helperText && !validationError && (
                                <motion.p
                                    className="mt-3 text-sm text-gray-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    {currentQuestion.helperText}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div className="pt-8 flex items-center justify-between mt-4" variants={fadeUp}>
                            {!currentQuestion.required ? (
                                <motion.button
                                    onClick={handleNext}
                                    className="text-gray-400 hover:text-gray-600 text-sm font-medium px-2 py-2 transition-colors"
                                    whileHover={{ x: 3 }}
                                >
                                    Skip for now
                                </motion.button>
                            ) : (
                                <div />
                            )}

                            <motion.button
                                onClick={handleNext}
                                className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-neutral-900 rounded-xl overflow-hidden"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                            >
                                {/* Gradient shimmer on hover */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                                />
                                <span className="relative z-10 flex items-center">
                                    {isLastStep ? 'Finish Setup' : 'Continue'}
                                    {isLastStep ? (
                                        <motion.span className="ml-2" initial={{ rotate: 0 }} whileHover={{ rotate: 360 }} transition={{ duration: 0.4 }}>
                                            <Check className="w-5 h-5" />
                                        </motion.span>
                                    ) : (
                                        <motion.span className="ml-2 inline-flex" whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }}>
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.span>
                                    )}
                                </span>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </OnboardingLayout>
    );
}

/** Progress step indicator for the submission overlay */
const ProgressStep: React.FC<{ label: string; done: boolean; active: boolean }> = ({ label, done, active }) => (
    <motion.div
        className={`flex items-center gap-3 py-1.5 transition-all duration-300 ${active ? 'text-orange-600' : done ? 'text-green-600' : 'text-gray-300'}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
        {done ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Check className="w-4 h-4 flex-shrink-0" />
            </motion.div>
        ) : active ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Loader2 className="w-4 h-4 flex-shrink-0" />
            </motion.div>
        ) : (
            <div className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{label}</span>
    </motion.div>
);

export default function OnboardPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-screen flex items-center justify-center bg-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                    <Loader2 className="w-8 h-8 text-orange-500" />
                </motion.div>
            </div>
        }>
            <OnboardContent />
        </Suspense>
    );
}
