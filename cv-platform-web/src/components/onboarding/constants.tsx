'use client';

import React from 'react';
import { QuestionConfig, StyleOption } from './types';
import {
    BioVisual,
    StyleVisual,
    ProfileVisual,
    RoleVisual,
    StatsVisual,
    TextVisual,
    SocialVisual,
    ContactVisual,
    ProjectVisual,
    HeroVisual
} from './Visuals';

// -- Style Picker Options --

export const STYLE_OPTIONS: StyleOption[] = [
    {
        label: 'Minimal & Clean',
        value: 'minimal',
        description: 'Clean layout, generous white space, muted palette, refined sans-serif typography, subtle dividers, calm and sophisticated feel',
        gradient: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #fafafa 100%)',
    },
    {
        label: 'Dark & Sleek',
        value: 'dark',
        description: 'Dark backgrounds, high-contrast text, glowing accents, modern monospace/geometric fonts, premium moody aesthetic',
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    },
    {
        label: 'Bold & Colorful',
        value: 'bold',
        description: 'Vibrant color palette, strong visual hierarchy, dynamic layouts, playful energy, creative and expressive',
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 33%, #48dbfb 66%, #ff9ff3 100%)',
    },
    {
        label: 'Corporate & Polished',
        value: 'corporate',
        description: 'Professional blue/navy tones, structured grid layout, formal typography, trust-building design',
        gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2980b9 100%)',
    },
    {
        label: 'Typography-focused',
        value: 'typography',
        description: 'Large hero text, editorial-style layout, serif fonts, content-first, magazine-inspired',
        gradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 40%, #dee2e6 100%)',
    },
    {
        label: 'Glassmorphism',
        value: 'glass',
        description: 'Frosted glass panels, gradient backgrounds, soft blurs, floating cards, futuristic elegance',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 50%, #a6c1ee 100%)',
    },
];

// -- Questions (reordered: Identity → Story → Work → Proof → Style → Connect) --

export const QUESTIONS: QuestionConfig[] = [
    // === IDENTITY (easy wins) ===
    {
        step: 1,
        key: 'fullName',
        title: "What is your full name?",
        subtitle: 'Use the name you want clients and visitors to know you by.',
        placeholder: 'e.g. Alex Morgan',
        inputType: 'text',
        required: true,
        illustration: <ProfileVisual />,
    },
    {
        step: 2,
        key: 'role',
        title: 'What is your professional role?',
        subtitle: 'This defines your primary expertise and tells visitors exactly what you do.',
        placeholder: 'e.g. Senior Product Designer',
        inputType: 'text',
        required: true,
        illustration: <RoleVisual />,
        suggestions: ['Product Designer', 'Frontend Engineer', 'Founder', 'Growth Marketer', 'Content Creator', 'Web3 Developer'],
    },
    {
        step: 3,
        key: 'email',
        title: "What is your email address?",
        subtitle: 'Used for contact forms and direct inquiries.',
        placeholder: 'alex@example.com',
        inputType: 'email',
        required: true,
        illustration: <ContactVisual />,
    },
    {
        step: 4,
        key: 'tagline',
        title: 'What is your short professional tagline?',
        subtitle: 'A single sentence that summarizes your value proposition or niche.',
        placeholder: 'e.g. I ghostwrite for web3 founders and creators',
        inputType: 'text',
        required: true,
        helperText: 'Keep it punchy. This is your "hook".',
        illustration: <TextVisual />,
        suggestions: ['Building the future of web3', 'Crafting pixel perfect experiences', 'Scaling startups from 0 to 1', 'Designing human-centric products'],
    },

    // === STORY (thinking) ===
    {
        step: 5,
        key: 'experienceYears',
        title: 'How many years of experience do you have?',
        subtitle: 'Numbers build trust. An approximate number is fine.',
        placeholder: 'e.g. 5',
        inputType: 'number',
        required: true,
        illustration: <StatsVisual />,
    },
    {
        step: 6,
        key: 'bio',
        title: 'Tell me about yourself',
        subtitle: 'Write a professional bio covering your background, expertise, and what drives you.',
        placeholder: "Hi, I'm a product designer with 6 years of experience crafting user-centric interfaces for fintech and SaaS startups. I previously led the design team at a Series B startup where we grew the user base from 10K to 250K. I specialize in design systems, prototyping, and turning complex workflows into simple, delightful experiences.",
        inputType: 'textarea',
        required: true,
        minHeight: 'h-48',
        illustration: <BioVisual />,
        suggestions: ['+ Add "Current Role"', '+ Add "Key Achievements"', '+ Add "Years of Experience"'],
    },

    // === WORK (portfolio content) ===
    {
        step: 7,
        key: 'projects',
        title: 'Showcase your best work',
        subtitle: 'Add your top projects — the more detail you provide, the better your portfolio will look.',
        placeholder: '',
        inputType: 'project-cards',
        required: true,
        illustration: <ProjectVisual />,
        helperText: 'Add at least 1 project. Each card should have a name and your role at minimum.',
    },

    // === PROOF (credibility, optional) ===
    {
        step: 8,
        key: 'testimonials',
        title: 'Got any testimonials or endorsements?',
        subtitle: "Paste quotes from clients, colleagues, or collaborators. This is the only optional step — but social proof really makes a difference.",
        placeholder: '"Alex transformed our onboarding — conversion jumped 35% in the first month." — Sarah Chen, CEO at FlowUp',
        inputType: 'textarea',
        required: false,
        minHeight: 'h-40',
        illustration: <TextVisual />,
    },

    // === STYLE (creative/fun) ===
    {
        step: 9,
        key: 'visualStyle',
        title: 'Pick your visual style',
        subtitle: 'Choose a style that fits your brand, then customize the description if you want.',
        placeholder: 'Select a style above or describe your own from scratch...',
        inputType: 'style-picker',
        required: true,
        minHeight: 'h-32',
        illustration: <StyleVisual />,
        styleOptions: STYLE_OPTIONS,
    },
    {
        step: 10,
        key: 'heroImage',
        title: 'Upload a hero image',
        subtitle: 'A high-quality photo of yourself or a key project to make a strong first impression.',
        placeholder: '',
        inputType: 'file',
        required: true,
        illustration: <HeroVisual />,
    },

    // === CONNECT (wrap-up) ===
    {
        step: 11,
        key: 'socials',
        title: 'Where can people find you online?',
        subtitle: 'Add your social media profiles so visitors can connect with you.',
        placeholder: '',
        inputType: 'social-multi',
        required: true,
        illustration: <SocialVisual />,
    },
];
