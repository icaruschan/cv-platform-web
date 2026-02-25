import React, { useState, useEffect } from 'react';
import { OnboardingLayout } from './components/Layout';
import { TextInput, NumberInput, TextAreaInput, FileUploadInput, SocialLinksInput, ProjectCardsInput, StylePickerInput } from './components/InputFields';
import { QUESTIONS } from './constants';
import { OnboardingData, QuestionConfig, ProjectEntry } from './types';
import { ArrowRight, Check, Loader2, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { mapOnboardingToBrief } from './lib/brief-mapper';
import { uploadProfileImage } from './lib/image-upload';
import { polishBrief } from './lib/polish';

const API_URL = import.meta.env.VITE_APP_URL || '';

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

const App: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>(INITIAL_DATA);
  const [isAnimating, setIsAnimating] = useState(false);
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' });

  // Read checkout_id from URL (set by Polar redirect)
  const [checkoutId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('checkout_id');
  });

  const currentQuestion: QuestionConfig = QUESTIONS[currentStepIndex];
  const isLastStep = currentStepIndex === QUESTIONS.length - 1;

  const handleSubmit = async () => {
    try {
      // Step 1: Upload profile image
      setSubmission({ status: 'uploading-image' });
      let profileImageUrl: string | null = null;
      if (formData.heroImage) {
        profileImageUrl = await uploadProfileImage(formData.heroImage, formData.email);
      }

      // Step 2: Map form data → Brief
      const rawBrief = mapOnboardingToBrief(formData, profileImageUrl);

      // Step 3: Polish with AI
      setSubmission({ status: 'polishing' });
      const brief = await polishBrief(rawBrief);

      // Step 4: Submit to /api/generate
      setSubmission({ status: 'submitting' });
      const res = await fetch(`${API_URL}/api/generate`, {
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
    // Validation
    if (currentQuestion.required) {
      const val = formData[currentQuestion.key];

      // Projects: at least 1 card with name + role filled
      if (currentQuestion.key === 'projects') {
        const projects = val as ProjectEntry[];
        const hasValidProject = projects.some((p) => p.name.trim() && p.role.trim());
        if (!hasValidProject) {
          alert('Please add at least one project with a name and role.');
          return;
        }
      }
      // Socials: at least one link filled
      else if (currentQuestion.key === 'socials') {
        const socials = val as any;
        const hasAtLeastOne = socials && Object.values(socials).some((v: any) => v && v.toString().trim());
        if (!hasAtLeastOne) {
          alert('Please add at least one social link.');
          return;
        }
      }
      // Primitive fields
      else if (typeof val !== 'object' && (val === '' || val === null || val === undefined)) {
        alert('Please fill out this field to continue.');
        return;
      }
    }

    if (isLastStep) {
      handleSubmit();
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const updateField = (val: any) => {
    setFormData((prev) => ({
      ...prev,
      [currentQuestion.key]: val,
    }));
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
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center px-8 space-y-8">

          {/* Loading States */}
          {(submission.status === 'uploading-image' ||
            submission.status === 'polishing' ||
            submission.status === 'submitting') && (
              <>
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Building Your Portfolio
                  </h2>
                  <div className="space-y-2">
                    <ProgressStep
                      label="Uploading profile image"
                      done={submission.status !== 'uploading-image'}
                      active={submission.status === 'uploading-image'}
                    />
                    <ProgressStep
                      label="Polishing your content"
                      done={submission.status === 'submitting'}
                      active={submission.status === 'polishing'}
                    />
                    <ProgressStep
                      label="Launching the AI pipeline"
                      done={false}
                      active={submission.status === 'submitting'}
                    />
                  </div>
                </div>
              </>
            )}

          {/* Success */}
          {submission.status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  You're All Set! 🎉
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  Your AI portfolio is being generated right now. It typically takes 2-3 minutes.
                  We'll also send you a link via email.
                </p>
              </div>
              <a
                href={submission.magicLink}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                Watch Progress
                <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            </>
          )}

          {/* Error */}
          {submission.status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Something Went Wrong
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  {submission.message}
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmission({ status: 'idle' });
                  handleSubmit();
                }}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
              <button
                onClick={() => setSubmission({ status: 'idle' })}
                className="block mx-auto mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Back to form
              </button>
            </>
          )}
        </div>
      </div>
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
      leftPanelContent={currentQuestion.illustration}
    >
      <div
        className={`h-full flex flex-col justify-center transition-all duration-300 ease-out ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
      >
        <div className="flex-grow flex flex-col justify-center space-y-8">

          {/* Question Header */}
          <div className="space-y-4 animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {currentQuestion.title}
            </h1>
            <p className="text-lg text-gray-500 font-normal leading-relaxed max-w-xl">
              {currentQuestion.subtitle}
            </p>
          </div>

          {/* Input Area */}
          <div className="w-full animate-fade-in delay-100">
            {renderInput()}

            {currentQuestion.helperText && (
              <p className="mt-3 text-sm text-gray-400">
                {currentQuestion.helperText}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-8 flex items-center justify-between mt-4">
            {!currentQuestion.required ? (
              <button
                onClick={handleNext}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium px-2 py-2 transition-colors"
              >
                Skip for now
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={handleNext}
              className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-neutral-900 rounded-xl hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 active:scale-95"
            >
              {isLastStep ? 'Finish Setup' : 'Continue'}
              {isLastStep ? (
                <Check className="w-5 h-5 ml-2" />
              ) : (
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              )}
            </button>
          </div>

        </div>
      </div>
    </OnboardingLayout>
  );
};

/** Progress step indicator for the submission overlay */
const ProgressStep: React.FC<{ label: string; done: boolean; active: boolean }> = ({ label, done, active }) => (
  <div className={`flex items-center gap-3 py-1.5 transition-all duration-300 ${active ? 'text-orange-600' : done ? 'text-green-600' : 'text-gray-300'}`}>
    {done ? (
      <Check className="w-4 h-4 flex-shrink-0" />
    ) : active ? (
      <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
    ) : (
      <div className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0" />
    )}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default App;
